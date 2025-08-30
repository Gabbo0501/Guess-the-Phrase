import { useNavigate } from "react-router";
import { Navbar, Container } from "react-bootstrap";

function NavbarCustom(props) {
    const navigate = useNavigate();
    const gameID = props.gameID;
    const quitGame = props.quitGame;

    return (
        <Navbar className="pb-3 pt-3" expand="lg" bg="dark" variant="dark">
            <Container className="justify-content-center">
                <Navbar.Brand
                    onClick={() => { quitGame(gameID); navigate("/"); }}
                    style={{ cursor: "pointer" }}
                    className="mx-auto righteous-font"
                >
                    Guess the Phrase
                </Navbar.Brand>
            </Container>
        </Navbar>
    );
}

export { NavbarCustom };
