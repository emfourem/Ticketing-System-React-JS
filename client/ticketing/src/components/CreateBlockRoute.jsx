import { useState } from 'react';
import { Button, Form, Alert, Row, Col, Card } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import API from '../API';
import '../App.css'; // Ensure this is imported to apply the styles

function CreateBlockRoute(props) {
    return (
        <Row>
            <Col>
                <BlockForm createBlock={props.createBlock} />
            </Col>
        </Row>
    );
}

function BlockForm(props) {
    const navigate = useNavigate();
    const { ticketId } = useParams();
    const [blockText, setBlockText] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    function handleSubmit(event) {
        event.preventDefault();

        // Form validation
        if (blockText === '') {
            setErrorMsg('Text cannot be empty! Please add some text.');
        } else {
            const block = {
                text: blockText,
                date: dayjs(),
                author: "Alice" //set the logged user
            };
            
            props.createBlock(block, ticketId);
            navigate('/ticket/' + ticketId);
        }
    }

    return (
        <>
            {errorMsg ? <Alert variant='danger' dismissible onClose={() => setErrorMsg('')}>{errorMsg}</Alert> : false}
            <Card className="mb-3">
                <Card.Header className="custom-card-header">Add New Block</Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group>
                            <Form.Label>Text</Form.Label>
                            <Form.Control 
                                required 
                                placeholder="Insert the text" 
                                as="textarea" 
                                rows={3}  
                                name="text" 
                                value={blockText} 
                                onChange={(event) => setBlockText(event.target.value)} 
                            />
                        </Form.Group>
                        <div className='my-2'>
                            <Button className="mx-2" type='submit' variant="primary">Add</Button>
                            <Button variant='warning' onClick={() => { navigate('/ticket/' + ticketId) }}>Go back</Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </>
    );
}

export { CreateBlockRoute };
