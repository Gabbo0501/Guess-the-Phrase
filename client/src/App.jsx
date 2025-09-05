import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import './App.css'

import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router';
import { login, getUserInfo, logOut, createGame, deleteGame, getUserCoins } from './API/API.mjs';

import { Layout } from './components/Layout.jsx';
import { HomePage } from './components/Home.jsx';
import { LoginPage } from './components/Login.jsx';
import { NotFound } from './components/NotFound.jsx';
import { GamePage } from './components/Game.jsx';


function App() {

  const [gameID, setGameID] = useState(null);
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(0);
  const [onError, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    try {
      setLoading(prev => prev+1);
      setUser(await login(credentials));
      navigate('/');
    }
    catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(prev => Math.max(0, prev-1));
    }
  }

  const handleLogout = async () => {
    try {
      setLoading(prev => prev+1);
      await logOut();
      setUser(null);
      navigate('/');
    }
    catch (error) {
      throw error;
    } finally {
      setLoading(prev => Math.max(0, prev-1));
    }
  };

  const checkAuth = async () => {
    try {
      setLoading(prev => prev+1);
      const user = await getUserInfo();
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(prev => Math.max(0, prev-1));
    }
  };

  const startGame = async () => {
    setLoading(prev => prev+1);
    setError(null);
    try {
      setGameID(await createGame());
    } catch (error) {
      setError("Error in starting the game");
    } finally {
      setLoading(prev => Math.max(0, prev-1));
    }
  };

  const quitGame = async (gameID) => {
    if (gameID != null) {
      setLoading(prev => prev+1);
      setError(null);
      try {
        await deleteGame(gameID);
      } catch (error) {
        setError("Error in quitting the game");
      } finally {
        setLoading(prev => Math.max(0, prev-1));
        setGameID(null);
      }
    }
  };

  const getCoins = async (username) => {
    try {
      setLoading(prev => prev+1);
      const coins = await getUserCoins(username);
      setCoins(coins);
    } catch (error) {
      setError("Error in fetching coins");
    } finally {
      setLoading(prev => Math.max(0, prev-1));
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      getCoins(user.username);
    }
  }, [user]);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Layout gameID={gameID} quitGame={quitGame}/>}>
          <Route index element={<HomePage
            user={user}
            onError={onError}
            loading={loading}
            handleLogout={handleLogout}
            startGame={startGame}
            coins={coins}
          />} />
          <Route path="game" element={<GamePage
              user={user}
              gameID={gameID}
              loading={loading}
              setLoading={setLoading}
              onError={onError}
              setError={setError}
              quitGame={quitGame}
              coins={coins}
              setCoins={setCoins}
          />} />
          <Route path="login" element={<LoginPage user={user} handleLogin={handleLogin}/>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
