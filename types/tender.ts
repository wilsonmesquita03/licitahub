export interface CostItem {
  id: string;
  description: string;
  category:
    | "mão_de_obra"
    | "materiais"
    | "equipamentos"
    | "serviços"
    | "outros";
  value: number;
  type: "manual" | "automatic";
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
