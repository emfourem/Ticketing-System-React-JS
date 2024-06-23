import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Col, Row, Button, Card, Form, Alert, Spinner } from 'react-bootstrap';
import dayjs from 'dayjs';
import DOMPurify from 'dompurify';
import API from "../API";
import '../App.css'; // Import App.css for styles

function BlockRow(props) {
  const b = props.block;
  const sanitizedText = DOMPurify.sanitize(b.text); // Sanitize HTML content
  return (
    <Card className="mb-3">
      <Card.Header>{b.date.format("YYYY-MM-DD HH:mm")} - {b.author}</Card.Header>
      <Card.Body>
        <pre dangerouslySetInnerHTML={{__html: sanitizedText}} />
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
        props.blocksList.map((t) => (
          <BlockRow key={t.id} block={t} />
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
        setState(ticket.state);
        setTitle(ticket.title);
        const blocks = await API.getAllBlocks(ticketId);
        setBlocksList(blocks.sort((a, b) => (a.date).isAfter(b.date) ? 1 : -1));
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
        setBlocksList(list => [...list, newBlock].sort((a, b) => (a.date.isAfter(b.date) ? 1 : -1)));
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
          <h2 className="block-route-title">Ticket title: {title}</h2>
        </Col>
      </Row>
      {errorMsg && (
        <Row>
          <Col>
            <Alert variant='danger'>{errorMsg}</Alert>
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
              <Alert variant="danger" className="mb-3">
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
