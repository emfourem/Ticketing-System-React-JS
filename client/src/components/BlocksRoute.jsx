import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Col, Row, Button, Card, Form, Alert, Spinner } from 'react-bootstrap';
import dayjs from 'dayjs';
import DOMPurify from 'dompurify';
import API from "../API";
import '../App.css'; // Import App.css for styles

const allowedTags = ['b', 'i', 'br'];

function BlockRow(props) {
  const b = props.block;
  return (
    <Card className="mb-3">
      <Card.Header className="bg-dark">{DOMPurify.sanitize(b.date.format("YYYY-MM-DD HH:mm"),{ALLOWED_TAGS: []})} - {DOMPurify.sanitize(b.author, {ALLOWED_TAGS: []})}</Card.Header>
      <Card.Body>
        <div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(b.text.replace(/\n/g, '<br>'), {ALLOWED_TAGS: allowedTags})}} />
      </Card.Body>
    </Card>
  );
}

function Blocks(props) {
  return (
    <div>
      {props.blocksList.length === 0 ? (
        <Card className="mb-3">
          <Card.Body>No blocks are present</Card.Body>
        </Card>
      ) : (
        props.blocksList.map((t, index) => (
          <BlockRow key={index} block={t} />
        ))
      )}
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
        text: DOMPurify.sanitize(blockText.replace(/\n/g, '<br>').replace(/(<br\s*\/?>\s*){2,}/g, '<br>'), {ALLOWED_TAGS: allowedTags}),
        date: dayjs(),
        author: DOMPurify.sanitize(props.username, {ALLOWED_TAGS: []}) 
      };
      props.createBlock(block, parseInt(ticketId));
      setBlockText('');
      setErrorMsg('');
    }
  }

  return (
    <>
      {errorMsg ? <Alert variant='danger' dismissible onClose={() => setErrorMsg('')}>{errorMsg}</Alert> : false}
      <Card className="mb-3">
        <Card.Header className="custom-card-header bg-dark">Add New Block</Card.Header>
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
              <Button className="mx-2 bg-success" type='submit' variant="primary">Add</Button>
              <Button variant='warning' onClick={() => { navigate(-1) }}>Back</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}

function BlocksRoute(props) {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const [blocksList, setBlocksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [state, setState] = useState('');
  const [title, setTitle] = useState('');

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
    const fetchData = async () => {
      try {
        const ticket = await API.getTicketById(ticketId);
        setState(DOMPurify.sanitize(ticket.state,{ALLOWED_TAGS: []}));
        setTitle(DOMPurify.sanitize(ticket.title, {ALLOWED_TAGS: []}));
        const text= DOMPurify.sanitize(ticket.text,{ALLOWED_TAGS: allowedTags}).replace(/\n/g, '<br>');
        const firstBlock = {id: ticket.id, text:text, date: dayjs(ticket.date), author: ticket.username } 
        const blocks = await API.getAllBlocks(ticketId);
        const sortedBlocks = blocks.sort((a, b) => (a.date).isAfter(b.date) ? 1 : -1)
        setBlocksList([firstBlock,...sortedBlocks]);
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  function createBlock(block, ticketId) {
    API.createBlock(block, ticketId)
      .then((id) => {
        const newBlock = { ...block, id: id };
        setBlocksList(list => [...list, newBlock]);
      })
      .catch((err) => handleError(err));
  }

  if (loading) {
    return (
      <Row>
        <Col className="text-center">
          <Spinner animation="border" />
        </Col>
      </Row>
    );
  }

  return (
    <>
      <Row>
        <Col>
          <h2 className="block-route-title text-success p-3">Ticket title: {title}</h2>
        </Col>
      </Row>
      {errorMsg && (
        <Row>
          <Col>
            <Alert variant='danger' dismissible onClose={() => setErrorMsg('')}>{errorMsg}</Alert>
          </Col>
        </Row>
      )}
      <Row>
        <Col>
          <Blocks blocksList={blocksList} />
        </Col>
      </Row>
      <Row>
        <Col>
          {state === "close" ? (
            <>
              <Alert variant="warning" className="mb-3">
                {props.user ? "You cannot create a block. The ticket is closed." : "You cannot create a block. You are not logged in and the ticket is already closed."}
              </Alert>
              <Button variant='warning' onClick={() => { navigate(-1) }}>Go back</Button>
            </>
          ) : (
            props.user ? <BlockForm createBlock={createBlock} username={props.user.username} /> : 
            <>
            <Alert variant="warning" className="mb-3">
              You cannot create a block. Please log in and try again.
            </Alert>
            <Button className="mx-2" variant='warning' onClick={() => { navigate(-1) }}>Go back</Button>
            </>
          )}
        </Col>
      </Row>
    </>
  );
}

export { BlocksRoute };
