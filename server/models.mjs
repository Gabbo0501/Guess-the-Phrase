export class User {
    constructor(username, email) {
        this.username = username;
        this.email = email;
    }
}

export class Phrase {
    constructor(text, film) {
        this.text = text;
        this.film = film;
    }
}

export class Game {
    constructor(id, phraseId, revealed, coins, vowelUsed, guessedLetters) {
        this.id = id;
        this.phraseId = phraseId;
        this.revealed = revealed;         
        this.coins = coins;
        this.vowelUsed = vowelUsed;
        this.guessedLetters = guessedLetters;
    }
}

export class Letter {
    constructor(letter, price) {
        this.letter = letter;
        this.price = price;
    }
}