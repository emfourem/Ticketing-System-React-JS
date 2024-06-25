import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
import { Button, Table, Dropdown } from 'react-bootstrap';
import API from '../API';
import { useState, useEffect } from 'react';
import { Category } from '../ticket';
import DOMPurify from 'dompurify';


function ExpandButton(props) {
    return (
        <Link to={`/ticket/${props.expandId}`}>
            <Button className="mx-1" variant="info">
                <i className="bi bi-eye-fill"></i>
            </Button>
        </Link>
    );
}

function TicketRow(props) {
    const [estimation, setEstimation] = useState(null);
    const [flag, setFlag] = useState(false);
    useEffect(() => {
        // Perform the API call when component mounts or props.token changes
        if (props.admin && props.token && !flag) {
            API.getEstimation(props.token, props.ticket.title, props.ticket.category)
                .then((res) => { setEstimation(DOMPurify.sanitize(res.estimation)); setFlag(true) })
                .catch((err) => {
                    props.setErrorMsg(err);
                    setEstimation(null);
                });
        }
    }, [props.token, flag]);
    const t = {
        ...props.ticket,
        id: parseInt(props.ticket.id),
        title: DOMPurify.sanitize(props.ticket.title),
        date: DOMPurify.sanitize(props.ticket.date.format("YYYY-MM-DD HH:mm")),
        state: DOMPurify.sanitize(props.ticket.state),
        category: DOMPurify.sanitize(props.ticket.category),
        username: DOMPurify.sanitize(props.ticket.username)
    };

    const categories = Object.values(Category).filter(cat => cat !== t.category);

    return (
        <tr>
            <td dangerouslySetInnerHTML={{ __html: t.title}} />
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
                    </> ) : null
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
                                    <Dropdown.Item key={index} onClick={() => props.changeCat(t.id, cat)}>
                                        {cat}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </td>
                    </>
                )
            }
            <td>
                <ExpandButton expandId={t.id}/>
            </td>
            {props.admin ? (
                <td>
                    {estimation}
                </td>
            ) : null}
        </tr>
    );
}

function TicketsTable(props) {
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
                        </>
                    ) : (
                        props.user?<th>Close</th>:null
                    )}
                    <th>Expand</th>
                    {isAdmin ? <th>Needed time</th> : null}

                </tr>
            </thead>
            <tbody>
                {props.listOfTickets.map(e => (
                    <TicketRow key={e.id} ticket={e} toggleState={props.toggleState} admin={isAdmin} user={props.user} token={props.token} setErrorMsg={props.setErrorMsg} changeCat={props.changeCat} />
                ))}
            </tbody>
        </Table>
    );
}

export { TicketsTable };
