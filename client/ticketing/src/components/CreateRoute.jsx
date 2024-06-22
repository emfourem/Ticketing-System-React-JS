import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState } from 'react';
import { Button, Form, Alert, Row, Col, Dropdown, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import '../App.css'
import { Category } from '../ticket';

function CreateRoute(props) {
    return (
        <Row className="justify-content-center mt-5">
            <Col md={8}>
                <CreationForm createTicket={props.createTicket} id={props.user && props.user.id}/>
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

    function handleSubmit(event) {
        event.preventDefault();

        if (text === '')
            setErrorMsg('Text cannot be empty! Please add some text.');
        else if (title === '')
            setErrorMsg('Title cannot be empty! Please add a title.');
        else if (!Object.values(Category).includes(category)) {
            setErrorMsg('Improper category was used! Please modify it.');
        } else {
            setIsReviewMode(true);
        }
    }

    function handleConfirmSubmit() {
        const ticket = {
            text: text,
            title: title,
            category: category,
            date: dayjs(),
            ownerId: props.id,
            state: 'open'
        };

        props.createTicket(ticket);
        navigate('/');
    }

    function handleEdit() {
        setIsReviewMode(false);
    }

    return (
        <>
            {errorMsg && <Alert variant='danger' dismissible onClose={() => setErrorMsg('')}>{errorMsg}</Alert>}
            <Card className="mb-3">
                <Card.Header className="bg-primary text-white">{!isReviewMode ? 'Create New Ticket' : 'Review Your Ticket'}</Card.Header>
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
                                    <Dropdown.Toggle variant="primary" className="text-white">
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
                                <Button className="mx-2" type='submit' variant="primary">Create</Button>
                                <Button variant='warning' onClick={() => { navigate('/') }}>Go back</Button>
                            </div>
                        </Form>
                    ) : (
                        <div>
                            <h5 className="mb-3">Review Your Ticket</h5>
                            <p><strong>Title:</strong> {title}</p>
                            <p><strong>Text:</strong> {text}</p>
                            <p><strong>Category:</strong> {category}</p>
                            <div className='my-3'>
                                <Button className="mx-2" variant="success" onClick={handleConfirmSubmit}>Confirm</Button>
                                <Button variant='secondary' onClick={handleEdit}>Edit</Button>
                            </div>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </>
    );
}

export { CreateRoute };
