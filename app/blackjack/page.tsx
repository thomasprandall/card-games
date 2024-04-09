"use client"

import { useCallback, useMemo, useState } from "react";
import { deck, shuffle, shuffledDeck } from "../_data/_cards";
import { Card, Deck } from "../_lib/_types";
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
// "AI" players - this could be very stupid and use a ChatGPT API or something
    // I did get ChatGPT to reply with simple HIT/PASS answers without complaining about gambling or anything
    // Need to check API usage numbers and make sure I don't fart myself in my button with cost
// Add popular Side Rules
// Automate dealer draw

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
    if (total > 21 && aceTotal >21){
        return scoreString + `bust! (${total})`
    }else if(total || aceTotal){ 
        scoreString += `${total}`
        // Avoid showing "or " score string if they are the same or one is a bust
        if (total !== aceTotal && aceTotal < 22) {
            scoreString += ` or ${aceTotal}`
        }
    } else {
        return scoreString + "no cards"
    }

    return scoreString
}

export default function Blackjack() {
    const [activeDeck, setActiveDeck] = useState(shuffledDeck) // Here we keep track of our deck of cards as an array
    const [playerHand, setPlayerHand] = useState<Card[]>([]) // Player and dealer hands are each arrays of cards as well, they start empty
    const [dealerHand, setDealerHand] = useState<Card[]>([])
    const [playerTurn, setPlayerTurn] = useState(true) // Simple flag for if it is the players turn or not
    const [dealerStay, setDealerStay] = useState(false) // Similar flag for if the dealer has to stay

    // I am deriving a lot of values from the hand arrays rather than keeping them in state.
    // I use useMemo to prevent recalculating these unless the hands actually change
    const playerTotal = useMemo(() => playerHand.reduce((acc, obj) => acc + obj.value, 0), [playerHand])
    const playerAceTotal = useMemo(() => playerHand.reduce((acc, obj) => acc + (obj.rank == "A" ? obj.value+10:obj.value), 0), [playerHand])
    const dealerTotal =  useMemo(() => dealerHand.reduce((acc, obj) => acc + obj.value, 0), [dealerHand])
    const dealerAceTotal =  useMemo(() => dealerHand.reduce((acc, obj) => acc + (obj.rank == "A" ? obj.value+10:obj.value), 0), [dealerHand])
    const dealerPublic = playerTurn ? dealerHand.length ? dealerTotal-dealerHand[0].value:0:dealerTotal
    const dealerPublicAces = [...dealerHand].filter((card,i) => i > 0 && card.rank == "A").length
    const dealerAcePublic = dealerPublicAces ? dealerPublic + (10*dealerPublicAces):dealerPublic
    // I use these derived values to create some shorthand boolean values to use in the UI presentation
    const playerBlackjack = playerTotal == 21 || playerAceTotal == 21
    const dealerBlackjack = playerTotal == 21 || playerAceTotal == 21
    const playerBust = playerTotal > 21 && playerAceTotal > 21
    const dealerBust = dealerTotal > 21 && dealerAceTotal > 21
    const winner = useMemo(
        () => getWinner(playerTotal, playerAceTotal, dealerTotal, dealerAceTotal),
        [dealerAceTotal, dealerTotal, playerAceTotal, playerTotal]
    )
    const gameOver = (playerBlackjack || dealerBlackjack) || (playerBust || dealerBust) || (!playerTurn && dealerStay)
    const showDealerHand = !playerTurn || gameOver

    // I created a draw card function to handle the array mutations for the deck and hands
    const drawCard = useCallback(
      (player:boolean) => {
        // Draw a card: remove from deck array and update deck state
        const newDeck: Deck = [...activeDeck];
        const newCard = newDeck.shift() as Card
        setActiveDeck(newDeck)
        // Add card to appropriate hand
        if(player){
            setPlayerHand(() => [...playerHand, newCard])
            if (playerTotal + newCard.value > 21 && playerAceTotal+newCard.value > 21){
                setPlayerTurn(() => false)
            }
        } else {
            setDealerHand(() => [...dealerHand, newCard])
            if (dealerTotal + newCard.value >= 17 && dealerAceTotal+newCard.value >= 17){
                setDealerStay(() => true)
            }
        }
      },
      [activeDeck, dealerAceTotal, dealerHand, dealerTotal, playerAceTotal, playerHand, playerTotal],
    )

    // This utility function resets the player turn and dealer stay state as well as calls our function to shuffle the deck and draw fresh
    function newGame(){
        setPlayerTurn(() => true)
        setDealerStay(() => false)
        drawStartingHands()
    }
    
    // This utility function shuffled a new deck and alternates drawing cards into player/dealer hands, then updates state
    const drawStartingHands = useCallback(() => {
        const newDeck = shuffle([...deck])
        setActiveDeck(() => newDeck)
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
      [],
    )
    
    // Utility function to update the player stay state and also check for dealer blackjack to update dealer stay state
    function playerStay(){
        setPlayerTurn(() => false)
        if(dealerBlackjack){
            setDealerStay(() => true)
        }
    }

    return (
        <div>
            <div className="bg-green-900">
                <div className="text-center border-b-2 border-green-950 p-4">
                    {/* Here we output our dealer cards and score string */}
                    <div className="text-right text-sm">{ generateScoreString(false, showDealerHand ? dealerTotal:dealerPublic, showDealerHand ? dealerAceTotal:dealerAcePublic) }</div>
                    <div className="flex flex-row flex-wrap gap-4 justify-center" title={dealerTotal.toString()}>
                        { 
                            dealerHand.map((card, i) => {
                                return i > 0 || showDealerHand ? <PlayingCard key={`${card.suit}_${card.rank}`} card={card} />:<PlayingCardBack  />
                            })
                        }
                    </div>
                </div>
                {/* Our winner output reserves the middle of the "table" */}
                <h1 className="text-white text-center text-3xl bg-green-950 p-2 h-14">{gameOver ? winner !== 'Push' ? `${winner} wins!`:'Push!':''}</h1>
                {/* Here we output our player cards and score string */}
                <div className="text-center bg-green-900 p-4">
                    <div className="flex flex-row flex-wrap gap-4 justify-center">
                        { 
                            playerHand.map((card) => {
                                return <PlayingCard key={`${card.suit}_${card.rank}`} card={card} />
                            })
                        }
                    </div>
                    <div className="text-right text-sm">{ generateScoreString(true, playerTotal, playerAceTotal) }</div>
                    {/* If it is the player's turn and we have an active game we show Hit/Stay buttons */}
                    { (playerTurn && playerTotal > 0) && (
                    <div className="mt-2 flex flex-row gap-2 justify-center">
                        <Button actionFn={() => drawCard(true)} label="Hit" disabled={playerTotal >= 21} />
                        <Button actionFn={() => playerStay()} label="Stay" disabled={playerTotal >= 21} />
                    </div>
                    )
                }
                </div>
            </div>
            <div className="flex flex-row gap-4 justify-center my-3">
                {/* We always show the Next Hand button and show the dealer draw button on their turn. Dealer draw will be automated in the future */}
                <Button actionFn={() => newGame()} label="Next Hand" disabled={false} />
                {
                    !playerTurn && <Button actionFn={() => drawCard(false)} label="Dealer Hit" disabled={dealerTotal >= 17 || gameOver} />
                }
            </div>
        </div>
    )
}
