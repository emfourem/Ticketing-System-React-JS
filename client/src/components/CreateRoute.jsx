import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../App.css';
import { useState, useEffect } from 'react';
import { Button, Form, Alert, Row, Col, Dropdown, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Category } from '../ticket';
import dayjs from 'dayjs';
import DOMPurify from 'dompurify';
import API from '../API';

const allowedTags = ['b', 'i', 'br'];

function CreateRoute(props) {
    return (
        <Row className="justify-content-center mt-5">
            <Col md={8}>
                <CreationForm createTicket={props.createTicket} id={props.user && props.user.id} admin={props.user && props.user.admin} token={props.token} />
            </Col>
        </Row>
    );
}

function CreationForm(props) {
    const navigate = useNavigate();

    const [text, setText] = useState('');
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Select a category');
    const [errorMsg, setErrorMsg] = useState('');
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [estimation, setEstimation] = useState(null); // State to hold the estimation value

    useEffect(() => {
        // Fetch the estimation when the component mounts
        if (isReviewMode && props.token) {
            API.getEstimation(props.token, DOMPurify.sanitize(title, { ALLOWED_TAGS: [] }), DOMPurify.sanitize(category, { ALLOWED_TAGS: [] }))
                .then(res => {
                    setEstimation(DOMPurify.sanitize(res.estimation, { ALLOWED_TAGS: [] }));
                }).catch(err => {
                    setEstimation(null);
                });
        }
    }, [isReviewMode, title, category]);

    function handleSubmit(event) {
        event.preventDefault();

        if (text === '')
            setErrorMsg('Text cannot be empty! Please add some text.');
        else if (title === '')
            setErrorMsg('Title cannot be empty! Please add a title.');
        else if (!Object.values(Category).includes(category)) {
            setErrorMsg('Improper category was used! Please modify it.');
        } else {
            const sanitizedText = DOMPurify.sanitize(text, { ALLOWED_TAGS: allowedTags });
            const sanitizedTitle = DOMPurify.sanitize(title, { ALLOWED_TAGS: [] });
            setText(sanitizedText);
            setTitle(sanitizedTitle);
            setIsReviewMode(true);
        }
    }

    function handleConfirmSubmit() {
        const ticket = {
            text: DOMPurify.sanitize(text, { ALLOWED_TAGS: allowedTags }).replace(/\n/g, '<br>').replace(/(<br\s*\/?>\s*){2,}/g, '<br>'),
            title: DOMPurify.sanitize(title, { ALLOWED_TAGS: [] }),
            category: DOMPurify.sanitize(category, { ALLOWED_TAGS: [] }),
            date: dayjs(),
            ownerId: parseInt(props.id),
            state: DOMPurify.sanitize('open', { ALLOWED_TAGS: [] }),
        };
        setErrorMsg('');
        props.createTicket(ticket, estimation);
        navigate('/');
    }

    function handleEdit() {
        setIsReviewMode(false);
        setErrorMsg('');
    }

    return (
        <>
            {errorMsg && <Alert variant='danger' dismissible onClose={() => setErrorMsg('')}>{errorMsg}</Alert>}
            <Card className="mb-3">
                <Card.Header className="bg-dark text-white">{!isReviewMode ? 'Create New Ticket' : 'Review Your Ticket'}</Card.Header>
                <Card.Body>
                    {!isReviewMode ? (
                        <Form onSubmit={handleSubmit}>
                            <Form.Group>
                                <Form.Label>Title</Form.Label>
                                <Form.Control
                                    required
                                    placeholder="Insert the title"
                                    type="text"
                                    name="title"
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Text</Form.Label>
                                <Form.Control
                                    required
                                    placeholder="Insert the text"
                                    as="textarea"
                                    rows={3}
                                    name="text"
                                    value={text}
                                    onChange={(event) => setText(event.target.value)}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Choose a category</Form.Label>
                                <Dropdown required onSelect={(eventKey) => setCategory(eventKey)}>
                                    <Dropdown.Toggle variant="dark" className="text-white">
                                        {category}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item eventKey="inquiry">Inquiry</Dropdown.Item>
                                        <Dropdown.Item eventKey="payment">Payment</Dropdown.Item>
                                        <Dropdown.Item eventKey="maintenance">Maintenance</Dropdown.Item>
                                        <Dropdown.Item eventKey="new feature">New feature</Dropdown.Item>
                                        <Dropdown.Item eventKey="administrative">Administrative</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Form.Group>

                            <div className='my-3'>
                                <Button className="mx-2" type='submit' variant="success">Create</Button>
                                <Button variant='warning' onClick={() => { navigate('/') }}>Back</Button>
                            </div>
                        </Form>
                    ) : (
                        <div>
                            <p><strong>Title:</strong> <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(title, { ALLOWED_TAGS: [] }) }} /></p>
                            <p><strong>Text:</strong> <span dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(text, { ALLOWED_TAGS: allowedTags }).replace(/\n/g, '<br>').replace(/(<br\s*\/?>\s*){2,}/g, '<br>')
                            }} /></p>
                            <p><strong>Category:</strong> {DOMPurify.sanitize(category, { ALLOWED_TAGS: [] })}</p>
                            {estimation !== null && (
                                props.admin === 1 ?
                                    <p><strong>Estimated closure in</strong> {estimation} <strong> hours</strong></p> :
                                    <p><strong>Estimated closure in</strong> {estimation} <strong> days</strong></p>
                            )}
                            <div className='my-3'>
                                <Button className="mx-2" variant="success" onClick={handleConfirmSubmit}>Add</Button>
                                <Button variant="warning" onClick={handleEdit}>Edit</Button>
                            </div>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </>
    );
}

export { CreateRoute };
