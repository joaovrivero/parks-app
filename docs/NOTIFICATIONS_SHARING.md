# Sistema de Notificações e Compartilhamento

Este documento descreve a implementação do sistema de notificações e compartilhamento no Parks App.

## 📦 Pacotes Instalados

- **expo-notifications** (~0.29.14) - Sistema de notificações locais e push
- **expo-sharing** (~13.0.1) - Sistema de compartilhamento entre apps

## 🔔 Sistema de Notificações

### Funcionalidades Implementadas

#### 1. Notificação quando alguém participa do evento
- Quando um usuário se inscreve em um evento, o criador recebe uma notificação
- Apenas notifica se o participante não for o próprio criador
- Mostra o nome do usuário que participou

**Local:** `app/event/[id]/index.tsx` - `joinEventMutation.onSuccess`

#### 2. Notificação quando alguém comenta
- Quando alguém comenta em um evento, o criador recebe uma notificação
- Exibe o nome do usuário e prévia do comentário (truncado se muito longo)
- Apenas notifica se o comentador não for o próprio criador

**Local:** `components/CommentSection.tsx` - `postCommentMutation.onSuccess`

#### 3. Lembretes de eventos próximos
- Quando um usuário se inscreve em um evento, são agendados lembretes automáticos
- Dois lembretes: 24 horas antes e 1 hora antes do evento
- Apenas agenda se o horário do lembrete for no futuro

**Local:** `app/event/[id]/index.tsx` - `joinEventMutation.onSuccess`

### Arquitetura

#### NotificationProvider (`contexts/NotificationProvider.tsx`)
- Gerencia estado global de notificações
- Solicita permissões automaticamente
- Obtém e salva Expo Push Token
- Cria canais de notificação no Android 13+
- Listeners para notificações recebidas e interações do usuário

#### Serviço de Notificações (`utils/notifications.ts`)
Funções utilitárias:
- `scheduleEventReminderNotification(event, hoursBeforeEvent)` - Agenda lembretes
- `scheduleParticipantNotification(eventTitle, eventId, participantName)` - Notifica sobre participação
- `scheduleCommentNotification(eventTitle, eventId, commenterName, commentText)` - Notifica sobre comentário
- `cancelEventNotifications(eventId)` - Cancela todas as notificações de um evento
- `getPendingNotifications()` - Lista notificações agendadas

### Configuração

#### app.json
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/icon.png",
          "color": "#10b981",
          "sounds": [],
          "enableBackgroundRemoteNotifications": true
        }
      ]
    ]
  }
}
```

#### Permissões Android
- `android.permission.RECEIVE_BOOT_COMPLETED` - Manter notificações após reinicialização
- `android.permission.SCHEDULE_EXACT_ALARM` - Agendamento preciso de alarmes

### Banco de Dados

#### Tabela expo_push_tokens
Armazena tokens de push dos usuários para notificações remotas futuras.

**Campos:**
- `id` - UUID primary key
- `user_id` - Referência para auth.users
- `token` - Token do Expo Push
- `created_at` - Data de criação
- `updated_at` - Data de atualização

**Políticas RLS:**
- Usuários podem gerenciar apenas seus próprios tokens
- Service role pode ler todos os tokens (para envio de notificações)

**Migration:** `db/create_expo_push_tokens_table.sql`

---

## 📤 Sistema de Compartilhamento

### Funcionalidades Implementadas

#### Compartilhar Evento
- Botão de compartilhamento no header da página do evento
- Compartilha informações formatadas do evento
- Inclui deep link para o app (`parksapp://event/[id]`)

**Local:** `app/event/[id]/index.tsx` - Botão no `Stack.Screen headerRight`

### Formato do Compartilhamento

```
🎉 *[Título do Evento]*

📅 Data: DD/MM/YYYY
⏰ Horário: HH:mm
📍 Local: [Endereço]

[Descrição do evento]

Veja mais detalhes e participe: parksapp://event/[id]

#ParksApp #Eventos
```

### Arquitetura

#### Utilitário de Compartilhamento (`utils/sharing.ts`)
Funções:
- `shareEvent(event)` - Compartilha um evento usando o Share API nativo
- `isSharingAvailable()` - Verifica se compartilhamento está disponível

### Compatibilidade

- ✅ Android - Funciona com todos os apps de compartilhamento
- ✅ iOS - Funciona com Share Sheet nativo
- ⚠️ Web - Requer HTTPS, suporte limitado a navegadores

---

## 🚀 Como Usar

### Testando Notificações Locais

1. Execute o app: `npm start`
2. Abra no Expo Go ou development build
3. Participe de um evento
4. As notificações de lembrete serão agendadas automaticamente

### Testando Compartilhamento

1. Abra qualquer evento no app
2. Toque no ícone de compartilhar no header
3. Escolha o app para compartilhar (WhatsApp, Instagram, etc.)

### Aplicando Migration do Banco de Dados

Execute a migration no Supabase SQL Editor:

```bash
# Copie o conteúdo de db/create_expo_push_tokens_table.sql
# e execute no SQL Editor do Supabase
```

Ou via CLI:
```bash
supabase db push
```

---

## 📝 Observações Importantes

### Notificações

1. **Notificações Locais** funcionam no Expo Go
2. **Push Notifications Remotas** requerem:
   - Development build (não funciona no Expo Go no Android SDK 53+)
   - Configuração de FCM (Android) ou APNs (iOS)
   - Servidor para enviar notificações via Expo Push API

3. **Android 13+** requer criar canal de notificação antes de solicitar permissões

4. **Permissões** são solicitadas automaticamente quando o usuário faz login

### Compartilhamento

1. **Deep Links** já estão configurados via `scheme: "parksapp"` no app.json
2. **Web** requer HTTPS para funcionar
3. O compartilhamento usa o **Share API nativo** do React Native para melhor compatibilidade

---

## 🔮 Melhorias Futuras

### Notificações

- [ ] Implementar envio de push notifications remotas via servidor
- [ ] Adicionar preferências de notificação no perfil do usuário
- [ ] Notificar quando evento está prestes a começar (para todos os participantes)
- [ ] Notificar quando evento é cancelado ou atualizado
- [ ] Rich notifications com imagem do evento

### Compartilhamento

- [ ] Gerar imagem do evento para compartilhamento
- [ ] Compartilhar diretamente para redes específicas (WhatsApp, Instagram)
- [ ] Compartilhar múltiplos eventos de uma vez
- [ ] Copiar link do evento para clipboard
- [ ] QR code para compartilhar evento offline

---

## 🐛 Troubleshooting

### Notificações não aparecem

1. Verifique se as permissões foram concedidas:
   ```typescript
   const { status } = await Notifications.getPermissionsAsync();
   console.log('Permission status:', status);
   ```

2. Verifique notificações agendadas:
   ```typescript
   const pending = await Notifications.getAllScheduledNotificationsAsync();
   console.log('Pending notifications:', pending);
   ```

3. No Android, verifique se o canal de notificação foi criado

### Compartilhamento não funciona

1. Verifique disponibilidade:
   ```typescript
   const available = await Sharing.isAvailableAsync();
   console.log('Sharing available:', available);
   ```

2. No web, certifique-se de estar usando HTTPS
3. Verifique se o dispositivo tem apps compatíveis instalados
