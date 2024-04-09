import { Card, Rank, Suit } from "../_lib/_types"

const commonCardClasses = "w-36 h-56 text-lg "
const cardSuitIcons = {
    "black": {
        "S": "\u2660",
        "H": "\u2665",
        "C": "\u2663",
        "D": "\u2666"
    },
    "white": {
        "S": "\u2664",
        "H": "\u2661",
        "C": "\u2667",
        "D": "\u2662"
    }
}

function getIcon(suit: Suit): string{
    return cardSuitIcons.white[suit]
}

function getCardFace(icon: string, value: number, rank: Rank){
    const faceIcons = []
    if(typeof rank == "number" || rank === "A"){
        for (let i = 0; i < value; i++) {
            faceIcons.push(<div>{icon}</div>)
        }
    } else {
        faceIcons.push(<div className="text-[9rem] text-yellow-500">{rank}</div>)
    }
    return faceIcons
}

const PlayingCard = function({card}: {card: Card}){
    const suitIcon = getIcon(card.suit)
    const cardFaceIcons = getCardFace(suitIcon, card.value, card.rank)
    const suitCardClasses = (card.suit === "D" || card.suit === "H") ? "border-red-400 text-red-400":"border-black text-black"

    return (
        <>
            <div className={"border border-white rounded-xl bg-slate-200 " + commonCardClasses + suitCardClasses}>
                <div className={"grid grid-cols-3 " + commonCardClasses}>
                    <div className="text-center w-12">
                        <div>{card.rank}</div>
                        <div>{suitIcon}</div>
                    </div>
                    <div className="flex flex-row flex-wrap justify-around place-self-center text-2xl">
                        {cardFaceIcons}
                    </div>
                    <div className="text-center place-self-end w-12">
                        <div>{suitIcon}</div>
                        <div>{card.rank}</div>
                    </div>
                </div>
            </div>
        </>
    )
}

const PlayingCardBack = function(){
    const cardBackground = 'https://picsum.photos/200/300'

    return (
        <div className={"border border-white rounded-xl text-center " + commonCardClasses} style={{backgroundImage: `url(${cardBackground})`}}></div>
    )
}

const LabelCard = function({ label }: {label: string}){
    const cardBackground = 'https://picsum.photos/200/300'

    return (
        <div className={"border border-white rounded-xl text-center hover:border-red-400 " + commonCardClasses} style={{backgroundImage: `url(${cardBackground})`}}>
            <h1 className="bg-slate-100/50 text-black mt-[50%] uppercase font-bold">{ label }</h1>
        </div>
    )
}

export { PlayingCard, PlayingCardBack, LabelCard }