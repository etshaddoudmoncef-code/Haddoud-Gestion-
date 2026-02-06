
export type MainTab = 'production' | 'prestation_prod' | 'prestation_etuvage' | 'stock' | 'insights' | 'management';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: 'ADMIN' | 'OPERATOR';
  createdAt: number;
  allowedTabs: MainTab[];
}

export interface ProductionRecord {
  id: string;
  date: string;
  lotNumber: string;
  clientName: string;
  productName: string;
  employeeCount: number;
  totalWeightKg: number;
  wasteKg: number;
  infestationRate: number;
  timestamp: number;
  packaging?: string;
}

export interface MasterData {
  products: string[];
  clients: string[];
  packagings: string[];
  suppliers: string[];
  purchaseCategories: string[];
  serviceTypes: string[];
}

export interface PurchaseRecord {
  id: string;
  date: string;
  lotNumber: string;
  supplierName: string;
  itemName: string;
  variety?: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  infestationRate: number;
  timestamp: number;
  userId?: string;
  userName?: string;
}

export interface StockOutRecord {
  id: string;
  date: string;
  lotNumber: string;
  itemName: string;
  quantity: number;
  reason: string;
  timestamp: number;
  userId?: string;
  userName?: string;
}

export interface StockStatus {
  itemName: string;
  totalIn: number;
  totalOut: number;
  currentStock: number;
}

export interface PrestationProdRecord {
  id: string;
  date: string;
  lotNumber: string;
  clientName: string;
  serviceType: string;
  weightIn: number;
  weightOut: number;
  wasteKg: number;
  unitPrice: number;
  totalAmount: number;
  employeeCount: number;
  timestamp: number;
  userId?: string;
  userName?: string;
}

export interface PrestationEtuvageRecord {
  id: string;
  date: string;
  lotNumber: string;
  clientName: string;
  weightIn: number;
  weightOut: number;
  humidityLevel: number;
  durationHours: number;
  unitPrice: number;
  totalAmount: number;
  employeeCount: number;
  timestamp: number;
  userId?: string;
  userName?: string;
}
