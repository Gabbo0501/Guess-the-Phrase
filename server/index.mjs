import cors from 'cors';
import express from 'express';
import session from 'express-session';
import morgan from 'morgan';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import * as dao from './dao.mjs';
import { Game, GameMessage, User } from './models.mjs'


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
  return done(null, new User(user.username, user.email, user.coins));
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

app.patch('/api/user/:id', isLoggedIn, async (req, res) => {
  const username = req.params.id;
  const gameID = req.body.gameID;

  try {
    let userCoins = await dao.getUserCoins(username);
    if (userCoins === undefined || userCoins === null) {
      return res.status(404).json({ error: 'User not found' });
    }
    const game = await dao.getGame(gameID);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    if (game.username != username) {
      return res.status(403).json({ error: 'Not authorized to update this game' });
    }

    if (game.coins === 100) return res.status(200).end();
    userCoins = userCoins + game.coins - 100;
    if (userCoins < 0) userCoins = 0;
    await dao.updateUserCoins(username, userCoins);
    req.user.coins = userCoins;

    res.status(200).end();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/game', async (req, res) => {
  try {
    const logged = req.user ? 1 : 0;
    const username = req.user ? req.user.username : null;

    const phraseId = await dao.getRandomPhrase(logged);
    const phrase = await dao.getPhrase(phraseId);
    if (!phrase || !phrase.text) {
      return res.status(404).json({ error: "Phrase not found" });
    }

    let startingCoins = 100;
    if (username) {
      const userCoins = await dao.getUserCoins(username);
      startingCoins = userCoins < 100 ? userCoins : 100;
    }

    let revealed = phrase.text.replace(/[A-Z]/g, "_");
    let guessedLetters = "";
    let vowelUsed = 0;
    let ended = 0;

    const game = new Game(phraseId, username, revealed, startingCoins, vowelUsed, guessedLetters, ended);
    const gameID = await dao.createGame(game);
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
    res.json(game);
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

    if (phrase.text.toUpperCase() === presumedPhrase.toUpperCase()) {
      game.ended = 1;
      game.coins += 100;
      await dao.updateGame(gameID, game);
      return res.json(new GameMessage(true, 100, phrase));
    }
    else {
      game.ended = 1;
      game.coins -= 10;
      await dao.updateGame(gameID, game);
      return res.json(new GameMessage(false, -10, phrase));
    }
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