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
                resolve(new User(row.username, row.email, row.coins));
            });
        });
    });
}

export function getUserCoins(username) {
    return new Promise((resolve, reject) => {
        db.get("SELECT coins FROM Users WHERE username = ?", [username], (err, row) => {
            if (err) return reject(err);
            resolve(row ? row.coins : 0);
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
            resolve (row.id);
        });
    });
}

export function getPhrase(id) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM Phrases WHERE id = ?", [id], (err, row) => {
            if (err) return reject(err);
            resolve (new Phrase(row.text, row.film));
        });
    });
}

export function createGame(game) {
    return new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO Games (phraseId, revealed, coins, vowelUsed, guessedLetter) VALUES (?, ?, ?, ?, ?)", [game.phraseId, game.revealed, game.coins, game.vowelUsed, game.guessedLetters], function(err) {
                if (err) return reject(err);
                resolve(this.lastID);
            }
        );
    });
}

export function getGame(id) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM Games WHERE id = ?", [id], (err, row) => {
            if (err) return reject(err);
            if (!row) return resolve(null);
            resolve(new Game(row.id, row.phraseId, row.revealed, row.coins, row.vowelUsed, row.guessedLetter));
        });
    });
}

export function updateGame(id, revealed, coins, vowelUsed, guessedLetters) {
    return new Promise((resolve, reject) => {
        db.run(
            "UPDATE Games SET revealed = ?, coins = ?, vowelUsed = ?, guessedLetter = ? WHERE id = ?", [revealed, coins, vowelUsed, guessedLetters, id], function(err) {
                if (err) return reject(err);
                resolve();
            }
        );
    });
}

export function deleteGame(id) {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM Games WHERE id = ?", [id], function(err) {
            if (err) return reject(err);
            resolve();
        });
    });
}