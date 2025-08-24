import { useNavigate } from "react-router";
import { Navbar, Container } from "react-bootstrap";

function NavbarCustom(props) {
    const navigate = useNavigate();
    const setError = props.setError;
    const setLoading = props.setLoading;

    return (
        <Navbar className="pb-3 pt-3" expand="lg" bg="dark" variant="dark">
            <Container className="justify-content-center">
                <Navbar.Brand
                    onClick={() => { setLoading(false); setError(null); navigate("/"); }}
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
