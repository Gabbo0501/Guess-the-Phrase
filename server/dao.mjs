import crypto from "crypto";
import sqlite from "sqlite3";
import { User, Phrase, Letter, Game } from './models.mjs';

const db = new sqlite.Database("./database.sqlite", (err) => {
    if (err) throw err;
});

export function getUser(username, password) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM Users WHERE username = ?", [username], (err, row) => {
            if (err) return reject(err);
            if (!row) return resolve(false);

            crypto.scrypt(password, row.salt, 32, (err, hashedPassword) => {
                if (err) return reject(err);
                if (!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword)) {
                    return resolve(false);
                }
                resolve(new User(row.username, row.email));
            });
        });
    });
}

export function updateUserCoins(username, newValue) {
    return new Promise((resolve, reject) => {
        db.run("UPDATE Users SET coins = ? WHERE username = ?", [newValue, username], function(err) {
            if (err) return reject(err);
            resolve();
        });
    });
}

export function getAllLetters() {
    return new Promise((resolve, reject) => {
        db.all("SELECT letter FROM Letters", [], (err, rows) => {
            if (err) return reject(err);
            const letters = rows.map(row => new Letter(row.letter, row.price));
            resolve(letters);
        });
    });
}

export function getRandomPhrase(logged) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM Phrases WHERE logged = ? ORDER BY RANDOM() LIMIT 1", [logged], (err, row) => {
            if (err) return reject(err);
            const phrase = new Phrase(row.text, row.film);
            const game = new Game(phrase);
            for (const char of phrase.text) {
                if (char >= 'A' && char <= 'Z') {
                    game.dict[char] = false;
                }
            }
            resolve(game);
        });
    });
}
