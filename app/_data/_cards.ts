import { Suit, Rank, Deck} from "../_lib/_types"

const suits: Suit[] = ["C","D","H","S"]
const ranks: Rank[] = ["A",2,3,4,5,6,7,8,9,10,"J","Q","K"]

let deck: Deck = []

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

function shuffle(deck: Deck): Deck{
    let shuffled = [...deck]
    
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled
}

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

const shuffledDeck = shuffle(deck)

export {deck, shuffledDeck, shuffle, suits, ranks}