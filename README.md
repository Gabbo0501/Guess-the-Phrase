# Guess the Phrase

A *Wheel of Fortune*-style game: you must guess a famous quote (movie quotes) within 60 seconds, by picking letters or by directly submitting the full phrase.

- **Demo mode (not authenticated)**: no coin costs/earnings.
- **Authenticated mode**: actions have coin costs/bonuses and are persisted in the DB.


## Game Rules (summary)

- **Time limit**: 60 seconds (based on `startTime` stored in the DB).
- **Letters**:
  - variable cost (table `Letters`)
  - if the letter is present: in authenticated mode you pay **-cost**
  - if the letter is not present: in authenticated mode you pay **-2*cost**
  - a letter already used cannot be selected again
  - **only one vowel per game** (vowels have cost 10)
- **Guessing the full phrase**:
  - if correct: the game ends and the movie title becomes visible
  - in authenticated mode: **+100** coins
- **Show movie title**:
  - in authenticated mode costs **-20** coins
- **Time expired**:
  - the phrase is revealed and the game is lost
  - in authenticated mode costs **-20** coins
- **Starting a new game** (authenticated user): not allowed if the user's coins are `<= 0`.


## Running (development)

### Requirements

- Node.js (recommended >= 18)
- npm


### API Server (Express)

```bash
cd server
npm install
node index.mjs
```

`http://localhost:3001`

### Client (React + Vite)

```bash
cd client
npm install
npm run dev
```

`http://localhost:5173`


## React Client Application Routes

- **Route `/`** - *Home page*: allows starting a new game (demo or authenticated) and accessing login/logout.
- **Route `/login`** - *Login page*: user authentication form.
- **Route `/game`** - *Game page*: shows the phrase grid, the timer, the on-screen keyboard, the phrase input box, and all game actions.
- **Route `*`** - *Not Found*: error page for non-existing routes.


## API Server

### Session

- **POST `/api/session`**
  - User login (Passport Local)
  - Body: `{ "username": "...", "password": "..." }`
  - Response: authenticated user
- **GET `/api/session/current`**
  - Response: authenticated user (if present)
- **DELETE `/api/session/current`**
  - User logout

### User

- **GET `/api/user/coins`** (requires login)
  - Response: user's coin balance

### Game

- **GET `/api/letters`**
  - Response: dictionary `{ letter: cost }`

- **POST `/api/game`**
  - Creates a new game (demo or authenticated)
  - Response: created game id

- **GET `/api/game/:id`**
  - Response: game state (masked phrase, used letters, movie title if unlocked, etc.)

- **PATCH `/api/game/:id/guessLetter`**
  - Body: `{ "letter": "A" }`
  - Response: attempt outcome, coin delta, total coins

- **PATCH `/api/game/:id/guessPhrase`**
  - Body: `{ "phrase": "..." }`
  - Response: attempt outcome, coin delta, total coins

- **PATCH `/api/game/:id/showFilm`**
  - Unlocks the movie title
  - Response: coin delta, total coins

- **PATCH `/api/game/:id/expiredTime`**
  - Marks the game as expired
  - Response: coin delta, total coins

- **DELETE `/api/game/:id`**
  - Deletes the game


## Database Tables

- **Table `Users`**
  - `username` (primary key)
  - `password`: hashed password
  - `salt`
  - `email`
  - `coins`

- **Table `Phrases`**
  - `id` (primary key)
  - `text`
  - `film`
  - `logged`: `0` = demo, `1` = authenticated

- **Table `Games`**
  - `id` (primary key)
  - `phraseId`
  - `username`: is `null` in demo mode
  - `revealed`: phrase mask, where unrevealed letters are replaced with `_`
  - `vowelUsed`: `0` = no vowel used yet, `1` = vowel already used
  - `usedLetters`: already used letters (both wrong and correct)
  - `showFilm`: `0` = do not show the movie title, `1` = show it
  - `gameCoins`: balance of coins earned/spent in the game (always `0` in demo mode)
  - `ended`: `0` = game not finished, `1` = game finished
  - `win`: `0` = game not won, `1` = game won
  - `startTime`: game start timestamp (used by the timer)

- **Table `Letters`**
  - `letter` (primary key)
  - `cost`


## Main React Components

- **`Layout`**: common layout (navbar, footer, side bands with film-strip pattern).
- **`NavbarCustom`**: navbar with the game icon; when pressed during a game it acts as an exit button.
- **`HomePage`**: landing page with buttons to start a game and login/logout.
- **`GamePage`**: game logic and UI.
- **`GameStatusBar`**: coins, time, exit, show-movie button (and the movie title when unlocked).
- **`PhraseViewer`**: grid that displays the masked phrase and revealed letters.
- **`LetterSelector`**: keyboard to pick letters (costs, disabled states, tooltips).
- **`GuessPhraseBox`**: area to type and submit the full phrase.
- **`EndGameModal`**: summary modal shown at the end of the game.
- **`Timer`**: game timer.
- **`LoginPage` / `AuthForm`**: login form.
- **`NotFound`**: page for non-existing routes.
- **`Footer`**: footer with author information.


## Users Credentials

Users included in the DB (`server/database.sqlite`).

- **gabrimondo / Gabbo05012002**: user with games and coins
- **prof1234 / Ciao1234**: user without games
- **iacopom / 27Ottobre**: user with games and zero coins
