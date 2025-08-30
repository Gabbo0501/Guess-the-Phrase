export class User {
    constructor(username, email, coins) {
        this.username = username;
        this.email = email;
        this.coins = coins;
    }
}

export class Phrase {
    constructor(testo, film) {
        this.testo = testo;
        this.film = film;
    }
}

export class Game {
    constructor(phraseId, user, revealed, coins, vowelUsed, guessedLetters, ended) {
        this.phraseId = phraseId;
        this.user = user;
        this.revealed = revealed;
        this.coins = coins;
        this.vowelUsed = vowelUsed;
        this.guessedLetters = guessedLetters;
        this.ended = ended;
    }
}

export class Letter {
    constructor(letter, cost) {
        this.letter = letter;
        this.cost = cost;
    }
}