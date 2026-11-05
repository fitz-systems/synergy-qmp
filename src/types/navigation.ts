export interface Crumb {
  label: string;
  href: string;
}

export interface SearchParamsLike {
  get(name: string): string | null;
  toString(): string;
}
