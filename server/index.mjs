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


// IMMAGINI
app.use('/images', express.static('public/images'));


// AUTENTICAZIONE UTENTE

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

app.get('/api/game', async (req, res) => {
  try {
    const logged = req.user ? 1 : 0;
    const game = await dao.getRandomPhrase(logged);
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/letters', async (req, res) => {
  try {
    const letters = await dao.getAllLetters();
    res.json(letters);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});