import cors from 'cors';
import express from 'express';
import session from 'express-session';
import morgan from 'morgan';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import * as dao from './dao.mjs';


const app = express();
const port = 3001;

app.use(express.json());
app.use(morgan('dev'));

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessState: 200,
  credentials: true
};

app.use(cors(corsOptions));

passport.use(new LocalStrategy(async function verify(username, password, done) {
  const user = await dao.getUser(username, password);
  if (!user) return done(null, false, { message: 'Incorrect username or password' });
  return done(null, user);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}

app.use(session({
  secret: "shhhhh... it's a secret!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));



app.use('/images', express.static('public/images'));

app.post('/api/session', passport.authenticate('local'), function(req, res) {
  return res.status(201).json(req.user);
});

app.get('/api/session/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({error: 'Not authenticated'});
  }
});

app.delete('/api/session/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});

app.get('/api/user/:id/coins', isLoggedIn, async (req, res) => {
  const username = req.params.id;
  if (req.user.username !== username) {
    return res.status(403).json({ error: 'Not authorized to access this user' });
  }
  try {
    const coins = await dao.getUserCoins(username);
    if (coins === undefined || coins === null) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(coins);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/letters', async (req, res) => {
  try {
    const letters = await dao.getAllLetters();
    const letterCosts = {};
    letters.forEach(item => {
      letterCosts[item.letter] = item.cost;
    });
    res.json(letterCosts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/game', async (req, res) => {
  try {
    const logged = req.user ? 1 : 0;
    const username = req.user ? req.user.username : null;

    if (username) {
      const userCoins = await dao.getUserCoins(username);
      if (userCoins === undefined || userCoins === null) {
        return res.status(404).json({ error: 'User not found' });
      }
      if (userCoins <= 0) {
        return res.status(400).json({ error: 'Not enough coins to start a new game' });
      }
    }

    const phraseId = await dao.getRandomPhrase(logged);
    const phrase = await dao.getPhrase(phraseId);
    if (!phrase || !phrase.text) {
      return res.status(404).json({ error: "Phrase not found" });
    }

    let revealed = phrase.text.replace(/[A-Z]/g, "_");
    let gameCoins = 0;
    let usedLetters = "";
    let vowelUsed = 0;
    let showFilm = 0;
    let ended = 0;
    let win = 0;

    const gameID = await dao.createGame(phraseId, username, revealed, vowelUsed, usedLetters, showFilm, gameCoins, ended, win);
    res.status(201).json(gameID);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/game/:id', async (req, res) => {
  const gameID = req.params.id;
  const username = req.user ? req.user.username : null;
  try {
    const game = await dao.getGame(gameID);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    if (game.username !== username) {
      return res.status(403).json({ error: 'Not authorized to access this game' });
    }

    let film = null;
    if (game.showFilm) {
      const phrase = await dao.getPhrase(game.phraseId);
      if (!phrase || !phrase.text) {
        return res.status(404).json({ error: "Phrase not found" });
      }
      film = phrase.film;
    }

    res.json({
      revealed: game.revealed,
      vowelUsed: game.vowelUsed,
      usedLetters: game.usedLetters,
      film: film,
      gameCoins: game.gameCoins,
      ended: game.ended,
      win: game.win
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/game/:id/guessPhrase', async (req, res) => {
  const gameID = req.params.id;
  const presumedPhrase = req.body.phrase;
  const username = req.user ? req.user.username : null;

  try {
    const game = await dao.getGame(gameID);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    if (game.username !== username) {
      return res.status(403).json({ error: 'Not authorized to access this game' });
    }

    const phrase = await dao.getPhrase(game.phraseId);
    if (!phrase || !phrase.text) {
      return res.status(404).json({ error: "Phrase not found" });
    }

    let userCoins = 0;
    if (username) userCoins = await dao.getUserCoins(username);
    if (userCoins === undefined || userCoins === null) {
      return res.status(404).json({ error: 'User not found' });
    }

    let coinUpdate = 0;

    if (phrase.text.toUpperCase() === presumedPhrase.trim().toUpperCase()) {
      game.revealed = phrase.text;
      game.showFilm = 1;
      game.ended = 1;
      game.win = 1;
      if (username) {
        coinUpdate += 100;
        game.gameCoins += 100;
        userCoins += 100;
        await dao.updateUserCoins(username, userCoins < 0? 0 : userCoins);
      }
      await dao.updateGame(gameID, game);
      return res.json({
        correct: true,
        coinUpdate
      });
    }
    else {
      return res.json({
        correct: false,
        coinUpdate
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/game/:id/guessLetter', async (req, res) => {
  const gameID = req.params.id;
  const letter = req.body.letter;
  const username = req.user ? req.user.username : null;

  try {
    const game = await dao.getGame(gameID);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    if (game.username !== username) {
      return res.status(403).json({ error: 'Not authorized to access this game' });
    }

    const phrase = await dao.getPhrase(game.phraseId);
    if (!phrase || !phrase.text) {
      return res.status(404).json({ error: "Phrase not found" });
    }

    let userCoins = 0;
    if (username) userCoins = await dao.getUserCoins(username);
    if (userCoins === undefined || userCoins === null) {
      return res.status(404).json({ error: 'User not found' });
    }

    const cost = await dao.getLetterCost(letter);
    if (username && userCoins < cost) {
      return res.status(400).json({ error: 'Not enough coins' });
    }
    if (game.usedLetters.includes(letter)) {
      return res.status(400).json({ error: 'Letter already guessed' });
    }

    game.usedLetters += letter;
    if (cost === 10){
      game.vowelUsed = 1;
    }

    let correct = false;
    let coinUpdate = 0;

    if (phrase.text.toUpperCase().includes(letter.toUpperCase())) {
      correct = true;
      if (username) coinUpdate -= cost;

      const positions = [];
      for (let i = 0; i < phrase.text.length; i++) {
        if (phrase.text[i].toUpperCase() === letter.toUpperCase()) {
          positions.push(i);
        }
      }
      let revealedArr = game.revealed.split('');
      positions.forEach(pos => {
        revealedArr[pos] = letter;
      });
      game.revealed = revealedArr.join('');

    } else {
      correct = false;
      if (username) coinUpdate -= cost * 2;
    }

    if (phrase.text.toUpperCase() === game.revealed.toUpperCase()) {
      game.ended = 1;
      game.showFilm = 1;
      game.win = 1;
      if (username) coinUpdate += 100;
    }

    if (username) {
      game.gameCoins += coinUpdate;
      userCoins += coinUpdate;
      await dao.updateUserCoins(username, userCoins < 0? 0 : userCoins);
    }

    await dao.updateGame(gameID, game);
    res.json({
      correct,
      coinUpdate
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/game/:id/expiredTime', async (req, res) => {
  const gameID = req.params.id;
  const username = req.user ? req.user.username : null;

  try {
    const game = await dao.getGame(gameID);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    if (game.username !== username) {
      return res.status(403).json({ error: 'Not authorized to access this game' });
    }

    const phrase = await dao.getPhrase(game.phraseId);
    if (!phrase) {
      return res.status(404).json({ error: "Phrase not found" });
    }

    let userCoins = 0;
    if (username) userCoins = await dao.getUserCoins(username);
    if (userCoins === undefined || userCoins === null) {
      return res.status(404).json({ error: 'User not found' });
    }

    let coinUpdate = 0; 

    game.revealed = phrase.text;
    game.showFilm = 1;
    game.ended = 1;
    game.win = 0;

    if (username) {
      game.gameCoins -= 20;
      userCoins -= 20;
      coinUpdate = -20;
      await dao.updateUserCoins(username, userCoins < 0? 0 : userCoins);
    }

    await dao.updateGame(gameID, game);
    res.json({
      correct: false,
      coinUpdate
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/game/:id/showFilm', async (req, res) => {
  const gameID = req.params.id;
  const username = req.user ? req.user.username : null;

  try {
    const game = await dao.getGame(gameID);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    if (game.username !== username) {
      return res.status(403).json({ error: 'Not authorized to access this game' });
    }

    let userCoins = 0;
    if (username) userCoins = await dao.getUserCoins(username);
    if (userCoins === undefined || userCoins === null) {
      return res.status(404).json({ error: 'User not found' });
    }

    game.showFilm = 1;

    if (username) {
      game.gameCoins -= 20;
      userCoins -= 20;
      await dao.updateUserCoins(username, userCoins < 0? 0 : userCoins);
    }

    await dao.updateGame(gameID, game);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/game/:id', async (req, res) => {
  const gameID = req.params.id;
  const username = req.user ? req.user.username : null;
  try {
    const game = await dao.getGame(gameID);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    if (game.username !== username) {
      return res.status(403).json({ error: 'Not authorized to delete this game' });
    }
    await dao.deleteGame(gameID);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});