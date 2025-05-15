export interface CostItem {
  id: string;
  description: string;
  category: "MATERIAL" | "SERVICO" | "TRANSPORTE" | "TRIBUTOS" | "OUTROS";
  value: number;
  type: "FIXED" | "VARIABLE";
}

export interface Tender {
  id: string;
  title: string;
  organ: string;
  estimatedValue: number;
  possibleGain: number;
  status: string;
  followed: boolean;
  publicationDate: Date;
  deadline: Date;
  safetyMargin?: number;
  desiredProfitMargin?: number;
  minViableBid?: number;
  costEstimates?: CostItem[];
}
