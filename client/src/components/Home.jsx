import { Alert, Button, Container, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router";

function StartButton(props){
  const user = props.user;
  const setError = props.setError;
  const loading = props.loading;
  const setLoading = props.setLoading;

  const navigate = useNavigate();

  return (
      <Button className="mx-3 w-auto righteous-font" variant="success" onClick={async () => {
          setLoading(true);
          try {
            setError(null);
            {{/*navigate("/game");*/}}
            setError("Started game");
          } catch (error) {
            setError("Error in starting the game");
          }
          finally {
            setLoading(false);
          }
        }}>
        {loading && (
          <span>
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/>
          </span>
        )}
        {!loading && user && (
          <span>Start</span>
        )}
        {!loading && !user && (
          <span>Try</span>
        )}
      </Button>
  );
}

function LogButton(props) {
  const user = props.user;
  const handleLogout = props.handleLogout;
  const setError = props.setError;
  const setLoading = props.setLoading;
  const navigate = useNavigate();

    return (
      <>
        { user ? (
          <Button className="mx-3 w-auto righteous-font" variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <Button className="mx-3 w-auto righteous-font" variant="success" onClick={() => { setLoading(false); setError(null); navigate("/login"); }}>
            Login
          </Button>
        )}
      </>
    );
}

function HomePage(props) {
  const user = props.user;
  const onError = props.onError;
  const setError = props.setError;
  const setLoading = props.setLoading;
  const handleLogout = props.handleLogout;

  return(
    <Container className="page-center">
      <img
          alt="Guess the Phrase"
          src="/logo.png"
          width="250"
          height="250"
          className="d-inline-block align-top ms-2"
        />
      <Row className="justify-content-center">
        <h1 className="display-1 righteous-font mb-0">GUESS THE PHRASE</h1>
        <p className="fs-4 righteous-font">Movie Edition</p>
      </Row>
      { user && (
        <Row>
          <p>Welcome {user.username}!</p>
        </Row>
      )}
      { onError && (
        <Alert variant="warning">
          {onError}
        </Alert>
      )}
      { !user && (
        <Row>
          <p>Login to play the full version</p>
        </Row>
      )}
      <Row className="mb-3 justify-content-center">
        <StartButton user={user} setError={setError} setLoading={setLoading}/>
        <LogButton user={user} handleLogout={handleLogout} setError={setError} setLoading={setLoading}/>
      </Row>
    </Container>
  )
}

export { HomePage };

