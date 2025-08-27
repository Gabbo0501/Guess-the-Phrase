import cors from 'cors';
import express from 'express';
import session from 'express-session';
import morgan from 'morgan';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import * as dao from './dao.mjs';
import { Game } from './models.mjs'


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
  return done(null, {username: user.username, email: user.email});
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

app.post('/api/game', async (req, res) => {
  try {
    const logged = req.user ? 1 : 0;
    const phraseId = await dao.getRandomPhrase(logged);
    const phrase = await dao.getPhrase(phraseId);
    let startingCoins = 100;

    if (req.user) {
      const userCoins = await dao.getUserCoins(req.user.username);
      startingCoins = userCoins < 100 ? userCoins : 100;
      await dao.updateUserCoins(req.user.username, userCoins - startingCoins);
    }

    let revealed = phrase.text.replace(/[A-Z]/g, "_");
    let guessedLetters = "";
    let vowelUsed = 0;

    const game = {
      phraseId,
      revealed,
      coins: startingCoins,
      vowelUsed,
      guessedLetters
    };
    const gameId = await dao.createGame(game);
    res.json(gameId);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/game/:id', async (req, res) => {
  const gameId = req.params.id;
  try {
    const game = await dao.getGame(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/game/:id', async (req, res) => {
  const gameId = req.params.id;
  try {
    console.log("Deleting game " + gameId);
    await dao.deleteGame(gameId);
     console.log("Game deleted");
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});