"use client"

import { useCallback, useMemo, useState } from "react";
import { deck, shuffle } from "../_data/_cards";
import { Card } from "../_lib/_types";
import { PlayingCard, PlayingCardBack } from "../_components/PlayingCard";
import { Button } from "../_components/Button";

// Blackjack Rules
// Accumulate highest point total without exceeding 21
// Players dealt face up
// Dealer dealt with first card down - "the hole card"
// Players "Stand" or "Hit" on their turn, they are dealt a new card if they Hit
// Players do all actions before the Dealer
// Dealer must Hit if the value of his hand is lower than 17, otherwise they must stand
// Edge Case: a "soft 17" where Dealer has is at 17 and has an Ace, ruling on this can differ
// If the dealer busts, the remaining players all win
// There are variant considerations called Side Rules
// https://www.officialgamerules.org/blackjack


// Things to figger out
// Ace 1/11
// "AI" players - this could be very stupid and use a ChatGPT API or something
    // I did get ChatGPT to reply with simple HIT/PASS answers without complaining about gambling or anything
    // Need to check API usage numbers and make sure I don't fart myself in my button with cost

const shuffledDeck = shuffle(deck)

function getWinner(p: number, pa: number, d: number, da: number): string|null{
    let player = {
        min: Math.min(p,pa),
        max: Math.max(p,pa),
        bust: p > 21 && pa > 21,
        blackjack: p == 21 || pa == 21,
        best: pa > 21 ? p:Math.max(p,pa)
    }

    let dealer = {
        min: Math.min(d,da),
        max: Math.max(d,da),
        bust: d > 21 && da > 21,
        blackjack: d == 21 || da == 21,
        best: da > 21 ? p:Math.max(d,da)
    }

    if (player.bust && !dealer.bust){ // Player bust
        return 'Dealer'
    }
    else if (!player.bust && dealer.bust){ // Dealer bust
        return 'Player'
    } else if (player.blackjack && !dealer.blackjack){ // Player blackjack, no push
        return 'Player'
    } else if (!player.blackjack && dealer.blackjack) { // Dealer blackjack, no push
        return 'Dealer'
    } else if (player.blackjack && dealer.blackjack) { // Blackjack Push
        return 'Push'
    } else if(player.best > dealer.best) { // Player higher score
        return 'Player'
    } else  if (player.best < dealer.best){ // Dealer higher score
        return 'Dealer'
    } else if(player.best == dealer.best){ // Same score push
        return 'Push'
    } else {
        return null
    }
}

function generateScoreString(player: boolean, total: number, aceTotal: number):string{
    let scoreString = player ? "Player has ":"Dealer shows "
    console.log(player, total, aceTotal)
    if (total > 21 && aceTotal >21){
        return scoreString + `bust! (${total})`
    }else if(total || aceTotal){
        scoreString += `${total}`
        if (total !== aceTotal) {
            scoreString += ` or ${aceTotal}`
        }
    } else {
        return scoreString + "no cards"
    }

    return scoreString
}

export default function Blackjack() {
    const [activeDeck, setActiveDeck] = useState(shuffledDeck)
    const [playerHand, setPlayerHand] = useState<Card[]>([])
    const [dealerHand, setDealerHand] = useState<Card[]>([])
    const [playerTurn, setPlayerTurn] = useState(true)
    const [dealerStay, setDealerStay] = useState(false)

    const playerTotal = useMemo(() => playerHand.reduce((acc, obj) => acc + obj.value, 0), [playerHand])
    const playerAceTotal = useMemo(() => playerHand.reduce((acc, obj) => acc + (obj.rank == "A" ? obj.value+10:obj.value), 0), [playerHand])
    const dealerTotal =  useMemo(() => dealerHand.reduce((acc, obj) => acc + obj.value, 0), [dealerHand])
    const dealerAceTotal =  useMemo(() => dealerHand.reduce((acc, obj) => acc + (obj.rank == "A" ? obj.value+10:obj.value), 0), [dealerHand])
    const dealerPublic = playerTurn ? dealerHand.length ? dealerTotal-dealerHand[0].value:0:dealerTotal
    const dealerPublicAces = [...dealerHand].filter((card,i) => i > 0 && card.rank == "A").length
    const dealerAcePublic = dealerPublicAces ? dealerPublic + (10*dealerPublicAces):dealerPublic
    const playerBlackjack = playerTotal == 21 || playerAceTotal == 21
    const dealerBlackjack = playerTotal == 21 || playerAceTotal == 21
    const playerBust = playerTotal > 21 && playerAceTotal > 21
    const dealerBust = dealerTotal > 21 && dealerAceTotal > 21
    
    const winner = useMemo(
        () => getWinner(playerTotal, playerAceTotal, dealerTotal, dealerAceTotal),
        [dealerAceTotal, dealerTotal, playerAceTotal, playerTotal]
    )

    const gameOver = playerBlackjack || dealerBlackjack || dealerStay || playerBust || dealerBust
    const showDealerHand = !playerTurn || gameOver

    const drawCard = useCallback(
      (player:boolean) => {
        const newDeck = [...activeDeck];
        const newCard = newDeck.shift() as Card
        setActiveDeck(newDeck)
        if(player && newCard){
            // pop new
            setPlayerHand(() => [...playerHand, newCard])
            if (playerTotal + newCard.value > 21 && playerAceTotal+newCard.value > 21){
                setPlayerTurn(false)
            }
        } else {
            setDealerHand(() => [...dealerHand, newCard])
            if (dealerTotal + newCard.value >= 17 && dealerAceTotal+newCard.value >= 17){
                setDealerStay(true)
            }
        }
      },
      [activeDeck, dealerAceTotal, dealerHand, dealerTotal, playerAceTotal, playerHand, playerTotal],
    )

    function newGame(){
        setActiveDeck(() => shuffle(shuffledDeck))
        setPlayerHand(() => [])
        setDealerHand(() => [])
        setPlayerTurn(() => true)
        setDealerStay(() => false)
        drawStartingHands()
    }
    
    const drawStartingHands = useCallback(() => {
        const newDeck = [...activeDeck]
        const pHand = []
        const dHand = []
        
        for (let i = 0; i < 4; i++) {
            const newCard = newDeck.shift() as Card
            
            if(i % 2 == 0){
                pHand.push(newCard)
            } else {
                dHand.push(newCard)
            }
        }

        setPlayerHand(pHand)
        setDealerHand(dHand)
        setActiveDeck(newDeck)
      },
      [activeDeck],
    )

    return (
        <div>
            <div className="bg-green-900">
                <div className="text-center border-b-2 border-green-950 p-4">
                     <div className="text-right text-sm">{ generateScoreString(false, showDealerHand ? dealerTotal:dealerPublic, showDealerHand ? dealerAceTotal:dealerAcePublic) }</div>
                    <div className="flex flex-row flex-wrap gap-4 justify-center" title={dealerTotal.toString()}>
                        { 
                            dealerHand.map((card, i) => {
                                return i > 0 || showDealerHand ? <PlayingCard key={`${card.suit}_${card.rank}`} card={card} />:<PlayingCardBack  />
                            })
                        }
                    </div>
                </div>
                <h1 className="text-white text-center text-3xl bg-green-950 p-2 h-14">{gameOver ? winner !== 'Push' ? `${winner} wins!`:'Push!':''}</h1>
                <div className="text-center bg-green-900 p-4">
                    <div className="flex flex-row flex-wrap gap-4 justify-center">
                        { 
                            playerHand.map((card) => {
                                return <PlayingCard key={`${card.suit}_${card.rank}`} card={card} />
                            })
                        }
                    </div>
                    <div className="text-right text-sm">{ generateScoreString(true, playerTotal, playerAceTotal) }</div>
                    { playerTurn && (
                    <div className="mt-2 flex flex-row gap-2 justify-center">
                        <Button actionFn={() => drawCard(true)} label="Hit" disabled={playerTotal >= 21} />
                        <Button actionFn={() => setPlayerTurn(false)} label="Stay" disabled={playerTotal >= 21} />
                    </div>
                    )
                }
                </div>
            </div>
            <div className="flex flex-row gap-4 justify-center my-3">
                <Button actionFn={() => newGame()} label="New Game" disabled={false} />
                {
                    !playerTurn && <Button actionFn={() => drawCard(false)} label="Dealer Hit" disabled={dealerTotal >= 17 || gameOver} />
                }
            </div>
        </div>
    )
}
