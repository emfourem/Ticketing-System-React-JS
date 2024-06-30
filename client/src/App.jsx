import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState, useEffect, useRef } from 'react';
import { Col, Container, Row, Navbar, Button, Nav, Alert, Spinner } from 'react-bootstrap';
import { BrowserRouter, Routes, Route, Outlet, Link, useNavigate, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { TicketsTable } from './components/TableComponents';
import { CreateRoute } from './components/CreateRoute';
import { BlocksRoute } from './components/BlocksRoute';
import { LoginForm } from './components/AuthComponents';
import API from './API';
import './App.css';

/**
 * Header definition.
 * 
 * @param props.user user information as object
 * @param props.logout logout function 
 * @returns JSX for the MyHeader component
 */

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

/**
 * Footer definition.
 * 
 * @returns JSX for the MyFooter component
 */


function MyFooter() {
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

/**
 * Function to manage the creation of the table containing the tickets.
 * 
 * @param props.errorMsg error message string
 * @param props.setErrorMsg function to set an error message
 * @param props.ticketsList list of tickets
 * @param props.toggleState function to reverse the state of a ticket
 * @param props.user user information as object
 * @param props.changeCat function to change the category of a ticket
 * @param props.estimations list of objects containing estimations for each ticket
 * @param props.successMsg success message string
 * @param props.setSuccessMsg function to set a success message 
 * @returns JSX for the TicketRoute component
 */

function TicketsRoute(props) {
  const navigate = useNavigate();
  return (
    <>
      {props.errorMsg ? <Row><Col><Alert className="m-2"
        variant="danger" dismissible onClose={() => props.setErrorMsg('')} >
        {props.errorMsg}</Alert></Col></Row> : null}
      {props.successMsg ? <Row><Col><Alert className="m-2"
        variant="success" dismissible onClose={() => props.setSuccessMsg('')} >
        {props.successMsg}</Alert></Col></Row> : null}
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
            <TicketsTable listOfTickets={props.ticketsList} toggleState={props.toggleState} user={props.user} changeCat={props.changeCat} estimations={props.estimations} />
          </Col>
        </Row>
        <Row>
          {props.user ?
            <Col className="d-flex justify-content-center">
              <Button variant="warning" className="p-3" onClick={() => navigate('/create')}>New Ticket</Button>
            </Col>
            : null}
        </Row>
      </div>
    </>
  );
}

/**
 * The route for nonexisting URLs.
 * 
 * @returns JSX for the DefaultRoute component
 */

function DefaultRoute() {
  return (
    <Container fluid>
      <p className="my-2">This is not a valid page!</p>
      <Link to='/'>Please go back to main page</Link>
    </Container>
  );
}


function App() {

  const navigate = useNavigate();

  /** The list of tickets. */

  const [tickets, setTickets] = useState([]);

  /** The error message to show in case of errors. */

  const [errorMsg, setErrorMsg] = useState('');

  /** The success message to show in case of success. */

  const [successMsg, setSuccessMsg] = useState('');

  /** 
   * Contains information about logged in user.
   * It is undefined when no one is logged in.
   */

  const [user, setUser] = useState(undefined);

  /** The token retrieved and constantly updated from the server. */

  const [token, setToken] = useState(null);

  /** 
   * The list containing the estimations for each ticket.
   * It will be used only when administrators are logged in.
   */

  const [estimations, setEstimations] = useState({});

  /**
   * Flag to avoid recomputing estimations if it is not necessary.
   * When estimations are computed, it is set to false.
   * When logout is performed, it is set to true to allow new computation
   * for new user if it will be an administrator.
   */

  const [flag, setFlag] = useState(true);

  /** Loading state to manage spinner display */

  const [loading, setLoading] = useState(true);

  /** 
   * It is a reference to the timer in charge of updating a token.
   * It will be cleaned when logout is performed.
   * It manages timers to avoid that timeouts related to other users
   * can affect the update of the ticket for new users.
   */

  const timerRef = useRef(null);

  /**
   * Function to handle possible errors and show related messages.
   * 
   * @param err object 
   */

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

  /**
   * Function to reverse the state of a ticket.
   * 
   * @param ticket object containing ticket info
   */

  function toggleState(ticket) {
    API.updateState(ticket.id, ticket.state === "open" ? "close" : "open")
      .then(() => {
        const newState = ticket.state === "open" ? "close" : "open";
        setTickets(ticketsList =>
          ticketsList.map(t =>
            t.id === ticket.id ? { ...t, state: newState } : t
          )
        );
        setSuccessMsg('State changed!');
        setTimeout(() => {
          setSuccessMsg('');
        }, 2000);
      })
      .catch(err => handleError(err));
  }

  /**
   * Function to change category of a specific ticket.
   * If the change is done, a new estimation only for the ticket is requested.
   * 
   * @param  ticket object containing ticket info
   * @param  category string 
   */

  function changeCategory(ticket, category) {
    API.updateCategory(ticket.id, category)
      .then(() => {
        const list = tickets.map(t => t.id === ticket.id ? { ...t, category: category } : t);
        setTickets(list);
        API.getEstimation(token, ticket.title, ticket.category)
          .then((res) => setEstimations(prevEstimations => ({ ...prevEstimations, [ticket.id]: res.estimation })))
          .catch(err => handleError(err));
        setSuccessMsg('Category updated and new estimation computed!');
        setTimeout(() => {
          setSuccessMsg('');
        }, 3000);
      })
      .catch(err => handleError(err));
  }

  /**
   * Function to create a ticket.
   * 
   * @param ticket object containing the ticket info
   * @param estimation integer 
   */

  function createTicket(ticket, estimation) {
    API.createTicket(ticket)
      .then((id) => {
        const newTicket = Object.assign({}, ticket, { id: id, username: user.username });
        const list = [...tickets, newTicket]
        setTickets(list.sort((a, b) => (a.date).isAfter(b.date) ? -1 : 1));
        if (user && user.admin) {
          setEstimations(prevEstimations => ({ ...prevEstimations, [id]: estimation }));
        }
        setSuccessMsg('Ticket created!');
        setTimeout(() => {
          setSuccessMsg('');
        }, 2000);
      })
      .catch((err) => handleError(err));
  }

  /**
   * Logout function.
   */

  const logout = async () => {
    await API.logOut();
    setUser(undefined);
    setEstimations({});
    setFlag(true);
    setToken(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    navigate('/');
  }

  /**
   * Function to obtain the token and refresh it every 58 seconds.
   */

  function getToken() {
    if (timerRef.current) {
      clearTimeout(timerRef.current); // Clear any existing timer
    }
    API.getToken()
      .then((obj) => {
        const decodedToken = jwtDecode(obj.token);
        const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const duration = expirationTime - currentTime - 2000;
        setToken(obj.token);
        // Set timeout to refresh token 2 seconds before it expires
        timerRef.current = setTimeout(() => {
          getToken();
        }, duration);
      }).catch((err) => { handleError(err) });
  }

  /**
   * Function executed when login is performed succesfully.
   * 
   * @param user object containing user info
   */

  const loginSuccessful = (user) => {
    setUser(user);
    getToken();
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const newUser = await API.getUserInfo();
        setUser(newUser);
        getToken();
      } catch (err) {
        // Errors here mean that no session is already present, so login is needed.
      } finally {

        API.getAllTickets()
          .then((list) => {
            setTickets(list.sort((a, b) => (a.date).isAfter(b.date) ? -1 : 1));
            setLoading(false);
          })
          .catch((err) => {
            handleError(err);
            setLoading(false);
          });
      }
    };
    // Check if a session already exists and retrieve all tickets anyway.
    checkAuth();
  }, []);

  useEffect(() => {

    // Compute the estimations if the user logged in is an administrator.
    if (user && user.admin && token && flag && tickets.length > 0) {
      setFlag(false);
      // Create a new list with the needed information.
      const adminTickets = tickets.map(ticket => ({
        id: ticket.id,
        title: ticket.title,
        category: ticket.category
      }));
      API.getEstimations(token, adminTickets)
        .then((est) => {
          const updatedEstimations = { ...estimations };
          est.forEach(estimation => {
            updatedEstimations[estimation.id] = estimation.estimation;
          });
          setEstimations(updatedEstimations);
        })
        .catch(err => handleError(err));
    }
  }, [token, flag, tickets, user]) //all these dependencies are needed for executing the function in the correct moment

  return (
    <Routes>
      <Route path='/' element={<Layout user={user} logout={logout} />}>
        <Route index element={
          loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading data</span>
              </Spinner>
            </div>
          ) : (
            <TicketsRoute ticketsList={tickets} toggleState={toggleState} user={user} errorMsg={errorMsg} setErrorMsg={setErrorMsg} changeCat={changeCategory} estimations={estimations} successMsg={successMsg} setSuccessMsg={setSuccessMsg} />
          )
        } />
        <Route path='/create' element={<CreateRoute createTicket={createTicket} user={user} token={token} />} />
        <Route path='/ticket/:ticketId' element={<BlocksRoute user={user} />} />
        <Route path='/login' element={user ? <Navigate replace to='/' /> : <LoginForm loginSuccessful={loginSuccessful} />} />
      </Route>
      <Route path='/*' element={<DefaultRoute />} />
    </Routes>
  );
}

/**
 * It defines the main structure of all the routes.
 * 
 * @param props.user user information as object
 * @param props.logout logout function
 * @returns JSX for the Layout component
 */

function Layout(props) {
  return (
    <Container fluid className="d-flex flex-column min-vh-100">
      <Row>
        <Col>
          <MyHeader user={props.user} logout={props.logout} />
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