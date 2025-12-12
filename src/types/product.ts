export type ProductStatus = 'ativo' | 'pausado' | 'erro';

export type VerdictType = 'positivo' | 'neutro' | 'negativo';

export interface Product {
  id: string;
  name: string;
  url: string;
  imageUrl: string;
  currentPrice: number;
  targetPrice: number;
  status: ProductStatus;
  lastVerdict: string;
  sentimentScore: number;
  verdictType: VerdictType;
  pros: string[];
  cons: string[];
  lastUpdated: Date;
}

export interface PriceHistory {
  id: string;
  productId: string;
  price: number;
  date: Date;
}

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  priceDrops: number;
  avgSentiment: number;
}
