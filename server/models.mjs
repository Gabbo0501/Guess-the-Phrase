export class User {
    constructor(username, email) {
        this.username = username;
        this.email = email;
    }
}

export class Phrase {
    constructor(text, film, guest) {
        this.text = text;
        this.film = film;
    }
}

export class Game {
    constructor(phrase) {
        this.phrase = phrase;
        this.dict = {};
    }
}

export class Letter {
    constructor(letter, price) {
        this.letter = letter;
        this.price = price;
    }
}