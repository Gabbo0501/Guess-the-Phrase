import { useActionState, useState } from "react";
import { Alert, Button, Container, FloatingLabel, Form, InputGroup, Spinner } from "react-bootstrap";


function AuthForm(props) {
    const handleLogin = props.handleLogin;
    const [inputError, setInputError] = useState("");

    async function loginActionHandler(prevState, formData) {
        const username = formData.get('username');
        const password = formData.get('password');

        if (!username|| !/^[a-zA-Z0-9_]{3,}$/.test(username)) {
            setInputError("Invalid username: username must be at least 3 characters long and can only contain letters, numbers, and underscores.");
            return { error: true };
        }
        if (!password || !/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password)) {
            setInputError("Invalid password: password must be at least 8 characters long and contain at least one letter and one number.");
            return { error: true };
        }
        setInputError(false);

        try {
            await handleLogin({ username, password });
            return { success: true };
        } catch (error) {
            return { error: true };
        }
    }

    const [loginState, loginAction, loginPending] = useActionState(loginActionHandler);

    return (
        <>
            <Form className="auth-form bg-red p-5 rounded" action={loginAction}>
                <h2 className="righteous-font display-6 mb-5 rounded">Log In</h2>
                {inputError && (
                    <Alert variant="warning">{inputError}</Alert>
                )}
                {loginState && loginState.error && !inputError && (
                    <Alert variant="warning">
                        Errore nel login - controlla username e password
                    </Alert>
                )}
                <InputGroup className="mb-3">
                    <FloatingLabel controlId="username" label="Username">
                        <Form.Control
                            type="text"
                            name="username"
                            placeholder="Inserisci il tuo username"
                            required
                        />
                    </FloatingLabel>
                </InputGroup>
                <InputGroup className="mb-3">
                    <FloatingLabel controlId="password" label="Password">
                        <Form.Control
                            type="password"
                            name="password"
                            placeholder="Inserisci la tua password"
                            required
                        />
                    </FloatingLabel>
                </InputGroup>
                <Button type="submit" className="mx-3 w-auto righteous-font" variant="success" disabled={loginPending}>
                    {loginPending ? (
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>
                    ) : (
                        "Submit"
                    )}
                </Button>
            </Form>
        </>
    );
}

function LoginPage(props) {
    const user = props.user;
    const handleLogin = props.handleLogin;

    return (
        <Container className="page-center">
            {user ? (
                <h2 className="righteous-font display-6">Already logged in</h2>
            ) : (
                <AuthForm handleLogin={handleLogin}/>
            )}
        </Container>
    );
}

export { LoginPage };

