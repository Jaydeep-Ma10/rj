export interface Bet {
    amount: number;
    multiplier: number;
    choice: string;
}
export interface GameResult {
    period: string;
    number: number;
    bigSmall: 'Big' | 'Small';
    color: 'green' | 'red' | 'violet';
}
