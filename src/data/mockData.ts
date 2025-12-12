import { Product, PriceHistory, DashboardStats } from '@/types/product';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Apple MacBook Air M3 2024 - 8GB RAM 256GB SSD',
    url: 'https://amazon.com.br/macbook-air-m3',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
    currentPrice: 8999.00,
    targetPrice: 8500.00,
    status: 'ativo',
    lastVerdict: 'Compra Recomendada',
    sentimentScore: 8.7,
    verdictType: 'positivo',
    pros: [
      'Bateria excepcional, dura o dia todo',
      'Silencioso, sem ventoinha',
      'Tela Retina com cores vibrantes',
      'Chip M3 muito rápido para tarefas do dia a dia'
    ],
    cons: [
      'Preço ainda elevado',
      'Apenas 8GB de RAM pode limitar multitarefa pesada',
      'Poucos conectores USB-C'
    ],
    lastUpdated: new Date('2024-01-15T10:30:00')
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra 256GB 5G',
    url: 'https://mercadolivre.com.br/galaxy-s24-ultra',
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=300&fit=crop',
    currentPrice: 6299.00,
    targetPrice: 6000.00,
    status: 'ativo',
    lastVerdict: 'Aguarde Promoção',
    sentimentScore: 7.2,
    verdictType: 'neutro',
    pros: [
      'Câmera com zoom de 100x impressiona',
      'S Pen inclusa é muito útil',
      'Tela AMOLED brilhante'
    ],
    cons: [
      'Bateria poderia ser melhor',
      'Esquenta em jogos pesados',
      'One UI com muitos apps pré-instalados'
    ],
    lastUpdated: new Date('2024-01-15T08:00:00')
  },
  {
    id: '3',
    name: 'Sony WH-1000XM5 Fone Bluetooth com Cancelamento de Ruído',
    url: 'https://amazon.com.br/sony-wh1000xm5',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    currentPrice: 1799.00,
    targetPrice: 1800.00,
    status: 'ativo',
    lastVerdict: 'Compra Recomendada',
    sentimentScore: 9.1,
    verdictType: 'positivo',
    pros: [
      'Melhor cancelamento de ruído do mercado',
      'Som cristalino e equilibrado',
      'Conforto excepcional para uso prolongado',
      'Bateria de 30 horas'
    ],
    cons: [
      'Não dobra como o modelo anterior',
      'Preço premium'
    ],
    lastUpdated: new Date('2024-01-14T16:45:00')
  },
  {
    id: '4',
    name: 'Kindle Paperwhite 16GB 6.8" 300ppi',
    url: 'https://amazon.com.br/kindle-paperwhite',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop',
    currentPrice: 549.00,
    targetPrice: 450.00,
    status: 'pausado',
    lastVerdict: 'Cuidado: Problemas relatados',
    sentimentScore: 5.8,
    verdictType: 'negativo',
    pros: [
      'Tela maior e com melhor resolução',
      'À prova d\'água'
    ],
    cons: [
      'Alguns usuários relatam travamentos',
      'Resposta lenta ao toque',
      'Problemas de sincronização com a nuvem',
      'Atendimento pós-venda deixa a desejar'
    ],
    lastUpdated: new Date('2024-01-13T12:00:00')
  },
  {
    id: '5',
    name: 'LG OLED55C3 Smart TV 55" 4K OLED',
    url: 'https://mercadolivre.com.br/lg-oled-c3',
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop',
    currentPrice: 4299.00,
    targetPrice: 4000.00,
    status: 'erro',
    lastVerdict: 'Erro de Leitura',
    sentimentScore: 0,
    verdictType: 'negativo',
    pros: [],
    cons: [],
    lastUpdated: new Date('2024-01-12T09:15:00')
  }
];

export const mockPriceHistory: PriceHistory[] = [
  // MacBook Air M3
  { id: 'p1-1', productId: '1', price: 9499.00, date: new Date('2024-01-01') },
  { id: 'p1-2', productId: '1', price: 9299.00, date: new Date('2024-01-03') },
  { id: 'p1-3', productId: '1', price: 9299.00, date: new Date('2024-01-05') },
  { id: 'p1-4', productId: '1', price: 8999.00, date: new Date('2024-01-07') },
  { id: 'p1-5', productId: '1', price: 9199.00, date: new Date('2024-01-09') },
  { id: 'p1-6', productId: '1', price: 8899.00, date: new Date('2024-01-11') },
  { id: 'p1-7', productId: '1', price: 8999.00, date: new Date('2024-01-13') },
  { id: 'p1-8', productId: '1', price: 8999.00, date: new Date('2024-01-15') },
  
  // Galaxy S24 Ultra
  { id: 'p2-1', productId: '2', price: 6999.00, date: new Date('2024-01-01') },
  { id: 'p2-2', productId: '2', price: 6799.00, date: new Date('2024-01-03') },
  { id: 'p2-3', productId: '2', price: 6499.00, date: new Date('2024-01-05') },
  { id: 'p2-4', productId: '2', price: 6499.00, date: new Date('2024-01-07') },
  { id: 'p2-5', productId: '2', price: 6299.00, date: new Date('2024-01-09') },
  { id: 'p2-6', productId: '2', price: 6399.00, date: new Date('2024-01-11') },
  { id: 'p2-7', productId: '2', price: 6299.00, date: new Date('2024-01-13') },
  { id: 'p2-8', productId: '2', price: 6299.00, date: new Date('2024-01-15') },
  
  // Sony WH-1000XM5
  { id: 'p3-1', productId: '3', price: 2199.00, date: new Date('2024-01-01') },
  { id: 'p3-2', productId: '3', price: 2099.00, date: new Date('2024-01-03') },
  { id: 'p3-3', productId: '3', price: 1999.00, date: new Date('2024-01-05') },
  { id: 'p3-4', productId: '3', price: 1899.00, date: new Date('2024-01-07') },
  { id: 'p3-5', productId: '3', price: 1899.00, date: new Date('2024-01-09') },
  { id: 'p3-6', productId: '3', price: 1849.00, date: new Date('2024-01-11') },
  { id: 'p3-7', productId: '3', price: 1799.00, date: new Date('2024-01-13') },
  { id: 'p3-8', productId: '3', price: 1799.00, date: new Date('2024-01-15') },
];

export const mockStats: DashboardStats = {
  totalProducts: 5,
  activeProducts: 3,
  priceDrops: 2,
  avgSentiment: 7.7
};
