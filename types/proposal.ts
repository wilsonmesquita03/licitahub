type ProposalItem = {
  unity: string;
  item: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: string;
};

type CompanyData = {
  companyName: string;
  cnpj: string;
  stateRegistration: string;
  address: string;
  email: string;
  phone: string;
  bankDetails: string;
};

type LegalRepresentative = {
  name: string;
  nationality: string;
  birthPlace: string;
  maritalStatus: string;
  occupation: string;
  cpf: string;
  rg: string;
  rgIssuer: string;
  address: string;
  email: string;
  phone: string;
};

export type ProposalData = {
  letterhead?: string; // para (EM TIMBRADO), se quiser colocar algo customizado
  biddingNumber: string; // ex: "PREGÃO ELETRÔNICO Nº 22/2025"
  company: CompanyData;
  representative: LegalRepresentative;
  items: ProposalItem[];
  validity: string; // ex: "60 dias"
  locationAndDate: string; // ex: "Nazarezinho - PB, 10 de junho de 2025."
};
