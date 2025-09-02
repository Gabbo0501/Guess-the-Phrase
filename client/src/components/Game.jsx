import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button, Badge, Container, Alert, Spinner, Card, Form, Row, Col, Modal } from "react-bootstrap";
import { getLettersCost, getGame, guessLetter, guessPhrase, updateUserCoins, expiredTime, showFilm } from "../API/API.mjs";

export function LetterSelector(props) {
    const usedLetters = props.usedLetters;
    const vowelUsed = props.vowelUsed;
    const coins = props.coins;
    const letterCosts = props.letterCosts;
    const letterSubmit = props.letterSubmit;

    const alphabet = Object.keys(letterCosts).sort();
    const vowels = alphabet.filter(letter => letterCosts[letter] === 10);

    const renderLetterButtons = () => {
        return alphabet.map(letter => {
            const cost = letterCosts[letter];
            const isVowel = vowels.includes(letter);
            const isUsed = usedLetters.split("").includes(letter);
            const cannotUseVowel = isVowel && vowelUsed && !isUsed;
            const notEnoughCoins = coins < cost*2 && !isUsed;

            let btnClass = "letter-btn";
            if (isUsed) btnClass += " used";
            if (isVowel) btnClass += " vowel";
            if (cannotUseVowel || notEnoughCoins || isUsed) btnClass += " disabled";

            const isDisabled = cannotUseVowel || notEnoughCoins || isUsed;
            let disableReason = "";
            if (isUsed) disableReason = "Already used";
            else if (notEnoughCoins) disableReason = "Not enough coins";
            else if (cannotUseVowel) disableReason = "You can use only one vowel per game";

            return (
              <span className="tooltip-wrapper" key={letter}>
                <Button
                  size="md"
                  className={btnClass}
                  disabled={isUsed || notEnoughCoins || cannotUseVowel}
                  onClick={async () => { await letterSubmit(letter); }}
                >
                  <div className="righteous-font">{letter}</div>
                  <Badge className="coin-badge">{cost}</Badge>
                </Button>
                {isDisabled && <div className="custom-tooltip">{disableReason}</div>}
              </span>
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
    const revealed = props.revealed;
    const words = revealed.split(" ");

    return (
        <div className="phrase-viewer">
            {words.map((word, wIdx) => (
                <span className="phrase-word" key={wIdx}>
                    {word.split("").map((char, cIdx) =>
                        char === "_" ? (
                            <span key={cIdx} className="phrase-letter"></span>
                        ) : (
                            <span key={cIdx} className={`phrase-letter revealed righteous-font`}>{char}</span>
                        )
                    )}
                    {wIdx < words.length - 1 && <span className="phrase-space"></span>}
                </span>
            ))}
        </div>
    );
}

function GameStatusBar(props) {
    const coins = props.coins;
    const ended = props.ended;
    const timeLeft = props.timeLeft;
    const setTimeLeft = props.setTimeLeft;
    const stop = props.stop;
    const setStop = props.setStop;
    const handleClick = props.handleClick;
    const film = props.film;
    const askForFilm = props.askForFilm;

    return (
        <div className="container mb-4">
            <div className="row align-items-start">
                <div className="col-3">
                    <div className="row">
                        <div className="col-auto text-center px-3">
                            <p className="righteous-font text-light fs-5 mb-0">Coins</p>
                            <p className="righteous-font text-light fs-1 fixed-width">{ended? "-" : coins}</p>
                        </div>
                        <div className="col-auto text-center px-3">
                            <p className="righteous-font text-light fs-5 mb-0">Time</p>
                            <Timer timeLeft={timeLeft} setTimeLeft={setTimeLeft} stop={stop} setStop={setStop} ended={ended} />
                        </div>
                    </div>
                </div>
                <div className="col-6">
                    {film ? (
                        <p className="righteous-font text-light fs-5">Film: {film}</p>
                    ) : (
                        <Button className="mt-1 righteous-font d-inline-flex gap-2" variant="success" onClick={askForFilm} disabled={coins<50}>
                            Show the film:
                            <Badge className="coin-badge">50</Badge>
                        </Button>
                    )}
                </div>
                <div className="col-3 text-end">
                    <Button className="righteous-font mt-1" variant="danger" onClick={handleClick}>
                        Exit
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function EndGameModal(props) {
    const coins = props.coins;
    const deltaCoins = props.deltaCoins;
    const win = props.win;
    const ended = props.ended;
    const runOutOfTime = props.runOutOfTime;
    const hiddenPhrase = props.hiddenPhrase;
    const hiddenFilm = props.hiddenFilm;
    const loading = props.loading;
    const onError = props.onError;
    const handleClick = props.handleClick;

    return (
        <Modal show={ended} centered>
            <Modal.Header className={win ? "bg-success justify-content-center" : "bg-red justify-content-center"}>
                <Modal.Title className="righteous-font fs-1 text-white">
                    { win ? "Winner!" : "Game Over!" }
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="d-flex flex-column align-items-center justify-content-center text-center">
                { onError && ( <Alert variant="warning">{onError}</Alert> ) }
                { win && 
                    <div className="d-flex align-items-center gap-2">
                        <p className="righteous-font fs-5 mb-0">You earned {Math.abs(deltaCoins)} coins!</p>
                        <div className="coin-badge"></div>
                    </div>
                }
                { runOutOfTime && 
                    <div className="d-flex align-items-center gap-2">
                        <p className="righteous-font fs-5 mb-0">You run out of time! You spent {Math.abs(deltaCoins)} coins!</p>
                        <div className="coin-badge"></div>
                    </div>
                }
                <p className="righteous-font-light">{"Balance: " + ((coins - 100) > 0 ? ("+" + (coins - 100)) : (coins - 100)) + " coins"}</p>
                <p className="righteous-font fs-5">The phrase was:</p>
                <p className="righteous-font fs-2">{hiddenPhrase}</p>
                <p className="righteous-font fs-5">from the movie {hiddenFilm}</p>
                <Button className="m-4 w-auto righteous-font" variant="secondary" onClick={handleClick} disabled={loading>0}>
                    {(loading>0) ? (
                        <Spinner animation="border" size="sm" role="status" aria-hidden="true"/>
                    ) : (
                        "Back to Home"
                    )}
                </Button>
            </Modal.Body>
        </Modal>
    );
}

export function Timer(props) {
    const timeLeft = props.timeLeft;
    const setTimeLeft = props.setTimeLeft;
    const stop = props.stop;
    const setStop = props.setStop;
    const ended = props.ended;

    useEffect(() => {
        if (stop || ended) return;
        if (timeLeft <= 0) {
            setStop(true);
            return;
        }
        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [stop, timeLeft, setTimeLeft, setStop]);

    return (
        <p className="righteous-font text-light fs-1 fixed-width">{timeLeft}</p>
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
    const [correctHyp, setCorrectHyp] = useState(false);
    const [uncorrectHyp, setUncorrectHyp] = useState(false);
    const [ended, setEnded] = useState(false);
    const [deltaCoins, setDeltaCoins] = useState(0);
    const [coinsUpdated, setCoinsUpdated] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [runOutOfTime, setRunOutOfTime] = useState(false);
    const [stop, setStop] = useState(false);

    const navigate = useNavigate();

    const fetchLetters = async () => {
        try {
            setLoading(prev => prev+1);
            setError(null);
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
            setCorrectHyp(false);
            setUncorrectHyp(false);
            setLoading(prev => prev+1);
            setError(null);

            const gameMessage = await guessPhrase(gameID, text);
            const updatedGame = await getGame(gameID);
            setGame(updatedGame);

            if (!updatedGame.ended) throw new Error("Game has not ended");
            setEnded(true);
            
            setDeltaCoins(gameMessage.coinUpdate);
        } catch (error) {
            setError("Error in guessing the phrase");
        } finally {
            setLoading(prev => Math.max(0, prev-1));
        }
    };

    const letterSubmit = async (letter) => {
        try {
            setCorrectHyp(false);
            setUncorrectHyp(false);
            setLoading(prev => prev+1);
            setError(null);

            const gameMessage = await guessLetter(gameID, letter);
            const updatedGame = await getGame(gameID);
            setGame(updatedGame);

            setDeltaCoins(gameMessage.coinUpdate);
            if (updatedGame.ended) {
                setEnded(true);
            } else {
                if (gameMessage.correct){
                    setCorrectHyp(true);
                } else {
                    setUncorrectHyp(true);
                }
            }
        } catch (error) {
            setError("Error in guessing the letter");
        } finally {
            setLoading(prev => Math.max(0, prev-1));
        }
    };

    const handleExpiredTime = async() => {
        try {
            setCorrectHyp(false);
            setUncorrectHyp(false);
            setLoading(prev => prev+1);
            setError(null);
            
            const gameMessage = await expiredTime(gameID);
            const updatedGame = await getGame(gameID);
            setGame(updatedGame);

            if (!updatedGame.ended) throw new Error("Game has not ended");
            setEnded(true);

            setDeltaCoins(gameMessage.coinUpdate);
        } catch (error) {
            setError("Error in running out of time");
        } finally {
            setLoading(prev => Math.max(0, prev-1));
        }
    };

    const askForFilm = async () => {
        try {
            setLoading(prev => prev+1);
            setError(null);
            await showFilm(gameID);
            const updatedGame = await getGame(gameID);
            setGame(updatedGame);
        } catch (error) {
            setError("Error in fetching film");
        } finally {
            setLoading(prev => Math.max(0, prev-1));
        }
    };

    const updateUser = async (username, gameID) => {
        try {
            setLoading(prev => prev+1);
            setError(null);
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
    }, [ended, gameID]);

    useEffect(() => {
        if (stop && !runOutOfTime && !ended) {
            setRunOutOfTime(true);
            handleExpiredTime();
        }
    }, [stop, runOutOfTime, ended]);



    if (loading>0 && !ended) {
        return (
            <Container className="page-center">
                <Spinner animation="border" size="lg" role="status" aria-hidden="true"/>
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
            <EndGameModal coins={game.coins} deltaCoins={deltaCoins} win={game.win===1} ended={ended} runOutOfTime={runOutOfTime} hiddenPhrase={game.revealed} hiddenFilm={game.film} loading={loading} onError={onError} handleClick={exitButtonAction}/>
            { onError && !ended && ( <Alert variant="warning">{onError}</Alert> ) }
            { correctHyp && ( 
                <Alert className="d-flex align-items-center justify-content-center gap-2 mb-3" variant="success">
                    <p className="righteous-font mb-0">Correct! You spent {Math.abs(deltaCoins)} coins</p>
                    <div className="coin-badge"></div>
                </Alert> 
            )}
            { uncorrectHyp && ( 
                <Alert className="d-flex align-items-center justify-content-center gap-2 mb-3" variant="danger">
                    <p className="righteous-font mb-0">Incorrect! You spent {Math.abs(deltaCoins)} coins</p>
                    <div className="coin-badge"></div>
                </Alert> 
            )}
            <Row className="justify-content-center">
                <Col md={12}>
                    <Card className="bg-dark mb-4 pb-4 px-5 pt-4">
                        <GameStatusBar ended={ended} film={game.film} askForFilm={askForFilm} coins={game.coins} timeLeft={timeLeft} setTimeLeft={setTimeLeft} stop={stop} setStop={setStop} handleClick={exitButtonAction} />
                        <PhraseViewer revealed={game.revealed} />
                    </Card>
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col md={7} lg={7}>
                    <LetterSelector usedLetters={game.usedLetters} vowelUsed={game.vowelUsed} coins={game.coins} letterCosts={letterCosts} letterSubmit={letterSubmit} />
                </Col>
                <Col md={5} lg={5}>
                    <GuessPhraseBox textSubmit={textSubmit} />
                </Col>
            </Row>
        </Container>
    )
}