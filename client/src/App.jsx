import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState, useEffect, useRef } from 'react';
import { Col, Container, Row, Navbar, Button, Nav, Alert } from 'react-bootstrap';
import { BrowserRouter, Routes, Route, Outlet, Link, useNavigate, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
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
      {props.errorMsg ? <Row><Col><Alert className="m-2"
        variant="danger" dismissible onClose={() => props.setErrorMsg('')} >
        {props.errorMsg}</Alert></Col></Row> : null}
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
            <TicketsTable listOfTickets={props.ticketsList} toggleState={props.toggleState} user={props.user} token={props.token} setErrorMsg={props.setErrorMsg} changeCat={props.changeCat} estimations={props.estimations} setEstimations={props.setEstimations} />
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
  const [errorMsg, setErrorMsg] = useState('');
  const [user, setUser] = useState(undefined);
  const [loggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [estimations, setEstimations] = useState({});
  const [flag, setFlag] = useState(true);
  {/*useRef is a tool for managing mutable references in functional components.
  It is designed to be safe for its intended use cases, like storing a DOM element reference,
  timer IDs, or other mutable objects that do not participate in the React component lifecycle.*/}
  const timerRef = useRef(null); // Use useRef to store the timer ID

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
    console.log(err);
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

  function changeCategory(ticket, category) {
    API.updateCategory(ticket.id, category)
      .then(() => {
        const list = tickets.map(t => t.id === ticket.id ? { ...t, category: category } : t);
        setTickets(list);
        API.getEstimation(token, ticket.title, ticket.category)
        .then((res) => setEstimations(prevEstimations => ({...prevEstimations, [ticket.id]:res.estimation})))
        .catch(err=>handleError(err))
      })
      .catch(err => handleError(err));
  }


  function createTicket(ticket,estimation) {
    API.createTicket(ticket)
      .then((id) => {
        const newTicket = Object.assign({}, ticket, { id: id, username: user.username });
        const list = [...tickets, newTicket]
        setTickets(list.sort((a, b) => (a.date).isAfter(b.date) ? -1 : 1));
        if(user && user.admin){
          setEstimations(prevEstimations => ({...prevEstimations, [id]:estimation}));
        }
        /*API.getEstimation(token, ticket.title, ticket.category)
        .then((res) => setEstimations(prevEstimations => ({...prevEstimations, [id]:res.estimation})))
        .catch(err=>handleError(err));*/
      })
      .catch((err) => handleError(err));
  }

  const logout = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser(undefined);
    setEstimations({});
    setFlag(true);
    setToken(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current); // Clear the existing timeout
      timerRef.current = null; // Reset the ref
    }
  }

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

  const loginSuccessful = (user) => {
    setUser(user);
    setLoggedIn(true);
    getToken();
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const newUser = await API.getUserInfo();
        setLoggedIn(true);
        setUser(newUser);
        getToken();
      } catch (err) {
        // Handle authentication error if needed
      } finally {
        API.getAllTickets()
          .then((list) => {
            setTickets(list.sort((a, b) => (a.date).isAfter(b.date) ? -1 : 1));
          })
          .catch((err) => handleError(err));
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if(user && user.admin && token && flag && tickets.length>0){
      setFlag(false);
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
  },[token, flag, tickets, user])

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout user={user} loggedIn={loggedIn} logout={logout} />}>
          <Route index element={<TicketsRoute ticketsList={tickets} toggleState={toggleState} user={user} errorMsg={errorMsg} setErrorMsg={setErrorMsg} token={token} changeCat={changeCategory} estimations={estimations} setEstimations={setEstimations} />} />
          <Route path='/create' element={<CreateRoute createTicket={createTicket} user={user} token={token} />} />
          <Route path='/ticket/:ticketId' element={<BlocksRoute user={user} />} />
          {/* including route here allows login to be rendered as child of the route path, so common elements (header/footer) are shown also in login.
          When a user navigates to /login, they will still see the Layout component's structure, such as the header, footer, or any other common elements defined in Layout.*/}
          <Route path='/login' element={loggedIn ? <Navigate replace to='/' /> : <LoginForm loginSuccessful={loginSuccessful} />} />
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
          <MyHeader user={props.user} loggedIn={props.loggedIn} logout={props.logout} />
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