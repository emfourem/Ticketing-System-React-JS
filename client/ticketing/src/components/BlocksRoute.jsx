import { useEffect, useState } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { Col, Row, Button, Card, Form, Alert } from 'react-bootstrap';
import dayjs from 'dayjs';
import API from "../API";
import '../App.css'; // Import App.css for styles

function BlockRow(props) {
  const b = props.block;
  return (
    <Card className="mb-3">
      <Card.Header>{b.date.format("YYYY-MM-DD HH:mm")} - {b.author}</Card.Header>
      <Card.Body>
        <pre>{b.text}</pre>
      </Card.Body>
    </Card>
  );
}

function Blocks(props) {
  return (
    <div>
      {props.blocksList.map((t) => (
        <BlockRow key={t.id} block={t} />
      ))}
    </div>
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
        author: props.username 
      };
      
      props.createBlock(block, ticketId);
      setBlockText('');
      setErrorMsg('');
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
              <Button variant='warning' onClick={() => { navigate(-1) }}>Go back</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}

function BlocksRoute(props) {
  const navigate=useNavigate();
  const { ticketId } = useParams();
  const [blocksList, setBlocksList] = useState([]);
  const [state, setState] = useState('');

  useEffect(() => {
    API.getTicketById(ticketId)
      .then((ticket) => { setState(ticket.state) })
      .catch((err) => console.log(err)); // manage errors

      API.getAllBlocks(ticketId)
      .then((list) => {
        setBlocksList(list.sort((a, b) => (a.date).isAfter(b.date) ? 1 : -1));
      })
      .catch((err) => console.log(err));
  }, []);

  function createBlock(block, ticketId) {
    API.createBlock(block, ticketId)
      .then((id) => {
        const newBlock = { ...block, id: id };
        setBlocksList(list => [...list, newBlock].sort((a, b) => (a.date.isAfter(b.date) ? 1 : -1)));
      })
      .catch((err) => handleError(err));
  }
  


  return (
    <>
      <Row>
        <Col>
          <h2 className="block-route-title">Additional blocks related to ticket {ticketId}</h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <Blocks blocksList={blocksList}/>
        </Col>
      </Row>
      <Row>
        <Col>
          {state === "open" && props.user? <BlockForm createBlock={createBlock} username={props.user && props.user.username}/> :
           (
            <>
              <Alert variant="danger" className="mb-3">
                {props.user? "You cannot create a block. The ticket is closed.":"You cannot create a block. Please log in and try again."}
              </Alert>
              <Button variant='warning' onClick={() => { navigate(-1) }}>Go back</Button>
            </>
          ) }
        </Col>
      </Row>
    </>
  );
}

export { BlocksRoute };
