export interface CharacterState {
  name: string;
  gender: 'm' | 'f';
  country: string;
  homeCountry?: string;
  currency: string;
  month: number;
  pacing: 'yearly' | 'monthly';
  pacingSwitchYear?: number;
  age: number;
  health: number;
  happiness: number;
  happinessOverride?: number;
  smarts: number;
  social: number;
  wealth: number;
  school: string | null;
  uni: { name: string; year: number; yearsTotal: number; major?: string } | null;
  degree: string | null;
  thanaweyaScore?: number;
  job: { title: string; salary: number; level: number; company: string; years?: number } | null;
  career?: {
    job?: any;
    partTime?: any;
    applications?: any[];
    offers?: any[];
    gulfJob?: any;
    [key: string]: any;
  };
  spouse: { name: string; age?: number; bond?: number } | null;
  marriage?: {
    status?: string;
    partner?: any;
    motherInLawBond?: number;
    [key: string]: any;
  };
  children: number;
  childrenList?: any[];
  housing: string;
  family: Array<{ role: string; name: string; age: number; bond: number; alive: boolean }>;
  familyTier: string;
  parentType: string;
  friends?: any[];
  household?: { expenses?: number; net?: number };
  bank?: { loans?: any[]; deposits?: any[]; [key: string]: any };
  realestate?: any;
  cars?: any[];
  assets?: any;
  expat?: { egyptDevaluationMultiplier?: number };
  log: Array<{ age: number; year: number; month: number | null; msg: string; isReflection?: boolean }>;
  flags: Record<string, any>;
  pending: {
    title: string | ((s: any) => string);
    text: string | ((s: any) => string);
    choices: Array<{
      label: string | ((s: any) => string);
      effect?: (s: any) => void;
      available?: (s: any) => boolean;
    }>;
  } | null;
  evId: string | null;
  pendingQueue: any[];
}

export interface CountryInfo {
  id: string;
  name: string;
  flag: string;
  currency: string;
  rate: number;
  salary: number;
  prices: { food: number; phone: number; transport: number; rent: number };
}
