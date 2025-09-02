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

export function getAllLetters() {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Letters", [], (err, rows) => {
            if (err) return reject(err);
            const letters = rows.map(row => new Letter(row.letter, row.cost));
            resolve(letters);
        });
    });
}

export function getLetterCost(letter) {
    return new Promise((resolve, reject) => {
        db.get("SELECT cost FROM Letters WHERE letter = ?", [letter], (err, row) => {
            if (err) return reject(err);
            resolve(row.cost);
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
            resolve(new Phrase(row.id, row.text, row.film));
        });
    });
}

export function createGame(phraseID, username, revealed, coins, vowelUsed, usedLetters, showFilm, ended, win) {
    return new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO Games (phraseId, username, revealed, coins, vowelUsed, usedLetters, showFilm, ended, win) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [phraseID, username, revealed, coins, vowelUsed, usedLetters, showFilm, ended, win], function(err) {
                if (err) return reject(err);
                resolve(this.lastID);
            }
        );
    });
}

export function getGame(id) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM Games WHERE id = ?", [id], async (err, row) => {
            if (err) return reject(err);
            if (!row) return resolve(null);
            resolve(new Game(row.id, row.phraseId, row.username, row.revealed, row.coins, row.vowelUsed, row.usedLetters, row.showFilm, row.ended, row.win));
        });
    });
}

export function updateGame(id, game) {
    return new Promise((resolve, reject) => {
        db.run(
            "UPDATE Games SET revealed = ?, coins = ?, vowelUsed = ?, usedLetters = ?, showFilm=?, ended = ?, win = ? WHERE id = ?",
            [game.revealed, game.coins, game.vowelUsed, game.usedLetters, game.showFilm, game.ended, game.win, id], function(err) {
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