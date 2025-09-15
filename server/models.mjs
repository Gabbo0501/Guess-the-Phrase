export class User {
    constructor(username, email) {
        this.username = username;
        this.email = email;
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
    constructor(id, phraseId, username, revealed, vowelUsed, usedLetters, showFilm, gameCoins, ended, win, startTime) {
        this.id = id;
        this.phraseId = phraseId;
        this.username = username;
        this.revealed = revealed;
        this.vowelUsed = vowelUsed;
        this.usedLetters = usedLetters;
        this.showFilm = showFilm;
        this.gameCoins = gameCoins;
        this.ended = ended;
        this.win = win;
        this.startTime = startTime;
    }
}

export class Letter {
    constructor(letter, cost) {
        this.letter = letter;
        this.cost = cost;
    }
}