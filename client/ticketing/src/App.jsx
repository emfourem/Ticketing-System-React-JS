import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState } from 'react';
import { Col, Container, Row, Navbar, Button, Nav } from 'react-bootstrap';
import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom'; 
import './App.css';

import { Ticket } from './ticket';
import { TicketsTable } from './components/TableComponents';

const ticket = new Ticket( 1,"open", "new feature", "Simple Request","Where are the office?","2024-06-18 15:36",2);
const ticket2 = new Ticket( 2,"open", "administrative", "Payment required","Where are my money?","2024-06-19 21:00",1);
const ticket3 = new Ticket( 3,"open", "maintenance", "Account closed","Where are you?","2023-06-19 20:00",2);
const initialTickets = [];
initialTickets.push(ticket,ticket2,ticket3);


function MyHeader(props) {

	return (
		<Navbar bg="primary" variant="dark">
      <Navbar.Brand className="mx-2">
        <i className="bi bi-ticket" />
        {" Ticketing System"}
      </Navbar.Brand>
      <Navbar.Collapse className="justify-content-end mx-2">
        <Nav>
          {/*<Nav.Link href="#">*/}
            <i className="bi bi-person-circle" style={{ fontSize: '1.5rem' }} />
          {/*</Nav.Link>*/}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
	);
}


function MyFooter(props) {
  return (<footer>
    <p>&copy; Ticketing System</p>
  </footer>);
}


function TicketsRoute(props) {   // former Main component


  // ROUTES

  //  /  =  initial page  (list of tickets)
  //  /add  =  show the form needed to add 
  //  /edit/:id  =  show the form to edit the answer identified by :id

  //const [ showForm, setShowForm ] = useState(false);

  //const [ editObj, setEditObj ] = useState(undefined);
  

  return (<>
    <Row>
      {/*<QuestionDescription question={question} />*/}
    </Row>
    <Row>
      <Col>
        <h2>List of Tickets</h2>
      </Col>
    </Row>
    <Row>
      <Col>
        <TicketsTable listOfTickets={props.ticketsList} markAsClose={props.markAsClose}/>
      </Col>
    </Row>
    <Row>
      <Col>
        <Link to='/create'> 
          <Button>New Ticket</Button> 
        </Link>
      </Col>
    </Row>
  </>
  );
}

function DefaultRoute(props) {
  return (
    <Container fluid>
      <p className="my-2">No data here: This is not a valid page!</p>
      <Link to='/'>Please go back to main page</Link>
    </Container>
  );
}

function App() {

    // state moved up into App
    

    const [ tickets, setTickets ] = useState(initialTickets.sort((a, b) => (a.date).isAfter(b.date) ? -1 : 1));

    // Not needed anymore, the info about the object are retrieved by using the id in the URL
    //const [ editObj, setEditObj ] = useState(undefined);
  
    // Not needed anymore, this state is "sort of" substituted by the /add URL
    //const [ showForm, setShowForm ] = useState(false);

    function markAsClose(id) {
      setTickets( ticketsList => 
        ticketsList.map(t => t.id === id ? Object.assign({}, t, {state: "close"}) : t)
      );
    }
  /*
  function voteAnswer(id, delta) {
    setAnswers( answerList => 
      answerList.map(e => e.id === id ? Object.assign({}, e, {score: e.score+delta}) : e)
    );
  }

  function deleteAnswer(id) {
    setAnswers( answerList =>
      answerList.filter(e => e.id !== id)
    );
  }

  function addAnswer(answer) {
    setAnswers( answerList => {
      // NB: max does not take an array but a set of parameters
      const newId = Math.max(...answerList.map(e => e.id))+1;
      answer.id = newId;
      return [...answerList, answer];
    }
    );
  //setShowForm(false);
  }

  function saveExistingAnswer(answer) {
    setAnswers( answerList => 
      answerList.map( e => e.id === answer.id ? answer : e)
    );
    //setShowForm(false);
    //setEditObj(undefined);
  }

/*
  function setEditAnswer(id) {
    setEditObj( answers.find( e => e.id === id) );
    setShowForm(true);
  }
*/

  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Layout />}>
          <Route index element={ <TicketsRoute ticketsList={tickets} markAsClose={markAsClose}/> } />
          {/*<Route path='/add' element={ <FormRoute addAnswer={addAnswer} /> } />
          <Route path='/edit/:answerId' element={<FormRoute answerList={answers}
  addAnswer={addAnswer} editAnswer={saveExistingAnswer} />} />*/}
      </Route>
      <Route path='/*' element={<DefaultRoute />} />
    </Routes>
  </BrowserRouter>
  );
}

function Layout(props) {
return (
<Container fluid>
      <Row>
        <Col>
          <MyHeader />
        </Col>
      </Row>
      <Outlet />
      <Row>
        <Col>
          <MyFooter />
        </Col>
      </Row>
    </Container>
  )
}







/*
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    </>
  );
}
*/
export default App
