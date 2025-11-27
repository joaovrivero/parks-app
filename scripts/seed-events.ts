import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

import { Database } from '../types/supabase';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Coordenadas de Porto Alegre e região metropolitana do Rio Grande do Sul
const rsLocations = [
  { lat: -30.0346, lng: -51.2177, name: 'Parque Farroupilha (Redenção), Porto Alegre - RS' },
  { lat: -30.0568, lng: -51.1729, name: 'Parque Marinha do Brasil, Porto Alegre - RS' },
  { lat: -30.0277, lng: -51.2287, name: 'Parque Moinhos de Vento (Parcão), Porto Alegre - RS' },
  { lat: -30.0494, lng: -51.1773, name: 'Parque Germânia, Porto Alegre - RS' },
  { lat: -30.1088, lng: -51.3089, name: 'Parque Natural Morro do Osso, Porto Alegre - RS' },
  { lat: -30.0878, lng: -51.235, name: 'Parque Maurício Sirotsky Sobrinho, Porto Alegre - RS' },
  { lat: -29.9945, lng: -51.1821, name: 'Parque Saint Hilaire, Porto Alegre - RS' },
  { lat: -30.1156, lng: -51.2897, name: 'Parque Mascarenhas de Moraes, Porto Alegre - RS' },
  { lat: -30.0234, lng: -51.1678, name: 'Parque da Harmonia, Porto Alegre - RS' },
  { lat: -30.0589, lng: -51.1456, name: 'Parque da Orla do Guaíba, Porto Alegre - RS' },
  { lat: -29.7945, lng: -51.1489, name: 'Parque Aldeia do Imigrante, Nova Petrópolis - RS' },
  { lat: -29.3678, lng: -50.8767, name: 'Parque do Lago, Gramado - RS' },
  { lat: -29.3789, lng: -50.8745, name: 'Lago Negro, Gramado - RS' },
  { lat: -29.3356, lng: -50.7656, name: 'Parque do Caracol, Canela - RS' },
  { lat: -30.0123, lng: -51.2456, name: 'Jardim Botânico de Porto Alegre, Porto Alegre - RS' },
  { lat: -29.9867, lng: -51.1945, name: 'Parque Chico Mendes, Porto Alegre - RS' },
  { lat: -30.0456, lng: -51.2089, name: 'Parque da Várzea, Porto Alegre - RS' },
  { lat: -30.1234, lng: -51.2567, name: 'Parque Natural Saint-Hilaire, Viamão - RS' },
  { lat: -29.9678, lng: -51.1678, name: 'Parque Ararigbóia, Porto Alegre - RS' },
  { lat: -30.0789, lng: -51.2234, name: 'Parque Setorial Belém Novo, Porto Alegre - RS' },
];

const events = [
  {
    title: 'Corrida Matinal no Redenção',
    description: 'Corrida de 5km para todos os níveis. Venha aproveitar o ar fresco da manhã!',
    date: new Date('2026-01-05T07:00:00-03:00').toISOString(),
    max_capacity: 50,
    women_only: false,
  },
  {
    title: 'Yoga ao Pôr do Sol',
    description: 'Sessão de yoga relaxante com vista para o lago. Traga seu tapete!',
    date: new Date('2026-01-08T18:30:00-03:00').toISOString(),
    max_capacity: 30,
    women_only: false,
  },
  {
    title: 'Piquenique no Parcão',
    description: 'Encontro casual para conversar e fazer novos amigos. Traga seu lanche!',
    date: new Date('2026-01-10T16:00:00-03:00').toISOString(),
    max_capacity: 40,
    women_only: false,
  },
  {
    title: 'Caminhada Fotográfica',
    description: 'Explore a natureza enquanto pratica fotografia. Iniciantes são bem-vindos!',
    date: new Date('2026-01-12T09:00:00-03:00').toISOString(),
    max_capacity: 25,
    women_only: false,
  },
  {
    title: 'Meditação Matinal',
    description: 'Comece o dia com paz interior. Sessão guiada de meditação.',
    date: new Date('2026-01-15T06:30:00-03:00').toISOString(),
    max_capacity: 35,
    women_only: false,
  },
  {
    title: 'Treino Funcional ao Ar Livre',
    description:
      'Exercícios funcionais para fortalecer o corpo todo. Sem equipamentos necessários!',
    date: new Date('2026-01-17T07:00:00-03:00').toISOString(),
    max_capacity: 45,
    women_only: false,
  },
  {
    title: 'Clube de Leitura no Parque',
    description: 'Discussão sobre o livro do mês. Traga sua cadeira de camping!',
    date: new Date('2026-01-20T17:00:00-03:00').toISOString(),
    max_capacity: 20,
    women_only: false,
  },
  {
    title: 'Aula de Tai Chi',
    description: 'Aprenda os movimentos suaves do Tai Chi. Todas as idades são bem-vindas!',
    date: new Date('2026-01-22T08:00:00-03:00').toISOString(),
    max_capacity: 30,
    women_only: false,
  },
  {
    title: 'Observação de Pássaros',
    description: 'Traga seus binóculos e descubra as aves locais com um guia experiente.',
    date: new Date('2026-01-24T06:00:00-03:00').toISOString(),
    max_capacity: 15,
    women_only: false,
  },
  {
    title: 'Treino de Ciclismo',
    description: 'Passeio de bike de 15km em ritmo moderado. Traga sua bicicleta!',
    date: new Date('2026-01-26T07:30:00-03:00').toISOString(),
    max_capacity: 35,
    women_only: false,
  },
  {
    title: 'Aula de Dança ao Ar Livre',
    description:
      'Ritmos variados para se divertir e fazer exercício. Nenhuma experiência necessária!',
    date: new Date('2026-01-28T18:00:00-03:00').toISOString(),
    max_capacity: 40,
    women_only: false,
  },
  {
    title: 'Alongamento e Mobilidade',
    description: 'Sessão focada em alongamento e mobilidade articular. Ideal para recuperação.',
    date: new Date('2026-01-30T07:00:00-03:00').toISOString(),
    max_capacity: 25,
    women_only: false,
  },
  {
    title: 'Grupo de Caminhada Mulheres',
    description: 'Caminhada exclusiva para mulheres. Ambiente seguro e acolhedor.',
    date: new Date('2026-02-02T08:00:00-03:00').toISOString(),
    max_capacity: 30,
    women_only: true,
  },
  {
    title: 'Bootcamp Fitness',
    description: 'Treino intenso estilo militar. Para quem quer desafiar seus limites!',
    date: new Date('2026-02-05T06:30:00-03:00').toISOString(),
    max_capacity: 40,
    women_only: false,
  },
  {
    title: 'Sessão de Pintura ao Ar Livre',
    description:
      'Traga seus materiais de arte e pinte a paisagem. Aquarela, acrílico, o que preferir!',
    date: new Date('2026-02-07T15:00:00-03:00').toISOString(),
    max_capacity: 20,
    women_only: false,
  },
  {
    title: 'Treino de Corrida Intervalada',
    description: 'HIIT running para melhorar velocidade e resistência. Nível intermediário.',
    date: new Date('2026-02-10T07:00:00-03:00').toISOString(),
    max_capacity: 30,
    women_only: false,
  },
  {
    title: 'Pilates no Parque',
    description: 'Fortaleça o core com exercícios de pilates adaptados para o ar livre.',
    date: new Date('2026-02-12T08:00:00-03:00').toISOString(),
    max_capacity: 25,
    women_only: false,
  },
  {
    title: 'Encontro de Pets e Donos',
    description: 'Traga seu cachorro para socializar enquanto você conhece outros tutores!',
    date: new Date('2026-02-15T16:00:00-03:00').toISOString(),
    max_capacity: 50,
    women_only: false,
  },
  {
    title: 'Aula de Boxe ao Ar Livre',
    description: 'Treine boxe com equipamentos fornecidos. Excelente para cardio e defesa pessoal.',
    date: new Date('2026-02-18T18:00:00-03:00').toISOString(),
    max_capacity: 35,
    women_only: false,
  },
  {
    title: 'Sessão de Slackline',
    description: 'Aprenda ou pratique slackline. Equipamentos disponíveis no local.',
    date: new Date('2026-02-22T10:00:00-03:00').toISOString(),
    max_capacity: 20,
    women_only: false,
  },
];

async function seedEvents() {
  try {
    // Usando null para image_uri - você pode adicionar as imagens manualmente depois
    const imageUrl = null;
    console.log('Iniciando inserção de eventos...');

    console.log('Inserindo eventos no banco de dados...');

    // Precisamos de um user_id válido. Vamos buscar o primeiro usuário disponível
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (profileError || !profiles || profiles.length === 0) {
      throw new Error('Nenhum perfil encontrado. Crie um usuário primeiro.');
    }

    const userId = profiles[0].id;

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const location = rsLocations[i];

      const { error } = await supabase.from('events').insert({
        title: event.title,
        description: event.description,
        date: event.date,
        location: location.name,
        location_point: `POINT(${location.lng} ${location.lat})`,
        image_uri: imageUrl,
        max_capacity: event.max_capacity,
        women_only: event.women_only,
        user_id: userId,
      });

      if (error) {
        console.error(`Erro ao inserir evento "${event.title}":`, error);
      } else {
        console.log(`✓ Evento "${event.title}" inserido com sucesso`);
      }
    }

    console.log('\n✅ Todos os eventos foram inseridos com sucesso!');
  } catch (error) {
    console.error('Erro geral:', error);
    process.exit(1);
  }
}

seedEvents();
