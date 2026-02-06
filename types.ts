
export type UserRole = 'ADMIN' | 'OPERATOR';
export type MainTab = 'production' | 'prestation_prod' | 'prestation_etuvage' | 'stock' | 'insights' | 'management';

export interface User {
  id: string;
  name: string;
  username: string; // Identifiant de connexion
  password: string; // Mot de passe
  role: UserRole;
  createdAt: number;
  allowedTabs: MainTab[]; // Onglets autorisés pour cet utilisateur
}

export interface MasterData {
  products: string[];
  packagings: string[];
  clients: string[];
  suppliers: string[];
  purchaseCategories: string[];
  serviceTypes: string[];
}

export interface ProductionRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  lotNumber: string;
  clientName: string;
  productName: string;
  packaging: string;
  employeeCount: number;
  totalProduction: number;
  totalWeightKg: number;
  wasteKg: number;
  infestationRate: number;
  timestamp: number;
}

export interface PrestationProdRecord {
  id: string;
  userId: string;
  userName: string;
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
}

export interface PrestationEtuvageRecord {
  id: string;
  userId: string;
  userName: string;
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
}

export interface PurchaseRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  lotNumber: string;
  supplierName: string;
  itemName: string;
  variety: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  infestationRate: number;
  timestamp: number;
}

export interface StockOutRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  lotNumber: string;
  itemName: string;
  quantity: number;
  reason: string;
  timestamp: number;
}

export interface YieldMetrics {
  totalOutput: number;
  totalWeight: number;
  totalWaste: number;
  avgYield: number;
  avgWeightYield: number;
  avgInfestation: number;
  totalEmployees: number;
  avgEmployees: number;
}

export interface StockStatus {
  itemName: string;
  totalIn: number;
  totalOut: number;
  currentStock: number;
}
