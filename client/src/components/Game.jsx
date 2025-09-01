import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button, Badge, Container, Alert, Spinner, Card, Form, Row, Col, Modal } from "react-bootstrap";
import { getLettersCost, getGame, guessLetter, guessPhrase, updateUserCoins } from "../API/API.mjs";

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
    const coins = props.coins;
    const time = props.time;
    const handleClick = props.handleClick;

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

export function EndGameModal(props) {
    const loading = props.loading;
    const onError = props.onError;
    const handleClick = props.handleClick;
    const deltaCoins = props.deltaCoins;
    const ended = props.ended;
    const hiddenPhrase = props.hiddenPhrase;
    const correct = props.correct;

    return (
        <Modal show={ended} centered>
            <Modal.Header className={correct ? "bg-success justify-content-center" : "bg-red justify-content-center"}>
                <Modal.Title className="righteous-font fs-1 text-white">
                    {correct ? "Winner!" : "Game Over!"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="d-flex flex-column align-items-center justify-content-center text-center">
                { onError && ( <Alert variant="warning">{onError}</Alert> ) }
                {correct && 
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <p className="righteous-font fs-5 mb-0">You earned {deltaCoins} coins!</p>
                        <div className="coin-badge"></div>
                    </div>
                }
                <p className="righteous-font fs-5">The phrase was:</p>
                <p className="righteous-font fs-2">{hiddenPhrase.text}</p>
                <p className="righteous-font fs-5">from the movie {hiddenPhrase.film}</p>
                <Button className="m-4 w-auto righteous-font" variant="secondary" onClick={handleClick}>
                    {(loading>0) ? (
                    <span>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/>
                    </span>
                    ) : (
                        "Back to Home"
                    )}
                </Button>
            </Modal.Body>
        </Modal>
    );
}

export function GamePage(props) {
    const user = props.user;
    const gameID = props.gameID;
    const setError = props.setError;
    const onError = props.onError;
    const setLoading = props.setLoading;
    const loading = props.loading;
    const quitGame = props.quitGame;
    const checkAuth = props.checkAuth;

    const [game, setGame] = useState(null);
    const [letterCosts, setLetterCosts] = useState([]);
    const [correct, setCorrect] = useState(false);
    const [uncorrect, setUncorrect] = useState(false);
    const [ended, setEnded] = useState(false);
    const [hiddenPhrase, setHiddenPhrase] = useState("");
    const [deltaCoins, setDeltaCoins] = useState(0);
    const [coinsUpdated, setCoinsUpdated] = useState(false);
    const [time, setTime] = useState(60);

    const navigate = useNavigate();

    const fetchLetters = async () => {
        try {
            setLoading(prev => prev+1);
            setLetterCosts(await getLettersCost());
        } catch (error) {
            setError("Error in fetching letter costs");
        } finally {
            setLoading(prev => Math.max(0, prev-1));
        }
    };

    const fetchGame = async (gameID) => {
        try {
            setLoading(prev => prev+1);
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
            setLoading(prev => Math.max(0, prev-1));
        }
    };

    const textSubmit = async (text) => {
        try {
            setCorrect(false);
            setUncorrect(false);
            setLoading(prev => prev+1);
            const gameMessage = await guessPhrase(gameID, text);
            if (gameMessage.correct){
                setCorrect(true);
            } else {
                setUncorrect(true);
            }
            setDeltaCoins(gameMessage.coinUpdate);
            const updatedGame = await getGame(gameID);
            setGame(updatedGame);
            if (updatedGame.ended) {
                setEnded(true);
                setHiddenPhrase(gameMessage.hiddenPhrase);
            }
        } catch (error) {
            setError("Error in guessing the phrase");
        } finally {
            setLoading(prev => Math.max(0, prev-1));
        }
    };

    const letterSubmit = async (letter) => {
        try {
            setCorrect(false);
            setUncorrect(false);
            setLoading(prev => prev+1);
            const gameMessage = await guessLetter(gameID, letter);
            if (gameMessage.correct){
                setCorrect(true);
            } else {
                setUncorrect(true);
            }
            setDeltaCoins(gameMessage.coinUpdate);
            const updatedGame = await getGame(gameID);
            setGame(updatedGame);
            if (updatedGame.ended) {
                setEnded(true);
                setHiddenPhrase(gameMessage.hiddenPhrase);
            }
        } catch (error) {
            setError("Error in guessing the letter");
        } finally {
            setLoading(prev => Math.max(0, prev-1));
        }
    };

    const updateUser = async (username, gameID) => {
        try {
            setLoading(prev => prev+1);
            await updateUserCoins(username, gameID);
        } catch (error) {
            setError("Error in updating user coins");
        } finally {
            setLoading(prev => Math.max(0, prev-1));
        }
    };

    const exitButtonAction = async () => {
        await quitGame(gameID);
        navigate("/");
    };

    useEffect(() => {
        fetchGame(gameID);
    }, [gameID]);

    useEffect(() => {
        fetchLetters();
    }, []);

    useEffect(() => {
        if (ended && user && !coinsUpdated) {
            updateUser(user.username, gameID).then(checkAuth);
            setCoinsUpdated(true);
        }
    }, [ended, user, gameID, coinsUpdated]);

    if (loading>0 && !ended) {
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
            <EndGameModal ended={ended} hiddenPhrase={hiddenPhrase} correct={correct} deltaCoins={deltaCoins} loading={loading} onError={onError} handleClick={exitButtonAction}/>
            { onError && !ended && ( <Alert variant="warning">{onError}</Alert> ) }
            { correct && !ended && ( 
                <Alert className="d-flex align-items-center justify-content-center gap-2 mb-3" variant="success">
                    <p className="righteous-font mb-0">Correct! You spent {deltaCoins} coins</p>
                    <div className="coin-badge"></div>
                </Alert> 
            )}
            { uncorrect && !ended && ( 
                <Alert className="d-flex align-items-center justify-content-center gap-2 mb-3" variant="danger">
                    <p className="righteous-font mb-0">Incorrect! You spent {deltaCoins} coins</p>
                    <div className="coin-badge"></div>
                </Alert> 
            )}
            <Row className="justify-content-center">
                <Col md={12}>
                    <Card className="bg-dark mb-4 pb-4 px-5 pt-4">
                        <GameStatusBar coins={game.coins} time={time} handleClick={exitButtonAction} />
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