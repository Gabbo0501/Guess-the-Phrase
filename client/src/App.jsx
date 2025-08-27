import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import './App.css'

import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router';
import { login, getUserInfo, logOut, createGame, deleteGame } from './API/API.mjs';

import { Layout } from './components/Layout.jsx';
import { HomePage } from './components/Home.jsx';
import { LoginPage } from './components/Login.jsx';
import { NotFound } from './components/NotFound.jsx';
import { GamePage } from './components/Game.jsx';


function App() {

  const [gameID, setGameID] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [onError, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    try {
      setUser(await login(credentials));
      navigate('/');
    }
    catch (error) {
      setUser(null);
      throw error;
    }
  }

  const handleLogout = async () => {
    try {
      await logOut();
      setUser(null);
      navigate('/');
    }
    catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getUserInfo();
        setUser(user);
      } catch {
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  const startGame = async () => {
    try {
      setGameID(await createGame());
    } catch (error) {
      setError("Error in starting the game");
    }
  };

  const quitGame = async (gameID) => {
    if (gameID != null) {
      try {
        await deleteGame(gameID);
      } catch (error) {
        setError("Error in quitting the game");
      }
    }
    setGameID(null);
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Layout quitGame={quitGame} />}>
          <Route index element={<HomePage
            user={user}
            onError={onError}
            loading={loading}
            handleLogout={handleLogout}
            startGame={startGame}
          />} />
          <Route path="game" element={<GamePage
            user={user}
            gameID={gameID}
            loading={loading}
            setLoading={setLoading}
            onError={onError}
            setError={setError}
            quitGame={quitGame}
          />} />
          <Route path="login" element={<LoginPage user={user} handleLogin={handleLogin}/>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
