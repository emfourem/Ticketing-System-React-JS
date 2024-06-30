import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Col, Row, Button, Card, Form, Alert, Spinner } from 'react-bootstrap';
import dayjs from 'dayjs';
import DOMPurify from 'dompurify';
import API from "../API";
import '../App.css';

// HTML tags that are allowed in the text.

const allowedTags = ['b', 'i', 'br'];

/**
 * Function to show information of each block associated to a specific ticket.
 * 
 * @param props.key unique key associated to the row
 * @param props.block the block to be represented in a row
 * @returns JSX for the BlockRow component
 */

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

/**
 * Function to create the block rows.
 * 
 * @param props.blocksList list of all the blocks 
 * @returns JSX for the Blocks component
 */

function Blocks(props) {
  return (
    <div>
      {props.blocksList.length === 0 ? (
        <Card className="mb-3">
          <Card.Body>No blocks are present</Card.Body>
        </Card>
      ) : (
        props.blocksList.map((b, index) => (
          <BlockRow key={index} block={b} />
        ))
      )}
    </div>
  );
}

/**
 * Function to create and manage the form for submitting new blocks.
 * 
 * @param props.username username of the logged in user
 * @param props.createBlock function to create a new block
 * @returns JSX for the BlockForm component
 */

function BlockForm(props) {

  const navigate = useNavigate();

  /** The id of the ticket to which new block can be added. */

  const { ticketId } = useParams();

  /** The text written by the user. */

  const [blockText, setBlockText] = useState('');

  /** The error message to show in case of errors. */

  const [errorMsg, setErrorMsg] = useState('');

  /**
   * Function to check if an input has at least 1 character.
   * 
   * @param input input from the user 
   * @returns true if the input has a length > 1, false otherwise
   */

  const isValid = (input) => {
    const text = input.replace(/<br\s*\/?>/g, '');
    return text.trim().length > 0;
  };

  /**
   * Function to handle the submit event of the form to create a new block.
   * 
   * @param event event to handle 
   */

  function handleSubmit(event) {

    // To avoid reloading.

    event.preventDefault();

    // Form validation.

    if (blockText === '' || !isValid(blockText)) {
      setErrorMsg('Text cannot be empty! Please add some text.');
    } else {

      // Data sanitization and creation of the block.

      const block = {

        // Replace all newline characters (\n) with <br> tags and reduce consecutive <br> tags into a single <br> tag while optionally removing trailing whitespace.
        text: DOMPurify.sanitize(blockText.replace(/\n/g, '<br>').replace(/(<br\s*\/?>\s*){2,}/g, '<br>'), {ALLOWED_TAGS: allowedTags}),
        date: dayjs(),
        author: DOMPurify.sanitize(props.username, {ALLOWED_TAGS: []}) 
      };
      
      props.createBlock(block, parseInt(ticketId));

      // Empty the block text and the error message.

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

/**
 * Function to retrieve, create and show the blocks related to a specific ticket.
 * 
 * @param props.user user information as object 
 * @returns JSX for the BlocksRoute component
 */

function BlocksRoute(props) {

  const navigate = useNavigate();

  /** Id of the ticket to expand. */

  const { ticketId } = useParams();
  
  /** The list of all the blocks. */

  const [blocksList, setBlocksList] = useState([]);

  /** Boolean value to show a spinner or the blocks depending on its value. */

  const [loading, setLoading] = useState(true);

  /** The error message to show in case of errors. */

  const [errorMsg, setErrorMsg] = useState('');

  /** The state of the specific ticket. */

  const [state, setState] = useState('');

  /** The title of the specific ticket. */
  const [title, setTitle] = useState('');

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
    const fetchData = async () => {
      try {

        // The ticket is retrieved.

        const ticket = await API.getTicketById(parseInt(ticketId));

        // Save the state, the title and text of the ticket after sanitization and create the first block.

        setState(DOMPurify.sanitize(ticket.state,{ALLOWED_TAGS: []}));
        setTitle(DOMPurify.sanitize(ticket.title, {ALLOWED_TAGS: []}));
        const text= DOMPurify.sanitize(ticket.text,{ALLOWED_TAGS: allowedTags}).replace(/\n/g, '<br>').replace(/(<br\s*\/?>\s*){2,}/g, '<br>');
        const firstBlock = {id: ticket.id, text:text, date: dayjs(ticket.date), author: ticket.username } 

        // Retrieve all the blocks related to the ticket.

        const blocks = await API.getAllBlocks(parseInt(ticketId));

        const sortedBlocks = blocks.sort((a, b) => (a.date).isAfter(b.date) ? 1 : -1);
        setBlocksList([firstBlock,...sortedBlocks]);
      } catch (err) {

        handleError(err);

      } finally {

        // When the fetch is finished, blocks can be shown.

        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Function to create a new block.
   * 
   * @param block object containing all the information of the block to create 
   * @param ticketId integer identifier of the ticket to which the block is associated
   */

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
