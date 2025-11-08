-- Script para inserir 20 eventos de exemplo no Rio Grande do Sul
-- Execute este script diretamente no Supabase SQL Editor
-- IMPORTANTE: Substitua 'YOUR_USER_ID' pelo ID do seu usuário antes de executar

INSERT INTO events (title, description, date, location, location_point, image_uri, max_capacity, women_only, user_id) VALUES
(
  'Corrida Matinal no Redenção',
  'Corrida de 5km para todos os níveis. Venha aproveitar o ar fresco da manhã!',
  '2026-01-05T07:00:00-03:00',
  'Parque Farroupilha (Redenção), Porto Alegre - RS',
  ST_SetSRID(ST_MakePoint(-51.2177, -30.0346), 4326),
  NULL,
  50,
  false,
  'YOUR_USER_ID'
),
(
  'Yoga ao Pôr do Sol',
  'Sessão de yoga relaxante com vista para o lago. Traga seu tapete!',
  '2026-01-08T18:30:00-03:00',
  'Parque Marinha do Brasil, Porto Alegre - RS',
  ST_SetSRID(ST_MakePoint(-51.1729, -30.0568), 4326),
  NULL,
  30,
  false,
  'YOUR_USER_ID'
),
(
  'Piquenique no Parcão',
  'Encontro casual para conversar e fazer novos amigos. Traga seu lanche!',
  '2026-01-10T16:00:00-03:00',
  'Parque Moinhos de Vento (Parcão), Porto Alegre - RS',
  ST_SetSRID(ST_MakePoint(-51.2287, -30.0277), 4326),
  NULL,
  40,
  false,
  'YOUR_USER_ID'
),
(
  'Caminhada Fotográfica',
  'Explore a natureza enquanto pratica fotografia. Iniciantes são bem-vindos!',
  '2026-01-12T09:00:00-03:00',
  'Parque Germânia, Porto Alegre - RS',
  ST_SetSRID(ST_MakePoint(-51.1773, -30.0494), 4326),
  NULL,
  25,
  false,
  'YOUR_USER_ID'
),
(
  'Meditação Matinal',
  'Comece o dia com paz interior. Sessão guiada de meditação.',
  '2026-01-15T06:30:00-03:00',
  'Parque Natural Morro do Osso, Porto Alegre - RS',
  ST_SetSRID(ST_MakePoint(-51.3089, -30.1088), 4326),
  NULL,
  35,
  false,
  'YOUR_USER_ID'
),
(
  'Treino Funcional ao Ar Livre',
  'Exercícios funcionais para fortalecer o corpo todo. Sem equipamentos necessários!',
  '2026-01-17T07:00:00-03:00',
  'Parque Maurício Sirotsky Sobrinho, Porto Alegre - RS',
  ST_SetSRID(ST_MakePoint(-51.2350, -30.0878), 4326),
  NULL,
  45,
  false,
  'YOUR_USER_ID'
),
(
  'Clube de Leitura no Parque',
  'Discussão sobre o livro do mês. Traga sua cadeira de camping!',
  '2026-01-20T17:00:00-03:00',
  'Parque Saint Hilaire, Porto Alegre - RS',
  ST_SetSRID(ST_MakePoint(-51.1821, -29.9945), 4326),
  NULL,
  20,
  false,
  'YOUR_USER_ID'
),
(
  'Aula de Tai Chi',
  'Aprenda os movimentos suaves do Tai Chi. Todas as idades são bem-vindas!',
  '2026-01-22T08:00:00-03:00',
  'Parque Mascarenhas de Moraes, Porto Alegre - RS',
  ST_SetSRID(ST_MakePoint(-51.2897, -30.1156), 4326),
  NULL,
  30,
  false,
  'YOUR_USER_ID'
),
(
  'Observação de Pássaros',
  'Traga seus binóculos e descubra as aves locais com um guia experiente.',
  '2026-01-24T06:00:00-03:00',
  'Parque da Harmonia, Porto Alegre - RS',
  ST_SetSRID(ST_MakePoint(-51.1678, -30.0234), 4326),
  NULL,
  15,
  false,
  'YOUR_USER_ID'
),
(
  'Treino de Ciclismo',
  'Passeio de bike de 15km em ritmo moderado. Traga sua bicicleta!',
  '2026-01-26T07:30:00-03:00',
  'Parque da Orla do Guaíba, Porto Alegre - RS',
  ST_SetSRID(ST_MakePoint(-51.1456, -30.0589), 4326),
  NULL,
  35,
  false,
  'YOUR_USER_ID'
),
(
  'Aula de Dança ao Ar Livre',
  'Ritmos variados para se divertir e fazer exercício. Nenhuma experiência necessária!',
  '2026-01-28T18:00:00-03:00',
  'Parque Aldeia do Imigrante, Nova Petrópolis - RS',
  ST_SetSRID(ST_MakePoint(-51.1489, -29.7945), 4326),
  NULL,
  40,
  false,
  'YOUR_USER_ID'
),
(
  'Alongamento e Mobilidade',
  'Sessão focada em alongamento e mobilidade articular. Ideal para recuperação.',
  '2026-01-30T07:00:00-03:00',
  'Parque do Lago, Gramado - RS',
  ST_SetSRID(ST_MakePoint(-50.8767, -29.3678), 4326),
  NULL,
  25,
  false,
  'YOUR_USER_ID'
),
(
  'Grupo de Caminhada Mulheres',
  'Caminhada exclusiva para mulheres. Ambiente seguro e acolhedor.',
  '2026-02-02T08:00:00-03:00',
  'Lago Negro, Gramado - RS',
  ST_SetSRID(ST_MakePoint(-50.8745, -29.3789), 4326),
  NULL,
  30,
  true,
  'YOUR_USER_ID'
),
(
  'Bootcamp Fitness',
  'Treino intenso estilo militar. Para quem quer desafiar seus limites!',
  '2026-02-05T06:30:00-03:00',
  'Parque do Caracol, Canela - RS',
  ST_SetSRID(ST_MakePoint(-50.7656, -29.3356), 4326),
  NULL,
  40,
  false,
  'YOUR_USER_ID'
),
(
  'Sessão de Pintura ao Ar Livre',
  'Traga seus materiais de arte e pinte a paisagem. Aquarela, acrílico, o que preferir!',
  '2026-02-07T15:00:00-03:00',
  'Jardim Botânico de Porto Alegre, Porto Alegre - RS',
  ST_SetSRID(ST_MakePoint(-51.2456, -30.0123), 4326),
  NULL,
  20,
  false,
  'YOUR_USER_ID'
),
(
  'Treino de Corrida Intervalada',
  'HIIT running para melhorar velocidade e resistência. Nível intermediário.',
  '2026-02-10T07:00:00-03:00',
  'Parque Chico Mendes, Porto Alegre - RS',
  ST_SetSRID(ST_MakePoint(-51.1945, -29.9867), 4326),
  NULL,
  30,
  false,
  'YOUR_USER_ID'
),
(
  'Pilates no Parque',
  'Fortaleça o core com exercícios de pilates adaptados para o ar livre.',
  '2026-02-12T08:00:00-03:00',
  'Parque da Várzea, Porto Alegre - RS',
  ST_SetSRID(ST_MakePoint(-51.2089, -30.0456), 4326),
  NULL,
  25,
  false,
  'YOUR_USER_ID'
),
(
  'Encontro de Pets e Donos',
  'Traga seu cachorro para socializar enquanto você conhece outros tutores!',
  '2026-02-15T16:00:00-03:00',
  'Parque Natural Saint-Hilaire, Viamão - RS',
  ST_SetSRID(ST_MakePoint(-51.2567, -30.1234), 4326),
  NULL,
  50,
  false,
  'YOUR_USER_ID'
),
(
  'Aula de Boxe ao Ar Livre',
  'Treine boxe com equipamentos fornecidos. Excelente para cardio e defesa pessoal.',
  '2026-02-18T18:00:00-03:00',
  'Parque Ararigbóia, Porto Alegre - RS',
  ST_SetSRID(ST_MakePoint(-51.1678, -29.9678), 4326),
  NULL,
  35,
  false,
  'YOUR_USER_ID'
),
(
  'Sessão de Slackline',
  'Aprenda ou pratique slackline. Equipamentos disponíveis no local.',
  '2026-02-22T10:00:00-03:00',
  'Parque Setorial Belém Novo, Porto Alegre - RS',
  ST_SetSRID(ST_MakePoint(-51.2234, -30.0789), 4326),
  NULL,
  20,
  false,
  'YOUR_USER_ID'
);

-- Para obter seu user_id, execute:
-- SELECT id, email FROM auth.users;
