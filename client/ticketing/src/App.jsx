import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState, useEffect } from 'react';
import { Col, Container, Row, Navbar, Button, Nav } from 'react-bootstrap';
import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom'; 
import './App.css';

import { TicketsTable } from './components/TableComponents';
import { CreateRoute } from './components/CreateRoute';
import { BlocksRoute } from './components/BlocksRoute';
import { CreateBlockRoute } from './components/CreateBlockRoute';
import API from './API';



function MyHeader(props) {
  return (
      <Navbar bg="primary" variant="dark" expand="lg" className="py-3">
          <Navbar.Brand className="mx-2 d-flex align-items-center">
              <i className="bi bi-ticket" style={{ fontSize: '1.8rem' }} />
              <span className="ms-2">Ticketing System</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse className="justify-content-end mx-2">
              <Nav>
                  <Nav.Link href="#" className="d-flex align-items-center">
                      <i className="bi bi-person-circle" style={{ fontSize: '1.8rem' }} />
                  </Nav.Link>
              </Nav>
          </Navbar.Collapse>
      </Navbar>
  );
}


function MyFooter(props) {
  return (
      <footer className="bg-primary text-white py-3 mt-auto">
          <Container>
              <Row>
                  <Col className="text-center">
                      <p className="mb-0">&copy; {new Date().getFullYear()} Ticketing System</p>
                  </Col>
              </Row>
          </Container>
      </footer>
  );
}


function TicketsRoute(props) { 
  return (
    <div className="p-4"> {/* Adding padding around the entire component */}
      <Row>
        {/*<QuestionDescription question={question} />*/}
      </Row>
      <Row className="mb-4">
        <Col>
          <h2 className="text-center text-primary border-bottom pb-2">List of Tickets</h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <TicketsTable listOfTickets={props.ticketsList} markAsClose={props.markAsClose}/>
        </Col>
      </Row>
      <Row>
        <Col className="d-flex justify-content-center">
          <Link to='/create'> 
            <Button className="p-3">New Ticket</Button> 
          </Link>
        </Col>
      </Row>
    </div>
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
    

    //const [ tickets, setTickets ] = useState(initialTickets.sort((a, b) => (a.date).isAfter(b.date) ? -1 : 1));
    const [ tickets, setTickets ] = useState([]);
    const [ refresh, setRefresh ] = useState(true);
    // Not needed anymore, the info about the object are retrieved by using the id in the URL
    //const [ editObj, setEditObj ] = useState(undefined);
  
    // Not needed anymore, this state is "sort of" substituted by the /add URL
    //const [ showForm, setShowForm ] = useState(false);

    function handleError(err) {
      console.log(err);
      let errMsg = 'Unkwnown error';
      if (err.errors)
        if (err.errors[0].msg)
          errMsg = err.errors[0].msg;
      else if (err.error)
        errMsg = err.error;
          
      //setErrorMsg(errMsg); for showing error to client
  
    }

    function markAsClose(ticket) {
      //update function to db
      //no blocks can be added->props on a button which abilitate or deabilitate the button add then in the BlocksRoute
      API.updateState(ticket.id, ticket.state==="open"?"close":"open")
      .then(() => 
        setTickets( ticketsList => 
          ticketsList.map(t => t.id === ticket.id ? Object.assign({}, t, {state: "close"}) : t)))
      .catch((err) => handleError(err))
    }

    function createTicket(ticket) {
      API.createTicket(ticket)
      .then( () => setRefresh(true) )
      .catch( (err) => handleError(err));
    }

    function createBlock(block, ticketId) {
      API.createBlock(block, ticketId)
      .then()
      .catch( (err) => handleError(err));
    }

    useEffect( () => {
      API.getAllTickets()
        .then((list) => {
          setTickets(list.sort((a, b) => (a.date).isAfter(b.date) ? -1 : 1));
          setRefresh(false);
        }
        )
        .catch((err) => console.log(err));
    }, [refresh]); //only at mount time and when refresh is needed


  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Layout />}>
          <Route index element={ <TicketsRoute ticketsList={tickets} markAsClose={markAsClose}/> } />
          <Route path='/create' element={ <CreateRoute createTicket={createTicket} />} />
          <Route path='/ticket/:ticketId' element={<BlocksRoute /> } />
          <Route path='/ticket/:ticketId/addBlock' element={<CreateBlockRoute createBlock={createBlock} />} />
      </Route>
      <Route path='/*' element={<DefaultRoute />} />
    </Routes>
  </BrowserRouter>
  );
}

function Layout(props) {
  return (
    <Container fluid className="d-flex flex-column min-vh-100">
      <Row>
        <Col>
          <MyHeader />
        </Col>
      </Row>
      <Row className="flex-grow-1">
        <Col>
          <Outlet />
        </Col>
      </Row>
      <Row>
        <Col>
          <MyFooter />
        </Col>
      </Row>
    </Container>
  );
}



export default App
