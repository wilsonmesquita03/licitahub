export interface Bid {
  id: string;
  title: string;
  organization: string;
  state: string;
  publishedAt: Date;
  deadline: Date;
  estimatedValue: number;
  portfolioFit: number;
  status: 'open' | 'analyzing' | 'preparing' | 'submitted' | 'closed';
}

export interface BidFilter {
  id: string;
  name: string;
  keywords: string[];
  states: string[];
  organizations: string[];
  minValue: number;
  maxValue: number;
  dateRange: {
    start: Date;
    end: Date;
  };
}

export interface BidAnalysis {
  id: string;
  bidId: string;
  documentUrl: string;
  criticalClauses: {
    type: string;
    content: string;
    status: 'pending' | 'completed';
  }[];
  deadlines: {
    description: string;
    date: Date;
  }[];
  requiredDocuments: {
    name: string;
    status: 'pending' | 'completed';
  }[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  company: {
    name: string;
    cnpj: string;
    address: string;
  };
}