export type RoundingKey = '0.25' | '0.5' | '1' | '2';

export interface GradeEntry {
  id: string;
  name: string;
  /** Raw string value as typed by the user; computed from subgrades when they exist. */
  grade: string;
  /** Weight percentage, e.g. "100" or "50". Empty = treat as 100. */
  weight: string;
  subgrades: GradeEntry[];
}
