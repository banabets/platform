# Progressive Power Poker

## Game Synopsis

**Progressive Power Poker** is a web-based, single-player poker game inspired by "Jacks or Better" video poker. Players wager tokens and are dealt a five-card hand, aiming to achieve the highest possible poker combination. The game features a progressive mode, allowing players to continue playing and accumulating profit until they choose to cash out or hit a "Bust" (no win) hand. The payout structure is based on classic poker hands, with a special "Jackpot" (Royal Flush) offering the highest reward.

---

## Game Flow

1. **Wager Selection**  
   The player selects their wager amount using the provided input.

2. **Start Game**  
   The player clicks the "Start Progressive" button to begin a new round.

3. **Hand Dealing**  
   - The game randomly determines the outcome (hand type) based on the backend/game engine.
   - Five cards are displayed, visually representing the resulting hand (e.g., Pair, Three of a Kind, etc.).
   - Cards are revealed one by one with a flip animation.

4. **Result & Payout**  
   - The hand is evaluated against the paytable.
   - If the hand is a winning combination, the corresponding payout (multiplier) is added to the player's profit.
   - If the hand is a "Bust" (no win), the round ends and the player loses their wager.

5. **Progressive Mode**  
   - If the player wins (not a "Bust"), they can choose to continue playing with their accumulated profit or cash out.
   - Continuing plays another round with the same wager, adding or subtracting from the profit based on the next result.
   - The player can cash out at any time to secure their current profit.

6. **Game End**  
   - The game ends when the player either hits a "Bust" or chooses to cash out.

---

## Key Features

- **Paytable**:  
  Displays payouts for each hand type (Pair, Three of a Kind, Straight, Full House, Four of a Kind, Jackpot).

- **Animated UI**:  
  Cards are revealed with animations, and the UI provides visual feedback for profit/loss.

- **Progressive Play**:  
  Players can risk their winnings for higher rewards or cash out at any time.

- **Token Integration**:  
  Wagers and payouts are handled in tokens, with support for different token types and values.

---

This game offers a fast-paced, visually engaging poker experience with a risk/reward mechanic that encourages players to push their luck for bigger wins.
