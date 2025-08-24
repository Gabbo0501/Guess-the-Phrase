import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import './App.css'

import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router';
import { login, getUserInfo, logOut } from './API/API.mjs';

import { Layout } from './components/Layout.jsx';
import { HomePage } from './components/Home.jsx';
import { LoginPage } from './components/Login.jsx';
import { NotFound } from './components/NotFound.jsx';
//import { GamePage } from './components/Game.jsx';


function App() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [onError, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    try {
      const user = await login(credentials);
      setUser(user);
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

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Layout
          setError={setError}
          setLoading={setLoading}
        />}>
          <Route index element={<HomePage
            user={user}
            onError={onError}
            setError={setError}
            loading={loading}
            setLoading={setLoading}
            handleLogout={handleLogout}
          />} />
          {/*<Route path="game" element={<GamePage
            user={user}
            loading={loading}
            setLoading={setLoading}
            onError={onError}
            setError={setError}
          />} />*/}
          <Route path="login" element={<LoginPage handleLogin={handleLogin}/>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
