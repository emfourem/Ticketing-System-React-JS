import 'bootstrap-icons/font/bootstrap-icons.css';
import { Form, Button, Alert, Container, Row, Col, Card, InputGroup } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../API';
import DOMPurify from 'dompurify';

/**
 * Function to create the login form.
 * 
 * @param props.loginSuccessful function to execute when login is done correctly 
 * @returns JSX for the LoginForm component
 */

function LoginForm(props) {

  const navigate = useNavigate();

  /** Value of the username inserted by the user. */

  const [username, setUsername] = useState('');

  /** Value of the password inserted by the user. */

  const [password, setPassword] = useState('');

  /** The error message to show in case of errors. */

  const [errorMessage, setErrorMessage] = useState('');

  /** Boolean value to reverse the visibility of the password inserted. */

  const [showPassword, setShowPassword] = useState(false);

  /**
   * Function to perform the login.
   * 
   * @param credentials object containing username and password 
   */

  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then(user => {

        // If an error message is shown, it is deleted.

        setErrorMessage('');
        props.loginSuccessful(user);
        navigate(-1);
      })
      .catch(err => {
        setErrorMessage('Wrong username or password');
      });
  };

  /**
   * Function to handle the click of the submit button.
   * 
   * @param event information about the event 
   */
  const handleSubmit = (event) => {

    // To prevent reloading.

    event.preventDefault();

    // If an error message is shown, it is deleted.

    setErrorMessage('');

    const user = DOMPurify.sanitize(username, { ALLOWED_TAGS: [] });
    const pwd = DOMPurify.sanitize(password, { ALLOWED_TAGS: [] });

    const credentials = { username: user, password: pwd };
    if (user === '' || pwd === '') {
      setErrorMessage('Please fill out the form.');
    } else {
      doLogIn(credentials);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col xs={12} md={6}>
          <Card>
            <Card.Body>
              <Card.Title className="text-center mb-4">Login</Card.Title>
              <Form onSubmit={handleSubmit}>
                {errorMessage && (
                  <Alert
                    variant="danger"
                    dismissible
                    onClose={() => setErrorMessage('')}
                  >
                    {errorMessage}
                  </Alert>
                )}
                <Form.Group controlId="username" className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    required
                    placeholder="Insert your username"
                    type="text"
                    value={username}
                    onChange={(ev) => setUsername(ev.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId="password" className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      required
                      placeholder="Insert your password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(ev) => setPassword(ev.target.value)}
                    />
                    <InputGroup.Text
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: 'pointer' }}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>
                <div className="d-flex justify-content-between">
                  <Button variant="success" type="submit">
                    Enter
                  </Button>
                  <Button variant="danger" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export { LoginForm };