export class User {
    constructor(username, email) {
        this.username = username;
        this.email = email;
    }
}

export class Game {
    constructor(revealed, vowelUsed, usedLetters, film, gameCoins, ended, win, startTime) {
        this.revealed = revealed;
        this.vowelUsed = vowelUsed;
        this.usedLetters = usedLetters;
        this.film = film;
        this.gameCoins = gameCoins;
        this.startTime = startTime;
        this.ended = ended;
        this.win = win;
    }
}

export class GameMessage {
    constructor(correct, coinUpdate, totCoins) {
        this.correct = correct;
        this.coinUpdate = coinUpdate;
        this.totCoins = totCoins;
    }
}

export class Phrase {
    constructor(text, film) {
        this.text = text;
        this.film = film;
    }
}