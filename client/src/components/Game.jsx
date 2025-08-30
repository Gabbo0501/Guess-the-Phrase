import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button, Badge, Container, Alert, Spinner, Card, Form, Row, Col } from "react-bootstrap";
import { getLettersCost, getGame } from "../API/API.mjs";

export function LetterSelector(props) {
    const game = props.game;
    const letterCosts = props.letterCosts;
    const letterSubmit = props.letterSubmit;

    const alphabet = Object.keys(letterCosts).sort();
    const vowels = alphabet.filter(letter => letterCosts[letter] === 10);

    const renderLetterButtons = () => {
        return alphabet.map(letter => {
            const cost = letterCosts[letter];
            const isVowel = vowels.includes(letter);
            const isGuessed = game.guessedLetters.split("").includes(letter);
            const cannotUseVowel = isVowel && game.vowelUsed && !isGuessed;
            const notEnoughCoins = game.coins < cost;

            let btnClass = "letter-btn";
            if (isGuessed) btnClass += " guessed";
            if (isVowel) btnClass += " vowel";
            if (cannotUseVowel || notEnoughCoins || isGuessed) btnClass += " disabled";

            return (
                <Button
                    key={letter}
                    size="md"
                    className={btnClass}
                    disabled={isGuessed || notEnoughCoins || cannotUseVowel}
                    onClick={async () => { await letterSubmit(letter); }}
                >
                    <span className="righteous-font">{letter}</span>
                    <Badge className="coin-badge">{cost}</Badge>
                </Button>
            );
        });
    };
    return (
        <Card>
            <Card.Header className="bg-red">
                <h4>Pick a letter</h4>
            </Card.Header>
            <Card.Body className="text-center bg-dark">
                <div className="tastiera">
                    {renderLetterButtons()}
                </div>
            </Card.Body>
        </Card>
    );
}

function GuessPhraseBox(props) {
    const textSubmit = props.textSubmit;

    const [text, setText] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        await textSubmit(text);
        setText("");
    };

    return (
        <Card>
            <Card.Header className="bg-red">
                <h4>Guess the phrase</h4>
            </Card.Header>
            <Card.Body className="text-center bg-dark">
                <Form onSubmit={handleSubmit}>
                    <Form.Control
                        as="textarea"
                        name="guess"
                        rows={3}
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Write your guess here..."
                    />
                    <Button className="mt-3 righteous-font" type="submit" variant="success">
                        Submit
                    </Button>
                </Form>                
            </Card.Body>
        </Card>
    );
}

function PhraseViewer(props) {
    const revealed = props.revealed || "";
    return (
        <div className="phrase-viewer">
            {revealed.split("").map((char, idx) =>
                char === " " ? (
                    <div key={idx} className="phrase-space"></div>
                ) : char === "_" ? (
                    <div key={idx} className="phrase-letter"></div>
                ) : (
                    <div key={idx} className="phrase-letter revealed righteous-font">{char}</div>
                )
            )}
        </div>
    );
}

function GameStatusBar(props) {
    const gameID = props.gameID;
    const coins = props.coins;
    const time = props.time;
    const quitGame = props.quitGame;

    const navigate = useNavigate();

    const handleClick = async () => {
        await quitGame(gameID);
        navigate("/");
    };

    return (
        <div className="d-flex justify-content-between align-items-start mb-4">
            <div className="d-flex align-items-start gap-5">
                <div className="d-flex flex-column align-items-start">
                    <p className="righteous-font text-light fs-5 mb-1">Coins</p>
                    <p className="righteous-font text-light fs-1 mt-0">{coins}</p>
                </div>
                <div className="d-flex flex-column align-items-start">
                    <p className="righteous-font text-light fs-5 mb-1">Time</p>
                    <p className="righteous-font text-light fs-1 mt-0">{time}</p>
                </div>
            </div>
            <Button className="righteous-font" variant="danger" onClick={handleClick}>
                Exit
            </Button>
        </div>
    );
}

export function GamePage(props) {
    const gameID = props.gameID;
    const setError = props.setError;
    const onError = props.onError;
    const setLoading = props.setLoading;
    const loading = props.loading;
    const quitGame = props.quitGame;

    const [game, setGame] = useState();
    const [updatedGame, setUpdatedGame] = useState();
    const [letterCosts, setLetterCosts] = useState([]);
    const [time, setTime] = useState(60);

    const textSubmit = async (text) => {
        alert("text sent: " + text);
    };

    const letterSubmit = async (letter) => {
        alert("letter sent: " + letter);
    };

    const fetchLetters = async () => {
        try {
            setLetterCosts(await getLettersCost());
        } catch (error) {
            setError("Error in fetching letter costs");
        }
    };

    const fetchGame = async (gameID) => {
        try {
            setLoading(true);
            setError(null);
            if (gameID) {
                setGame(await getGame(gameID));
            }
            else {
                setGame(null);
            }
        } catch (error) {
            setError("Error in fetching the game");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (updatedGame) setUpdatedGame(false);
        fetchGame(gameID);
    }, [gameID, updatedGame]);

    useEffect(() => {
        fetchLetters();
    }, []);


    if (loading) {
        return (
            <Container className="page-center">
                <Spinner as="span" animation="border" size="lg" role="status" aria-hidden="true"/>
            </Container>
        );
    }

    if (!game && !loading) {
        return (
            <Container className="page-center">
                <h2 className="righteous-font display-6">Game not found</h2>
            </Container>
        );
    }

    return (
        <Container className="mt-4 mb-4">
            { onError && ( <Alert variant="warning">{onError}</Alert> ) }
            <Row className="justify-content-center">
                <Col md={12}>
                    <Card className="bg-dark mb-4 pb-4 px-5 pt-4">
                        <GameStatusBar gameID={gameID} coins={game.coins} time={time} quitGame={quitGame} />
                        <PhraseViewer revealed={game.revealed} />
                    </Card>
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col md={7} lg={7}>
                    <LetterSelector game={game} letterCosts={letterCosts} letterSubmit={letterSubmit} />
                </Col>
                <Col md={5} lg={5}>
                    <GuessPhraseBox textSubmit={textSubmit} />
                </Col>
            </Row>
        </Container>
    )
}