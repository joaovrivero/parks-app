# Requisitos Funcionais - Parks App

## 1. Introdução

Este documento especifica os requisitos funcionais do sistema Parks App, uma aplicação móvel multiplataforma (iOS/Android) para gerenciamento de eventos em parques e espaços públicos.

---

## 2. Requisitos Funcionais

### RF01 - Cadastro de Usuário

**Descrição:** O sistema deve permitir que novos usuários se cadastrem na plataforma.

**Prioridade:** Alta

**Entradas:**
- Email (obrigatório)
- Senha (obrigatório, mínimo 6 caracteres)

**Processamento:**
- Validação de formato de email
- Validação de força da senha
- Verificação de email já cadastrado
- Criação de conta no Supabase Auth
- Criação automática de perfil na tabela profiles

**Saídas:**
- Mensagem de sucesso ou erro
- Redirecionamento para tela de login

**Regras de Negócio:**
- RN01: Email deve ser único no sistema
- RN02: Senha deve ter no mínimo 6 caracteres
- RN03: Perfil é criado automaticamente após cadastro

**Casos de Uso Relacionados:** UC01

---

### RF02 - Login de Usuário

**Descrição:** O sistema deve permitir que usuários cadastrados façam login.

**Prioridade:** Alta

**Entradas:**
- Email (obrigatório)
- Senha (obrigatório)

**Processamento:**
- Autenticação via Supabase Auth
- Criação de sessão
- Armazenamento seguro do token (AES encryption via LargeSecureStore)

**Saídas:**
- Sessão ativa
- Redirecionamento para tela principal (mapa de eventos)
- Mensagem de erro em caso de falha

**Regras de Negócio:**
- RN04: Token de sessão deve ser armazenado de forma criptografada
- RN05: Sessão deve persistir entre fechamentos do app
- RN06: Usuário não autenticado deve ser redirecionado para login

**Casos de Uso Relacionados:** UC02

---

### RF03 - Visualização de Eventos Próximos

**Descrição:** O sistema deve exibir eventos próximos à localização atual do usuário.

**Prioridade:** Alta

**Entradas:**
- Localização atual do usuário (latitude/longitude)

**Processamento:**
- Obtenção de permissão de localização
- Chamada à função `nearby_events` do banco
- Cálculo de distância via PostGIS
- Ordenação por proximidade

**Saídas:**
- Mapa com marcadores dos eventos
- Lista de eventos com informações básicas (título, distância, data)
- Mensagem se nenhum evento for encontrado

**Regras de Negócio:**
- RN07: Eventos devem ser ordenados por distância (mais próximo primeiro)
- RN08: Sistema deve solicitar permissão de localização
- RN09: Distância deve ser exibida em metros (< 1km) ou quilômetros (>= 1km)

**Casos de Uso Relacionados:** UC03

---

### RF04 - Filtrar Eventos

**Descrição:** O sistema deve permitir filtrar eventos por critérios específicos.

**Prioridade:** Média

**Entradas:**
- Texto de busca (opcional)
- Data inicial (opcional)
- Data final (opcional)
- Localização atual (obrigatório)

**Processamento:**
- Chamada à função `nearby_events_with_filters`
- Aplicação de filtros de texto (busca em título e descrição)
- Aplicação de filtros de data
- Paginação de resultados

**Saídas:**
- Lista filtrada de eventos
- Indicador de quantidade de resultados
- Mensagem se nenhum evento corresponder aos filtros

**Regras de Negócio:**
- RN10: Busca textual deve ser case-insensitive
- RN11: Filtros devem funcionar em conjunto (AND)
- RN12: Resultados devem ser paginados (limite de 20 por página)

**Casos de Uso Relacionados:** UC04

---

### RF05 - Visualizar Detalhes de Evento

**Descrição:** O sistema deve exibir informações completas de um evento.

**Prioridade:** Alta

**Entradas:**
- ID do evento

**Processamento:**
- Busca do evento no banco
- Carregamento de informações do criador
- Contagem de participantes confirmados
- Verificação se usuário atual confirmou presença

**Saídas:**
- Título, descrição, data, local do evento
- Imagem do evento (se disponível)
- Nome e avatar do criador
- Número de participantes / capacidade máxima
- Indicador de evento exclusivo para mulheres (se aplicável)
- Botão de confirmar/cancelar presença
- Seção de comentários
- Link para lista de participantes

**Regras de Negócio:**
- RN13: Data e hora devem ser formatadas conforme timezone do usuário
- RN14: Capacidade máxima exibida apenas se definida
- RN15: Botão de presença altera conforme estado (confirmar/cancelar)

**Casos de Uso Relacionados:** UC05

---

### RF06 - Confirmar Presença em Evento

**Descrição:** O sistema deve permitir que usuários confirmem presença em eventos.

**Prioridade:** Alta

**Entradas:**
- ID do evento
- ID do usuário autenticado

**Processamento:**
- Verificação de capacidade máxima (se definida)
- Verificação se usuário já confirmou presença
- Criação de registro na tabela attendance
- Atualização do contador de participantes

**Saídas:**
- Mensagem de confirmação
- Atualização visual do botão
- Atualização do contador de participantes
- Notificação ao criador do evento (opcional)

**Regras de Negócio:**
- RN16: Usuário não pode confirmar presença duas vezes no mesmo evento
- RN17: Não permitir confirmação se evento estiver lotado
- RN18: Confirmação deve ser instantânea (sem necessidade de refresh)

**Casos de Uso Relacionados:** UC06

---

### RF07 - Cancelar Presença em Evento

**Descrição:** O sistema deve permitir que usuários cancelem confirmação de presença.

**Prioridade:** Alta

**Entradas:**
- ID do evento
- ID do usuário autenticado

**Processamento:**
- Verificação de registro existente em attendance
- Remoção do registro
- Atualização do contador de participantes

**Saídas:**
- Mensagem de cancelamento
- Atualização visual do botão
- Atualização do contador de participantes

**Regras de Negócio:**
- RN19: Cancelamento deve liberar vaga imediatamente
- RN20: Cancelamento deve ser instantâneo

**Casos de Uso Relacionados:** UC07

---

### RF08 - Criar Evento

**Descrição:** O sistema deve permitir que usuários criem novos eventos.

**Prioridade:** Alta

**Entradas:**
- Título (obrigatório)
- Descrição (opcional)
- Data e hora (obrigatório)
- Localização/endereço (obrigatório)
- Imagem (opcional)
- Capacidade máxima (opcional)
- Evento exclusivo para mulheres (opcional, padrão: false)

**Processamento:**
- Validação de campos obrigatórios
- Geocodificação do endereço para obter coordenadas
- Upload de imagem para Supabase Storage (se fornecida)
- Criação de registro na tabela events com location_point (PostGIS)
- Associação com user_id do criador

**Saídas:**
- Evento criado no banco
- Mensagem de sucesso
- Redirecionamento para detalhes do evento criado
- Evento imediatamente visível para outros usuários próximos

**Regras de Negócio:**
- RN21: Título é obrigatório
- RN22: Data do evento deve ser futura
- RN23: Coordenadas geográficas são obrigatórias (location_point)
- RN24: Imagem deve ter tamanho máximo de 5MB
- RN25: Capacidade máxima, se definida, deve ser > 0

**Casos de Uso Relacionados:** UC08

---

### RF09 - Upload de Imagens

**Descrição:** O sistema deve permitir upload de imagens para eventos, comentários e perfis.

**Prioridade:** Alta

**Entradas:**
- Arquivo de imagem (JPG, PNG, WEBP)
- Contexto (evento, comentário ou perfil)

**Processamento:**
- Validação de tipo e tamanho do arquivo
- Redimensionamento/compressão (se necessário)
- Upload para Supabase Storage
- Geração de URL pública

**Saídas:**
- URL da imagem armazenada
- Mensagem de erro se upload falhar

**Regras de Negócio:**
- RN26: Tamanho máximo de 5MB por imagem
- RN27: Formatos aceitos: JPG, PNG, WEBP
- RN28: Imagens devem ser armazenadas em buckets separados por tipo

**Casos de Uso Relacionados:** UC08, UC09, UC11

---

### RF10 - Comentar em Eventos

**Descrição:** O sistema deve permitir que usuários façam comentários em eventos.

**Prioridade:** Média

**Entradas:**
- ID do evento
- Conteúdo do comentário (obrigatório)
- Imagem (opcional)

**Processamento:**
- Validação de conteúdo não vazio
- Upload de imagem (se fornecida)
- Criação de registro na tabela comments
- Carregamento de informações do perfil do autor

**Saídas:**
- Comentário adicionado à lista
- Atualização em tempo real da seção de comentários
- Exibição com avatar e nome do autor

**Regras de Negócio:**
- RN29: Comentário não pode ser vazio
- RN30: Comentários devem ser ordenados do mais recente para o mais antigo
- RN31: Autor pode deletar apenas os próprios comentários

**Casos de Uso Relacionados:** UC09

---

### RF11 - Visualizar Lista de Participantes

**Descrição:** O sistema deve exibir a lista de participantes confirmados de um evento.

**Prioridade:** Média

**Entradas:**
- ID do evento

**Processamento:**
- Busca de registros em attendance para o evento
- Carregamento de informações dos perfis (avatar, nome)
- Contagem total de participantes

**Saídas:**
- Lista com avatar e nome dos participantes
- Número total de participantes confirmados
- Mensagem se nenhum participante confirmado

**Regras de Negócio:**
- RN32: Participantes devem ser ordenados por data de confirmação
- RN33: Lista deve ser acessível a todos os usuários autenticados

**Casos de Uso Relacionados:** UC10

---

### RF12 - Editar Perfil

**Descrição:** O sistema deve permitir que usuários editem suas informações de perfil.

**Prioridade:** Média

**Entradas:**
- Nome completo (opcional)
- Nome de usuário (opcional)
- Foto de perfil (opcional)
- Website (opcional)

**Processamento:**
- Validação de nome de usuário único (se alterado)
- Upload de nova foto de perfil (se fornecida)
- Atualização de registro na tabela profiles
- Atualização de updated_at

**Saídas:**
- Perfil atualizado
- Mensagem de sucesso
- Alterações refletidas em todos os locais (eventos, comentários)

**Regras de Negócio:**
- RN34: Nome de usuário deve ser único
- RN35: Nome de usuário pode conter apenas letras, números e underscores
- RN36: Alterações devem ser propagadas para todos os contextos

**Casos de Uso Relacionados:** UC11

---

### RF13 - Geolocalização

**Descrição:** O sistema deve obter e utilizar a localização do usuário.

**Prioridade:** Alta

**Entradas:**
- Permissão de acesso à localização

**Processamento:**
- Solicitação de permissão de localização
- Obtenção de coordenadas GPS
- Uso de coordenadas para buscar eventos próximos
- Exibição de mapa com Mapbox

**Saídas:**
- Coordenadas (latitude/longitude) do usuário
- Mapa centralizado na localização atual
- Eventos próximos calculados

**Regras de Negócio:**
- RN37: Sistema deve solicitar permissão antes de acessar localização
- RN38: Localização deve ser atualizada periodicamente
- RN39: Se localização não disponível, usar localização padrão ou exibir todos eventos

**Casos de Uso Relacionados:** UC03, UC08

---

### RF14 - Logout

**Descrição:** O sistema deve permitir que usuários façam logout.

**Prioridade:** Alta

**Entradas:**
- Comando de logout (botão/menu)

**Processamento:**
- Encerramento de sessão via Supabase Auth
- Remoção de token armazenado
- Limpeza de estado de autenticação

**Saídas:**
- Sessão encerrada
- Redirecionamento para tela de login
- Mensagem de confirmação (opcional)

**Regras de Negócio:**
- RN40: Logout deve limpar todos os dados de sessão
- RN41: Após logout, usuário deve ser redirecionado para tela de login

**Casos de Uso Relacionados:** UC12

---

### RF15 - Notificações Push

**Descrição:** O sistema deve enviar e gerenciar notificações push.

**Prioridade:** Baixa

**Entradas:**
- Permissão para notificações
- Token Expo Push

**Processamento:**
- Solicitação de permissão de notificações
- Obtenção de token Expo Push
- Registro/atualização de token na tabela expo_push_tokens
- Envio de notificações via Expo Push Service

**Saídas:**
- Token registrado no banco
- Notificações recebidas pelo usuário

**Regras de Negócio:**
- RN42: Um usuário pode ter apenas um token ativo
- RN43: Token deve ser atualizado quando dispositivo mudar
- RN44: Notificações podem ser enviadas para eventos confirmados, novos comentários, etc.

**Casos de Uso Relacionados:** UC13

---

### RF16 - Visualizar Histórico de Eventos

**Descrição:** O sistema deve exibir histórico de eventos do usuário.

**Prioridade:** Média

**Entradas:**
- ID do usuário autenticado

**Processamento:**
- Busca de eventos onde usuário confirmou presença (tabela attendance)
- Separação entre eventos passados e futuros
- Ordenação por data

**Saídas:**
- Lista de eventos confirmados
- Separação visual entre passados e futuros
- Link para detalhes de cada evento

**Regras de Negócio:**
- RN45: Eventos passados e futuros devem ser visualmente diferenciados
- RN46: Eventos devem ser ordenados por data (mais recente primeiro)
- RN47: Histórico exibe apenas eventos com presença confirmada

**Casos de Uso Relacionados:** UC14

---

### RF17 - Autocomplete de Endereços

**Descrição:** O sistema deve fornecer sugestões de endereços durante digitação.

**Prioridade:** Média

**Entradas:**
- Texto digitado pelo usuário

**Processamento:**
- Consulta a serviço de geocoding (Mapbox Geocoding API)
- Filtragem de resultados relevantes
- Retorno de sugestões

**Saídas:**
- Lista de sugestões de endereços
- Seleção de endereço preenche coordenadas automaticamente

**Regras de Negócio:**
- RN48: Sugestões devem aparecer após delay de digitação (debounce)
- RN49: Ao selecionar endereço, coordenadas devem ser obtidas automaticamente
- RN50: Mapa deve ser atualizado com marcador no endereço selecionado

**Casos de Uso Relacionados:** UC15

---

## 3. Requisitos Não-Funcionais

### RNF01 - Segurança
- Senhas devem ser armazenadas com hash bcrypt
- Tokens de sessão devem ser criptografados com AES-256
- Row Level Security (RLS) deve ser habilitado em todas as tabelas
- Comunicação deve usar HTTPS/TLS

### RNF02 - Performance
- Tempo de resposta para busca de eventos: < 2 segundos
- Tempo de carregamento inicial do mapa: < 3 segundos
- Upload de imagens: < 5 segundos (em conexão 4G)
- Busca espacial deve usar índices GiST para eficiência

### RNF03 - Usabilidade
- Interface deve seguir guidelines do iOS e Android
- Aplicativo deve funcionar offline para visualização de dados em cache
- Mensagens de erro devem ser claras e em português
- Carregamentos devem exibir indicadores visuais

### RNF04 - Compatibilidade
- iOS 13.0 ou superior
- Android 6.0 (API 23) ou superior
- Expo SDK 52
- React Native 0.76.6

### RNF05 - Disponibilidade
- Sistema deve estar disponível 99.5% do tempo
- Backup diário do banco de dados
- Recuperação de desastres em até 24 horas

### RNF06 - Escalabilidade
- Suportar até 10.000 usuários simultâneos
- Suportar até 100.000 eventos cadastrados
- Paginação para lidar com grandes volumes de dados

### RNF07 - Manutenibilidade
- Código deve seguir padrões TypeScript strict mode
- Código deve ter cobertura de testes (meta: 80%)
- Documentação de API e componentes principais
- Versionamento semântico

---

## 4. Matriz de Priorização

| Requisito | Prioridade | Complexidade | Dependências |
|-----------|------------|--------------|--------------|
| RF01 | Alta | Baixa | Supabase Auth |
| RF02 | Alta | Baixa | Supabase Auth |
| RF03 | Alta | Média | RF13, PostGIS |
| RF04 | Média | Média | RF03 |
| RF05 | Alta | Baixa | - |
| RF06 | Alta | Baixa | RF05 |
| RF07 | Alta | Baixa | RF06 |
| RF08 | Alta | Alta | RF09, RF13, RF17 |
| RF09 | Alta | Média | Supabase Storage |
| RF10 | Média | Baixa | RF05, RF09 |
| RF11 | Média | Baixa | RF05 |
| RF12 | Média | Média | RF09 |
| RF13 | Alta | Média | Mapbox, GPS |
| RF14 | Alta | Baixa | RF02 |
| RF15 | Baixa | Alta | Expo Push, Backend |
| RF16 | Média | Baixa | RF06 |
| RF17 | Média | Média | Mapbox Geocoding |

---

## 5. Rastreabilidade

### 5.1 Requisitos x Casos de Uso

| Requisito | Casos de Uso |
|-----------|--------------|
| RF01 | UC01 |
| RF02 | UC02 |
| RF03 | UC03 |
| RF04 | UC04 |
| RF05 | UC05 |
| RF06 | UC06 |
| RF07 | UC07 |
| RF08 | UC08, UC15 |
| RF09 | UC08, UC09, UC11 |
| RF10 | UC09 |
| RF11 | UC10 |
| RF12 | UC11 |
| RF13 | UC03, UC08 |
| RF14 | UC12 |
| RF15 | UC13 |
| RF16 | UC14 |
| RF17 | UC15 |

### 5.2 Requisitos x Entidades

| Requisito | Entidades Principais |
|-----------|---------------------|
| RF01 | users, profiles |
| RF02 | users, profiles |
| RF03 | events, profiles |
| RF04 | events |
| RF05 | events, profiles, attendance, comments |
| RF06 | attendance, events, profiles |
| RF07 | attendance |
| RF08 | events, profiles |
| RF09 | events, comments, profiles (storage) |
| RF10 | comments, events, profiles |
| RF11 | attendance, profiles |
| RF12 | profiles |
| RF13 | events (location_point) |
| RF14 | users |
| RF15 | expo_push_tokens, users |
| RF16 | attendance, events |
| RF17 | events |

---

## 6. Regras de Negócio Consolidadas

| ID | Descrição | Requisitos Relacionados |
|----|-----------|------------------------|
| RN01 | Email deve ser único no sistema | RF01 |
| RN02 | Senha deve ter no mínimo 6 caracteres | RF01 |
| RN03 | Perfil é criado automaticamente após cadastro | RF01 |
| RN04 | Token de sessão deve ser armazenado de forma criptografada | RF02 |
| RN05 | Sessão deve persistir entre fechamentos do app | RF02 |
| RN06 | Usuário não autenticado deve ser redirecionado para login | RF02 |
| RN07 | Eventos devem ser ordenados por distância | RF03 |
| RN08 | Sistema deve solicitar permissão de localização | RF03, RF13 |
| RN09 | Distância deve ser exibida em metros ou quilômetros | RF03 |
| RN10 | Busca textual deve ser case-insensitive | RF04 |
| RN11 | Filtros devem funcionar em conjunto (AND) | RF04 |
| RN12 | Resultados devem ser paginados (20 por página) | RF04 |
| RN13 | Data e hora conforme timezone do usuário | RF05 |
| RN14 | Capacidade máxima exibida apenas se definida | RF05, RF08 |
| RN15 | Botão de presença altera conforme estado | RF05, RF06, RF07 |
| RN16 | Usuário não pode confirmar presença duas vezes | RF06 |
| RN17 | Não permitir confirmação se evento lotado | RF06 |
| RN18 | Confirmação deve ser instantânea | RF06 |
| RN19 | Cancelamento libera vaga imediatamente | RF07 |
| RN20 | Cancelamento deve ser instantâneo | RF07 |
| RN21 | Título é obrigatório para eventos | RF08 |
| RN22 | Data do evento deve ser futura | RF08 |
| RN23 | Coordenadas geográficas são obrigatórias | RF08, RF13 |
| RN24 | Imagem deve ter tamanho máximo de 5MB | RF09 |
| RN25 | Capacidade máxima, se definida, deve ser > 0 | RF08 |
| RN26 | Tamanho máximo de 5MB por imagem | RF09 |
| RN27 | Formatos aceitos: JPG, PNG, WEBP | RF09 |
| RN28 | Imagens em buckets separados por tipo | RF09 |
| RN29 | Comentário não pode ser vazio | RF10 |
| RN30 | Comentários ordenados do mais recente | RF10 |
| RN31 | Autor pode deletar apenas próprios comentários | RF10 |
| RN32 | Participantes ordenados por data de confirmação | RF11 |
| RN33 | Lista de participantes acessível a todos | RF11 |
| RN34 | Nome de usuário deve ser único | RF12 |
| RN35 | Nome de usuário: letras, números e underscores | RF12 |
| RN36 | Alterações propagadas para todos contextos | RF12 |
| RN37 | Solicitar permissão antes de acessar localização | RF13 |
| RN38 | Localização atualizada periodicamente | RF13 |
| RN39 | Fallback se localização não disponível | RF13 |
| RN40 | Logout limpa todos dados de sessão | RF14 |
| RN41 | Após logout, redirecionar para login | RF14 |
| RN42 | Um usuário pode ter apenas um token ativo | RF15 |
| RN43 | Token atualizado quando dispositivo mudar | RF15 |
| RN44 | Notificações para eventos e comentários | RF15 |
| RN45 | Eventos passados e futuros diferenciados | RF16 |
| RN46 | Eventos ordenados por data (mais recente) | RF16 |
| RN47 | Histórico exibe apenas eventos confirmados | RF16 |
| RN48 | Sugestões após delay de digitação (debounce) | RF17 |
| RN49 | Ao selecionar, coordenadas obtidas automaticamente | RF17 |
| RN50 | Mapa atualizado com marcador no endereço | RF17 |

