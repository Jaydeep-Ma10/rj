// types/index.ts
export interface Bet {
  amount: number;
  multiplier: number;
  choice: string; // "green" | "red" | "violet" | "digit" | "big" | "small"
}

export interface GameResult {
  period: string;
  number: number;
  bigSmall: 'Big' | 'Small';
  color: 'green' | 'red' | 'violet';
}
