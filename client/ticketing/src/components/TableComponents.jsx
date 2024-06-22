import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
import { Button, Table } from 'react-bootstrap';

function CloseButton(props) {
    return (
        <Button className="mx-1" variant="danger" onClick={props.markAsClose}>
            <i className="bi bi-x-circle"></i>
        </Button>
    );
}

function ExpandButton(props) {
    return (
        <Link to={`/ticket/${props.expandId}`} >
            <Button className="mx-1" variant="info">
                <i className="bi bi-eye-fill"></i>
            </Button>
        </Link>
    );
}

function TicketRow(props) {
    const t = props.ticket;
    return (
        <tr>
            <td>{t.title}</td>
            <td>{t.date.format("YYYY-MM-DD HH:mm")}</td>
            <td>{t.username}</td>
            <td>{t.category}</td>
            <td>{t.state}</td>
            <td>
                {t.state === "open" && <CloseButton markAsClose={() => props.markAsClose(t)} />}
            </td>
            <td>
                <ExpandButton expandId={t.id} />
            </td>
            <td>Show Estimation</td>
        </tr>
    );
}

function TicketsTable(props) {
    return (
        <Table striped bordered hover className="table-responsive">
            <thead className="thead-dark">
                <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>State</th>
                    <th>Close</th>
                    <th>Expand</th>
                    <th>Estimation</th>
                </tr>
            </thead>
            <tbody>
                {props.listOfTickets.map(e => (
                    <TicketRow key={e.id} ticket={e} markAsClose={props.markAsClose} />
                ))}
            </tbody>
        </Table>
    );
}

export { TicketsTable };
