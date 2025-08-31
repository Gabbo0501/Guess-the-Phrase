import { Container, Navbar } from "react-bootstrap";

function Footer () {
    return(
        <Navbar className="pb-3 pt-3" expand="lg" bg="dark" variant="dark">
            <Container className="d-flex flex-column flex-md-row">
                <span className="text-light righteous-font-light opacity-100" style={{ fontSize: "0.9rem" }}>
                    Copyright © 2025
                </span>
                <span className="text-light righteous-font-light opacity-100" style={{ fontSize: "0.9rem", marginLeft: "0", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
                    Made by Mondino Gabriele
                </span>
            </Container>
        </Navbar>
    );
}

export { Footer };