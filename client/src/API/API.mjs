import { User } from "../models/models.mjs";

const SERVER_URL = "http://localhost:3001";



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
    return new User(data.username, data.email);
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
    return new User(data.username, data.email);
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
    const data = await response.json();
    if (!response.ok) {
        throw new Error (data.error);
    }
    return data;
}

export const createGame = async () => {
    /*const response = await fetch(`${SERVER_URL}/api/game`, {
        method: 'POST',
        credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error (data.error);
    }*/
    return 2;
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
    return data;
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
