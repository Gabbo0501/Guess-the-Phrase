export class User {
    constructor(username, email, coins) {
        this.username = username;
        this.email = email;
        this.coins = coins;
    }
}

export class Game {
    constructor(revealed, coins, vowelUsed, guessedLetters, ended) {
        this.revealed = revealed;
        this.coins = coins;
        this.vowelUsed = vowelUsed;
        this.guessedLetters = guessedLetters;
        this.ended = ended;
    }
}

export class GameMessage {
    constructor(correct, coinUpdate, hiddenPhrase) {
        this.correct = correct;
        this.coinUpdate = coinUpdate;
        this.hiddenPhrase = hiddenPhrase;
    }
}

export class Phrase {
    constructor(text, film) {
        this.text = text;
        this.film = film;
    }
}