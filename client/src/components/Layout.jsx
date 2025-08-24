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
    const setError = props.setError;
    const setLoading = props.setLoading;

    return (
        <>
            <NavbarCustom setError={setError} setLoading={setLoading}/>
            <div style={{ display: 'flex'}}>
                <FilmBar />
                <Outlet />
                <FilmBar />
            </div>
            <Footer />
        </>
    )
}

export { Layout }