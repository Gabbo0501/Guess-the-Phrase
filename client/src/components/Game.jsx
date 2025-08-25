import { useState } from "react";
import { Button, Badge, Container, Alert, Spinner, Card, Form, Row, Col } from "react-bootstrap";

const fakeGame = {
    id: 1,
    phraseId: 42,
    revealed: "H_LL_ W__L_ _________ ____",
    coins: 85,
    vowelUsed: 1,
    guessedLetters: "AHLW"
};

const letterCosts = {
    'A': 10, 'E': 10, 'I': 10, 'O': 10, 'U': 10,
    'H': 5, 'N': 5, 'S': 5, 'T': 5,
    'D': 4, 'L': 4, 'R': 4,
    'C': 3, 'F': 3, 'G': 3, 'M': 3, 'W': 3,
    'B': 2, 'P': 2, 'Y': 2,
    'J': 1, 'K': 1, 'Q': 1, 'V': 1, 'X': 1, 'Z': 1
};

export function LetterSelector(props) {
    const game = props.game;
    const letterCosts = props.letterCosts;

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
                    onClick={() => onLetterClick(letter)}
                    title={
                        cannotUseVowel ? "You can only use one vowel per game" :
                        notEnoughCoins ? `Need ${cost} coins` : `Costs ${cost} coins`
                    }
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

function GuessPhraseBox({ onSubmit }) {
    const [text, setText] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit(text);
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
    return (
        <div className="phrase-viewer">
            {revealed.split("").map((char, idx) =>
                char === " " ? (
                    <span key={idx} className="phrase-space"></span>
                ) : char === "_" ? (
                    <span key={idx} className="phrase-letter"></span>
                ) : (
                    <span key={idx} className="phrase-letter revealed righteous-font">{char}</span>
                )
            )}
        </div>
    );
}

function GameStatusBar(props) {
    const coins = props.coins;
    const time = props.time;
    const onAbandon = props.onAbandon;

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
            <Button className="righteous-font" variant="danger" onClick={onAbandon}>
                Exit
            </Button>
        </div>
    );
}

export function GamePage(props) {
    const user = props.user;
    const setError = props.setError;
    const onError = props.onError;
    const setLoading = props.setLoading;
    const loading = props.loading;

    const [time, setTime] = useState(60);

    const handleAbandon = () => {
        alert("Partita abbandonata!");
    };


    if (loading) {
        return (
            <Container className="page-center">
                <Spinner as="span" animation="border" size="lg" role="status" aria-hidden="true"/>
            </Container>
        );
    }

    return (
        <Container className="mt-4 mb-4">
            { onError && ( <Alert variant="warning">{onError}</Alert> ) }
            <Row className="justify-content-center">
                <Col md={12}>
                    <Card className="bg-dark mb-4 pb-4 px-5 pt-4">
                        <GameStatusBar coins={fakeGame.coins} time={time} onAbandon={handleAbandon} />
                        <PhraseViewer revealed={fakeGame.revealed} />
                    </Card>
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col md={7} lg={7}>
                    <LetterSelector game={fakeGame} letterCosts={letterCosts} />
                </Col>
                <Col md={5} lg={5}>
                    <GuessPhraseBox />
                </Col>
            </Row>
        </Container>
    )
}