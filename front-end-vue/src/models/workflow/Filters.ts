export interface Filters {
  global: { value: any; matchMode: string };
  name: { operator: string; constraints: { value: any; matchMode: string }[] };
  "country.name": {
    operator: string;
    constraints: { value: any; matchMode: string }[];
  };
  representative: { value: any; matchMode: string };
  date: { operator: string; constraints: { value: null; matchMode: string }[] };
  balance: {
    operator: string;
    constraints: { value: any; matchMode: string }[];
  };
  activity: { value: any; matchMode: string };
  verified: { value: any; matchMode: string };
}
