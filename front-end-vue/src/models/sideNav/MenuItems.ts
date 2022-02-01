export interface LoginItem {
  label: string;
  icon: string;
  to: string;
}

export interface AccountItem {
  label: string;
  icon: string;
  to: string;
}

export interface ModuleItem {
  icon: string[];
  name: string;
  fullName?: string;
  route?: string;
  iri?: string;
}
