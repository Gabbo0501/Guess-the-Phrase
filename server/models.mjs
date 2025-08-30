export class User {
    constructor(username, email) {
        this.username = username;
        this.email = email;
    }
}

export class Phrase {
    constructor(testo, film) {
        this.testo = testo;
        this.film = film;
    }
}

export class Game {
    constructor(phraseId, logged, revealed, coins, vowelUsed, guessedLetters) {
        this.phraseId = phraseId;
        this.logged = logged;
        this.revealed = revealed;
        this.coins = coins;
        this.vowelUsed = vowelUsed;
        this.guessedLetters = guessedLetters;
    }
}

export class Letter {
    constructor(letter, cost) {
        this.letter = letter;
        this.cost = cost;
    }
}