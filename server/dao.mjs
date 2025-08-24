import crypto from "crypto";
import sqlite from "sqlite3";
import { User } from './models.mjs';

const db = new sqlite.Database("./database.sqlite", (err) => {
    if (err) throw err;
});


// AUTHENTICATION

export function getUserByUsername(username, password) {
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