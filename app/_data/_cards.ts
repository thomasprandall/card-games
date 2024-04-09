// This file defines our core card data and exports most of the data pieces for use in games
import { Suit, Rank, Deck} from "../_lib/_types"

const suits: Suit[] = ["C","D","H","S"]
const ranks: Rank[] = ["A",2,3,4,5,6,7,8,9,10,"J","Q","K"]

let deck: Deck = []

// This function converts a card Rank (Ace, 2, King, etc...) to a numerical value
function rankToValue(rank:Rank): number{
    let val
    if(typeof rank !== "number" && rank !== "A"){
        val = 10
    } else if (rank == "A") {
        val = 1
    } else {
        val = rank
    }

    return val
}

// This function takes a Deck (Card[]) and shuffles it randomly (enough)
function shuffle(deck: Deck): Deck{
    let shuffled = [...deck]
    
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled
}

// Here we build our base deck, it comes out in order of suit and rank so we have to shuffle it for normal use
for (let suit of suits) {
    for(let rank of ranks){
        deck.push(
            {
                value: rankToValue(rank),
                rank: rank,
                suit: suit
            }
        )
    }
}

// So we export an already shuffled deck for ease of use
const shuffledDeck = shuffle(deck)

// Notice we do export the shuffle method as well as the original sorted deck so you can use as needed
export {deck, shuffledDeck, shuffle, suits, ranks}