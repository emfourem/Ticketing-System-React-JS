import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState, useEffect } from 'react';
import { Col, Container, Row, Navbar, Button, Nav, Alert } from 'react-bootstrap';
import { BrowserRouter, Routes, Route, Outlet, Link, useNavigate, Navigate } from 'react-router-dom'; 
import {jwtDecode} from 'jwt-decode';
import { TicketsTable } from './components/TableComponents';
import { CreateRoute } from './components/CreateRoute';
import { BlocksRoute } from './components/BlocksRoute';
import { LoginForm } from './components/AuthComponents';
import API from './API';
import './App.css';

function MyHeader(props) {
  const { user, logout } = props;

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="py-3">
      <Navbar.Brand className="mx-2 d-flex align-items-center">
        <i className="bi bi-ticket" style={{ fontSize: '2.5rem' }} />
        <span className="ms-2">Ticketing System</span>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse className="justify-content-end mx-2">
        <Nav>
          {user ? (
            <div className="d-flex align-items-center">
              <i className="bi bi-person-circle text-light me-2" style={{ fontSize: '1.5rem' }} />
              <Navbar.Text className='fs-5 text-light me-2'>
                {user.username}
              </Navbar.Text>
              <Button className='mx-2' variant='danger' onClick={logout}>Logout</Button>
            </div>
          ) : (
            <Link to='/login'>
              <Button className='mx-2' variant='success'>Login</Button>
            </Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}


function MyFooter(props) {
  return (
    <footer className="bg-dark text-white py-3 mt-3">
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
  const navigate = useNavigate();
  return (
    <>
    {props.errorMsg? <Row><Col><Alert className="m-2" 
      variant="danger" dismissible onClose={()=>props.setErrorMsg('')} >
      {props.errorMsg}</Alert></Col></Row>: null}
    <div className="p-4">
      <Row>
      </Row>
      <Row className="mb-4">
        <Col>
          <h2 className="text-center text-dark border-bottom pb-2">List of Tickets</h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <TicketsTable listOfTickets={props.ticketsList} toggleState={props.toggleState} user={props.user} token={props.token} setErrorMsg = {props.setErrorMsg} changeCat={props.changeCat}/>
        </Col>
      </Row>
      <Row>
        {props.user?
        <Col className="d-flex justify-content-center">
            <Button variant="warning"  className="p-3" onClick={()=>navigate('/create')}>New Ticket</Button> 
        </Col>
        : null}
      </Row>
    </div>
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
  const [tickets, setTickets] = useState([]);
  const [ errorMsg, setErrorMsg ] = useState('');
  const [user, setUser ] = useState(undefined);
  const [loggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState(null);

  function handleError(err) {
    let errMsg = 'Unkwnown error';
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

  function toggleState(ticket) {
    API.updateState(ticket.id, ticket.state === "open" ? "close" : "open")
      .then(() => {
        const newState = ticket.state === "open" ? "close" : "open";
        setTickets(ticketsList =>
          ticketsList.map(t =>
            t.id === ticket.id ? { ...t, state: newState } : t
          )
        );
      })
      .catch(err => handleError(err));
  }

  function changeCategory(id, category) {
    API.updateCategory(id, category)
      .then(() => {
        const list = tickets.map(t => t.id === id ? { ...t, category: category } : t);
        setTickets(list);
      })
      .catch(err => handleError(err));
  }
  

  function createTicket(ticket) {
    API.createTicket(ticket)
      .then((id) => {
        const newTicket = Object.assign({}, ticket, {id: id, username:user.username});
        const list = [...tickets, newTicket]
        setTickets(list.sort((a, b) => (a.date).isAfter(b.date) ? -1 : 1));
      })
      .catch((err) => handleError(err));
  }

  const logout = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser(undefined);
    setToken(null);
  }

  const refreshToken = () => {
      API.getToken()
        .then((obj) => {
          const decodedToken = jwtDecode(obj.token);
          const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
          const currentTime = Date.now();
          const duration = expirationTime - currentTime - 2000; // 
          setToken(obj.token);
    
          // Set timeout to refresh token again before it expires
          setTimeout(() => {
            refreshToken();
          }, duration);
        })
        .catch(() => {
        });
  };

  const loginSuccessful = (user) => {
    setUser(user);
    setLoggedIn(true);
    API.getToken()
    .then((obj) => {
      const decodedToken = jwtDecode(obj.token);
      const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const duration = expirationTime - currentTime - 2000; //

      setToken(obj.token);
      // Set timeout to refresh token before it expires
      setTimeout(() => {
        refreshToken();
      }, duration);
    }).catch(()=>{});
  }

  useEffect(()=> {
    const checkAuth = async() => {
      try {
        // here you have the user info, if already logged in
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
        refreshToken();
      } catch(err) {
      
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    API.getAllTickets()
      .then((list) => {
        setTickets(list.sort((a, b) => (a.date).isAfter(b.date) ? -1 : 1));
      })
      .catch((err) => handleError(err));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout user={user} loggedIn={loggedIn} logout={logout}/>}>
          <Route index element={ <TicketsRoute ticketsList={tickets} toggleState={toggleState} user={user} errorMsg={errorMsg} setErrorMsg={setErrorMsg} token={token} changeCat={changeCategory} /> } />
          <Route path='/create' element={ <CreateRoute createTicket={createTicket} user={user} token={token} />} />
          <Route path='/ticket/:ticketId' element={<BlocksRoute user={user}/>} />
        </Route>
        <Route path='/login' element={loggedIn? <Navigate replace to='/' />:  <LoginForm loginSuccessful={loginSuccessful} />} />
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
          <MyHeader user={props.user} loggedIn={props.loggedIn} logout={props.logout}/>
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

export default App;
