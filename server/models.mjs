export class User {
    constructor(username, email, coins) {
        this.username = username;
        this.email = email;
        this.coins = coins;
    }
}

export class Phrase {
    constructor(text, film) {
        this.text = text;
        this.film = film;
    }
}

export class Game {
    constructor(phraseId, username, revealed, coins, vowelUsed, usedLetters, ended) {
        this.phraseId = phraseId;
        this.username = username;
        this.revealed = revealed;
        this.coins = coins;
        this.vowelUsed = vowelUsed;
        this.usedLetters = usedLetters;
        this.ended = ended;
    }
}

export class Letter {
    constructor(letter, cost) {
        this.letter = letter;
        this.cost = cost;
    }
}

export class GameMessage {
    constructor(correct, coinUpdate, hiddenPhrase) {
        this.correct = correct;
        this.coinUpdate = coinUpdate;
        this.hiddenPhrase = hiddenPhrase;
    }
}