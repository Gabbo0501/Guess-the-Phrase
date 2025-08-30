export class User {
    constructor(username, email, coins) {
        this.username = username;
        this.email = email;
        this.coins = coins;
    }
}

export class Game {
    constructor(revealed, coins, vowelUsed, guessedLetters) {
        this.revealed = revealed;
        this.coins = coins;
        this.vowelUsed = vowelUsed;
        this.guessedLetters = guessedLetters;
    }
}