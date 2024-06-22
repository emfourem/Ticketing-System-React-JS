import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
import { Button, Table } from 'react-bootstrap';


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
            {
                !props.admin ? (
                    <>
                        <td>
                            <Button variant="danger" className="mx-1" onClick={() => props.toggleState(t)} disabled={!props.user || t.state === "close" || t.username !== props.user.username}>
                                <i className="bi bi-x-square-fill"></i>
                            </Button>
                        </td>
                    </>
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
                    </>
                )
            }

            <td>
                <ExpandButton expandId={t.id} />
            </td>
            {props.admin ? <td>Show Estimation</td> : null}
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
                        </>
                    ) : (
                        <th>Close</th>
                    )}
                    <th>Expand</th>
                    {isAdmin ? <th>Estimation</th> : null}

                </tr>
            </thead>
            <tbody>
                {props.listOfTickets.map(e => (
                    <TicketRow key={e.id} ticket={e} toggleState={props.toggleState} admin={isAdmin} user={props.user}/>
                ))}
            </tbody>
        </Table>
    );
}

export { TicketsTable };
