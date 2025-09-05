import { Outlet, useLocation } from 'react-router';
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
    
    const location = useLocation();
    const isGamePage = location.pathname.startsWith('/game');

    return (
        <>
            <NavbarCustom gameID={gameID} quitGame={quitGame}/>
            <div className={`main${isGamePage ? ' gamepage-main' : ''}`}>
                <FilmBar />
                <div className='outlet-container'>
                    <Outlet />
                </div>
                <FilmBar />
            </div>
            <Footer />
        </>
    )
}

export { Layout }