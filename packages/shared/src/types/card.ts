export type House = 'Gryffindor' | 'Hufflepuff' | 'Ravenclaw' | 'Slytherin';

export interface Card {
  name: string;
  house: House;
  description: string;
  houseAdvantage: string;
  isCounter: boolean;
}

export type Deck = Card[];