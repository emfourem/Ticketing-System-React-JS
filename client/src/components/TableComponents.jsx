import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
import { Button, Table, Dropdown } from 'react-bootstrap';
import API from '../API';
import { useState, useEffect } from 'react';
import { Category } from '../ticket';
import DOMPurify from 'dompurify';

const allowedTags = ['b', 'i', 'br'];


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
    const t = {
        ...props.ticket,
        id: parseInt(props.ticket.id),
        title: DOMPurify.sanitize(props.ticket.title, {ALLOWED_TAGS: []}),
        date: DOMPurify.sanitize(props.ticket.date.format("YYYY-MM-DD HH:mm"), {ALLOWED_TAGS: []}),
        state: DOMPurify.sanitize(props.ticket.state, {ALLOWED_TAGS: []}),
        category: DOMPurify.sanitize(props.ticket.category, {ALLOWED_TAGS: []}),
        username: DOMPurify.sanitize(props.ticket.username, {ALLOWED_TAGS: []})
    };

    const categories = Object.values(Category).filter(cat => cat !== t.category);

    return (
        <tr>
            <td dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(t.title, {ALLOWED_TAGS: []})}} />
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
                        <ExpandButton expandId={t.id}/>
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
                                    <Dropdown.Item key={index} onClick={() => props.changeCat(t, cat)}>
                                        {cat}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </td>
                    <td>
                        <ExpandButton expandId={t.id}/>
                    </td>
                    <td>
                    {props.estimation}
                    </td>
                    </>
                )
            }
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
                            <th>Expand</th>
                            <th>Estimation</th>
                        </>
                    ) : (
                        props.user? (
                        <>
                        <th>Close</th>
                        <th>Expand</th>
                        </>)
                        :null
                    )}

                </tr>
            </thead>
            <tbody>
                {props.listOfTickets.map(e => (
                    <TicketRow key={e.id} ticket={e} toggleState={props.toggleState} admin={isAdmin} user={props.user} token={props.token} setErrorMsg={props.setErrorMsg} changeCat={props.changeCat} estimation={props.estimations[e.id]} />
                ))}
            </tbody>
        </Table>
    );
}

export { TicketsTable };


