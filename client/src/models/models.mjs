export class User {
    constructor(username, email, coins) {
        this.username = username;
        this.email = email;
        this.coins = coins;
    }
}

export class Game {
    constructor(revealed, coins, vowelUsed, usedLetters, film, ended, win) {
        this.revealed = revealed;
        this.coins = coins;
        this.vowelUsed = vowelUsed;
        this.usedLetters = usedLetters;
        this.film = film;
        this.ended = ended;
        this.win = win;
    }
}

export class GameMessage {
    constructor(correct, coinUpdate) {
        this.correct = correct;
        this.coinUpdate = coinUpdate;
    }
}

export class Phrase {
    constructor(text, film) {
        this.text = text;
        this.film = film;
    }
}