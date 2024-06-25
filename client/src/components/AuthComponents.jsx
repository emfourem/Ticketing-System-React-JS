import { Form, Button, Alert, Container, Row, Col, Card, InputGroup } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../API';
import 'bootstrap-icons/font/bootstrap-icons.css';

function LoginForm(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then(user => {
        setErrorMessage('');
        props.loginSuccessful(user);
        navigate(-1);
      })
      .catch(err => {
        setErrorMessage('Wrong username or password');
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage('');
    const credentials = { username, password };

    let valid = true;
    if (username === '' || password === '') {
      valid = false;
    }

    if (valid) {
      doLogIn(credentials);
    } else {
      setErrorMessage('Invalid content in form.');
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
                  <Button variant="primary" type="submit">
                    Login
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
