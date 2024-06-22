import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Col, Row, Button, Card } from 'react-bootstrap';
import { Link } from "react-router-dom";
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

function BlocksRoute(props) {   

    const { ticketId } = useParams();

    const [ blocksList, setBlocksList] = useState([]);
    const [ update, setUpdate ] = useState(true);
    const [state, setState] = useState('');

    useEffect( () => {
      API.getTicketById(ticketId)
        .then((ticket) => { setState(ticket.state) })
        .catch((err) => console.log(err)); //manage errors
    }, []);

    useEffect( () => {
        API.getAllBlocks(ticketId)
          .then((list) => {
            setBlocksList(list.sort((a, b) => (a.date).isAfter(b.date) ? 1 : -1));
            setUpdate(false);
          })
          .catch((err) => console.log(err));
      }, [update]); //only at mount time

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
            {state === "open" && 
              <Link to={`/ticket/${ticketId}/addBlock`}> 
                <Button className="mx-2" onClick={() => setUpdate(true)}>New Block</Button> 
              </Link>
            }
            <Link to='/'> 
              <Button variant="warning">Go Back</Button> 
            </Link> 
          </Col>
        </Row>
      </>
    );
}

export { BlocksRoute };
