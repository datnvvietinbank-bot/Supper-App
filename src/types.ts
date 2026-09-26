export type ActiveTab = 
  | 'faq'
  | 'download'
  | 'game'
  | 'interest'
  | 'loan'
  | 'products'
  | 'branches';

export interface FaqStep {
  step: number;
  title: string;
  desc: string;
  image: string;
}

export interface FaqTopic {
  id: string;
  title: string;
  shortDesc: string;
  videoUrl: string;
  steps: FaqStep[];
}

export interface ProductItem {
  id: string;
  category: string;
  categoryName: string;
  name: string;
  badge: string;
  description: string;
  image: string;
}

export interface BranchLocation {
  id: string;
  branchRegion: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  phoneClean: string;
  image: string;
  mapUrl: string;
}

export interface LoanScheduleRow {
  period: number;
  paymentDate: string;
  beginningBalance: number;
  principal: number;
  interest: number;
  totalPayment: number;
  endingBalance: number;
}
