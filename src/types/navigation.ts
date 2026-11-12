export interface Crumb {
  label: string;
  href: string;
}

export interface SearchParamsLike {
  get(name: string): string | null;
  toString(): string;
}

export interface LegacyRedirect {
  source: string;
  destination: string;
  has?: { type: "query"; key: string; value: string }[];
}

export type PageSearchParams = Record<string, string | string[] | undefined>;
