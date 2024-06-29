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

// HTML tags that are allowed in the text.

const allowedTags = ['b', 'i', 'br'];

/**
 * CreateRoute component.
 * 
 * @param props.createTicket function to create a ticket
 * @param props.user user information as object
 * @param props.token JWT token 
 * @returns JSX for the CreateRoute component
 */

function CreateRoute(props) {
    return (
        <Row className="justify-content-center mt-5">
            <Col md={8}>
                <CreationForm createTicket={props.createTicket} id={props.user && props.user.id} admin={props.user && props.user.admin} token={props.token} />
            </Col>
        </Row>
    );
}

/**
 * CreationForm component for creating a new ticket.
 * 
 * @param props.createTicket function to create a ticket
 * @param props.id id of the user
 * @param props.admin 1 if the user is an admin, 0 otherwise
 * @param props.token JWT token 
 * @returns JSX for the CreationForm component
 */

function CreationForm(props) {

    const navigate = useNavigate();

    /** String for the text inserted by the user. */

    const [text, setText] = useState('');

    /** String for the title inserte by the user. */

    const [title, setTitle] = useState('');

    /** Category selected by the user. */

    const [category, setCategory] = useState('Select a category');

    /** The error message to show in case of errors. */

    const [errorMsg, setErrorMsg] = useState('');

    /** Flag indicating if the user is in a review mode or not. */

    const [isReviewMode, setIsReviewMode] = useState(false);

    /** The estimated value for the ticket when the ticket is submitted. */

    const [estimation, setEstimation] = useState(null);

    /**
     * Function to handle an error.
     * 
     * @param err array 
     */

    function handleError(err) {
        let errMsg = 'Unknown error';
        if (err.errors) {
          if (err.errors[0].msg) {
            errMsg = err.errors[0].msg;
          }
        } else {
          if (err.error) {
            errMsg = err.error;
          }
        }
        setErrorMsg(errMsg);
      }

    useEffect(() => {
        if (isReviewMode && props.token) {
            API.getEstimation(props.token, DOMPurify.sanitize(title, { ALLOWED_TAGS: [] }), DOMPurify.sanitize(category, { ALLOWED_TAGS: [] }))
                .then(res => {
                    setEstimation(DOMPurify.sanitize(res.estimation, { ALLOWED_TAGS: [] }));
                }).catch(err => {
                    handleError(err);
                    setEstimation(null);
                });
        }
    }, [isReviewMode, title, category]); //useEffect performed only when these dependencies are satisfied

    /**
     * Function to handle the submission of the ticket.
     * 
     * @param {*} event 
     */

    function handleSubmit(event) {

        // To prevent reloading.

        event.preventDefault();
        
        // Check if the input values are correct.

        if (text === '')
            setErrorMsg('Text cannot be empty! Please add some text.');
        else if (title === '')
            setErrorMsg('Title cannot be empty! Please add a title.');
        else if (!Object.values(Category).includes(category)) {
            setErrorMsg('Improper category was used! Please modify it.');
        } else {
            // Some tags are allowed only in the text.

            const sanitizedText = DOMPurify.sanitize(text, { ALLOWED_TAGS: allowedTags });
            const sanitizedTitle = DOMPurify.sanitize(title, { ALLOWED_TAGS: [] });

            // Text in review mode is shown as HTML code, so it is sanitized and saved.

            setText(sanitizedText);

            // Title is also sanitized to delete unsafe content inserted by the user.

            setTitle(sanitizedTitle);
            setIsReviewMode(true);
        }
    }

    /**
     * Function to handle the final submission of the ticket.
     */

    function handleConfirmSubmit() {

        // All the data are sanitized.

        const ticket = {
            text: DOMPurify.sanitize(text, { ALLOWED_TAGS: allowedTags }).replace(/\n/g, '<br>').replace(/(<br\s*\/?>\s*){2,}/g, '<br>'),
            title: DOMPurify.sanitize(title, { ALLOWED_TAGS: [] }),
            category: DOMPurify.sanitize(category, { ALLOWED_TAGS: [] }),
            date: dayjs(),
            ownerId: parseInt(props.id),
            state: DOMPurify.sanitize('open', { ALLOWED_TAGS: [] }),
        };

        //If an error message is present, it is deleted.

        setErrorMsg('');

        if(ticket.text.length > 0 && ticket.title.length > 0){
            
            // The estimation computed is passed back.

            props.createTicket(ticket, estimation);
            navigate('/');

        }else{
            
            setIsReviewMode(false);
            setErrorMsg('Text and title cannot be empty.');
            
        }
    }

    /**
     * Function to handle the case in which the user wants to re-edit the new ticket.
     */

    function handleEdit() {
        setIsReviewMode(false);

        //If an error message is present, it is deleted.

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
                            <p><strong>Title:</strong> {DOMPurify.sanitize(title, { ALLOWED_TAGS: [] })} </p>
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
