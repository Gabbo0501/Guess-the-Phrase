export class User {
    constructor(username, email, coins) {
        this.username = username;
        this.email = email;
        this.coins = coins;
    }
}

export class Phrase {
    constructor(id, text, film) {
        this.id = id;
        this.text = text;
        this.film = film;
    }
}

export class Game {
    constructor(id, phraseId, username, revealed, coins, vowelUsed, usedLetters, showFilm, ended, win) {
        this.id = id;
        this.phraseId = phraseId;
        this.username = username;
        this.revealed = revealed;
        this.coins = coins;
        this.vowelUsed = vowelUsed;
        this.usedLetters = usedLetters;
        this.showFilm = showFilm;
        this.ended = ended;
        this.win = win;
    }
}

export class Letter {
    constructor(letter, cost) {
        this.letter = letter;
        this.cost = cost;
    }
}