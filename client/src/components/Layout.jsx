import { Outlet } from 'react-router';
import { NavbarCustom } from './Navbar.jsx';
import { Footer } from './Footer.jsx';

function FilmBar() {
  return (
    <div className='filmbar'>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className='filmbar-item'/>
      ))}
    </div>
  );
}

function Layout(props) {
  const gameID = props.gameID;
  const quitGame = props.quitGame;
  const isGameActive = props.isGameActive;
  const loading = props.loading;

  return (
    <>
      <NavbarCustom gameID={gameID} quitGame={quitGame} loading={loading} />
      <div className={`main${isGameActive ? ' game-active' : ''}`}>
        <FilmBar />
        <div className='outlet-container'>
          <Outlet />
        </div>
        <FilmBar />
      </div>
      <Footer />
    </>
  );
}

export { Layout }