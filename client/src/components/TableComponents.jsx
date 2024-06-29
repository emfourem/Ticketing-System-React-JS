import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
import { Button, Table, Dropdown } from 'react-bootstrap';
import { Category } from '../ticket';
import DOMPurify from 'dompurify';

/**
 * Button component to expand a ticket.
 * 
 * @param props.id id of the ticket to expand
 * @returns JSX for the ExpandButton component
 */

function ExpandButton(props) {
    return (
        <Link to={`/ticket/${props.id}`}>
            <Button className="mx-1" variant="info">
                <i className="bi bi-eye-fill"></i>
            </Button>
        </Link>
    );
}

/**
 * Function to create a row.
 * It sanitize the content before showing it.
 * 
 * @param props.ticket object containing the ticket information
 * @param props.toggleState function to reverse the state of a ticket
 * @param props.user user information as object
 * @param props.admin boolean, true if admin, 0 otherwise.
 * @param props.changeCat function to change the category of a ticket
 * @param props.estimation integer estimation for the current ticket
 * @returns JSX for the TicketRow component
 */

function TicketRow(props) {

    // Create a sanitized copy of the ticket received as parameter.

    const t = {
        ...props.ticket,
        id: parseInt(props.ticket.id),
        title: DOMPurify.sanitize(props.ticket.title, { ALLOWED_TAGS: [] }),
        date: DOMPurify.sanitize(props.ticket.date.format("YYYY-MM-DD HH:mm"), { ALLOWED_TAGS: [] }),
        state: DOMPurify.sanitize(props.ticket.state, { ALLOWED_TAGS: [] }),
        category: DOMPurify.sanitize(props.ticket.category, { ALLOWED_TAGS: [] }),
        username: DOMPurify.sanitize(props.ticket.username, { ALLOWED_TAGS: [] })
    };

    // Creating an object containing the possible categories different from the current one.

    const categories = Object.values(Category).filter(cat => cat !== t.category);

    return (
        <tr>
            <td>{t.title}</td>
            <td>{t.date}</td>
            <td>{t.username}</td>
            <td>{t.category}</td>
            <td>{t.state}</td>
            {
                !props.admin ? (
                    props.user ? (
                        <>
                            <td>
                                <Button variant="danger" className="mx-1" onClick={() => props.toggleState(t)} disabled={!props.user || t.state === "close" || t.username !== props.user.username}>
                                    <i className="bi bi-x-square-fill"></i>
                                </Button>
                            </td>
                            <td>
                                <ExpandButton id={t.id} />
                            </td>
                        </>) : null
                ) : (
                    <>
                        <td>
                            <Button variant="danger" className="mx-1" onClick={() => props.toggleState(t)} disabled={t.state === "close"}>
                                <i className="bi bi-x-square-fill"></i>
                            </Button>
                        </td>
                        <td>
                            <Button variant="success" className="mx-1" onClick={() => props.toggleState(t)} disabled={t.state === "open"}>
                                <i className="bi bi-check-square-fill"></i>
                            </Button>
                        </td>
                        <td>
                            <Dropdown>
                                <Dropdown.Toggle variant="primary" id="dropdown-state">
                                    Select new Category
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {categories.map((cat, index) => (
                                        <Dropdown.Item key={index} onClick={() => props.changeCat(t, cat)}>
                                            {cat}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </td>
                        <td>
                            <ExpandButton id={t.id} />
                        </td>
                        <td>
                            {DOMPurify.sanitize(props.estimation, { ALLOWED_TAGS: [] })}
                        </td>
                    </>
                )
            }
        </tr>
    );
}

/**
 * Function to create the table for the tickets.
 * 
 * @param props.listOfTickets list of tickets
 * @param props.toggleState function to reverse the state of a ticket
 * @param props.user user information as object
 * @param props.changeCat  function to change the category of a ticket
 * @param props.estimations list of objects containing estimations for each ticket
 * @returns JSX for the TicketsTable component
 */

function TicketsTable(props) {

    // It will be 1 if the user is an admin, 0 otherwise.
    const isAdmin = props.user && props.user.admin === 1;

    return (
        <Table striped bordered hover responsive className="table-responsive">
            <thead className="thead-dark">
                <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>State</th>
                    {isAdmin ? (
                        <>
                            <th>Close</th>
                            <th>Open</th>
                            <th>Change Category</th>
                            <th>Expand</th>
                            <th>Estimation</th>
                        </>
                    ) : (
                        props.user ? (
                            <>
                                <th>Close</th>
                                <th>Expand</th>
                            </>)
                            : null
                    )}
                </tr>
            </thead>
            <tbody>
                {props.listOfTickets.map(t => (
                    <TicketRow key={t.id} ticket={t} toggleState={props.toggleState} admin={isAdmin} user={props.user} changeCat={props.changeCat} estimation={props.estimations[t.id]} />
                ))}
            </tbody>
        </Table>
    );
}

export { TicketsTable };