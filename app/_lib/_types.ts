type Suit = "H"|"D"|"C"|"S" 
type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | "J" | "Q" | "K" | "A"

type Card = {
    suit: Suit,
    value: number,
    rank: Rank
}

type CardString = `${Suit}_${Rank}`

type Deck = Card[]

export type {Card, CardString, Deck, Suit, Rank}