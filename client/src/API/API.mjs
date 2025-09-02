import { Game, User, GameMessage, Phrase } from "../models/models.mjs";

const SERVER_URL = "http://localhost:3001"

export const login = async (credentials) => {
    const response = await fetch(`${SERVER_URL}/api/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error (data.error);
    }
    return new User(data.username, data.email, data.coins);
}

export const getUserInfo = async () => {
    const response = await fetch(`${SERVER_URL}/api/session/current`, {
        method: 'GET',
        credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error (data.error);
    }
    return new User(data.username, data.email, data.coins);
}

export const logOut = async() => {
    const response = await fetch(SERVER_URL + '/api/session/current', {
        method: 'DELETE',
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error("Errore nel logout");
    }
}

export const getLettersCost = async () => {
    const response = await fetch(`${SERVER_URL}/api/letters`, {
        method: 'GET',
        credentials: 'include'
    });
    const dictionary = await response.json();
    if (!response.ok) {
        throw new Error (dictionary.error);
    }
    return dictionary;
}

export const updateUserCoins = async (username, gameID) => {
    const response = await fetch(`${SERVER_URL}/api/user/${username}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameID })
    });
    if (!response.ok) {
        throw new Error("Errore nell'aggiornamento delle monete");
    }
}

export const createGame = async () => {
    const response = await fetch(`${SERVER_URL}/api/game`, {
        method: 'POST',
        credentials: 'include'
    });
    const gameID = await response.json();
    if (!response.ok) {
        throw new Error (gameID.error);
    }
    return gameID;
}

export const getGame = async (gameID) => {
    const response = await fetch(`${SERVER_URL}/api/game/${gameID}`, {
        method: 'GET',
        credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error (data.error);
    }
    return new Game(data.revealed, data.coins, data.vowelUsed, data.usedLetters, data.film, data.ended, data.win);
}

export const guessPhrase = async (gameID, phrase) => {
    const response = await fetch(`${SERVER_URL}/api/game/${gameID}/guessPhrase`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phrase })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error (data.error);
    }
    return new GameMessage(data.correct, data.coinUpdate);
}

export const guessLetter = async (gameID, letter) => {
    const response = await fetch(`${SERVER_URL}/api/game/${gameID}/guessLetter`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ letter })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error (data.error);
    }
    return new GameMessage(data.correct, data.coinUpdate);
}

export const expiredTime = async (gameID) => {
    const response = await fetch(`${SERVER_URL}/api/game/${gameID}/expiredTime`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error (data.error);
    }
    return new GameMessage(data.correct, data.coinUpdate);
}

export const showFilm = async (gameID) => {
    const response = await fetch(`${SERVER_URL}/api/game/${gameID}/showFilm`, {
        method: 'PATCH',
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error ("Errore nel recupero del film");
    }
}

export const deleteGame = async (gameID) => {
    const response = await fetch(`${SERVER_URL}/api/game/${gameID}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error("Errore nella cancellazione del gioco");
    }
}
