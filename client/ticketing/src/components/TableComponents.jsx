import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
import { Button, Table } from 'react-bootstrap';

/*
function AnswerActions(props) {
  return (
    <>
      <Button className="mx-1" variant="primary" onClick={props.upvote}><i className="bi bi-arrow-up"></i></Button>
      <Button className="mx-1" variant="primary" onClick={props.downvote}><i className="bi bi-arrow-down"></i></Button>
      <Button className="mx-1" variant="danger" onClick={props.delete}><i className="bi bi-trash"></i></Button>
<Link to={`/edit/${props.editId}`} >
      <Button className="mx-1" variant="warning" onClick={props.edit}><i className="bi bi-pencil"></i></Button>
</Link>
    </>
  );
}*/

function CloseButton(props) {
    return (
        <>
        {/* if a ticket is already closed, don't show it */}
          <Button className="mx-1" variant="primary" onClick={props.markAsClose}><i className="bi bi-x-circle"></i></Button>
        </>
      );
}
function ExpandButton (props) {
    return (
        <>
            <Link to={`/ticket/${props.expandId}`} >
                <Button className="mx-1" variant="primary" onClick={(ev)=>ev.preventDefault()}><i className="bi bi-eye-fill"></i></Button>
            </Link>
        </>

    );

}

function TicketRow(props) {
    const t = props.ticket;
    return (
      <tr>
        <td>{t.title}</td>
        <td>{t.date.format("YYYY-MM-DD HH:mm")}</td>
        <td>{t.ownerId}</td>
        <td>{t.category}</td>
        <td>{t.state}</td>
        <td> <CloseButton markAsClose={()=>props.markAsClose(t.id)}/> </td>
        <td> <ExpandButton expandId={t.id}/> </td>
        <td> showExtimation</td>

        {/* TO IMPLEMENT: expand ---IF ADMINISTRATOR: showExtimation
        OLD ONES  upvote={()=>props.vote(e.id, 1)} downvote={()=>props.vote(e.id, -1)}
                delete={()=>props.delete(e.id)} editId={e.id} /></td>*/}
        {/*<td><AnswerActions upvote={()=>props.vote(e.id, 1)} downvote={()=>props.vote(e.id, -1)}
                delete={()=>props.delete(e.id)} editId={e.id} /></td>*/}
      </tr>
    );
  }
  
  function TicketsTable(props) {
    return (
      <Table>
        {/* <Table striped bordered hover> */}
        <thead>
          <tr>
            <th>Title</th>
            <th>Date</th>
            <th>Author</th>
            <th>Category</th>
            <th>State</th>
            <th>Close</th>
            <th>Expand</th>
            <th>Extimation</th>
          </tr>
        </thead>
        <tbody>        
                  {props.listOfTickets.map( (e,index) => 
                   <TicketRow key={index} ticket={e} markAsClose={props.markAsClose} /> )
          }
        </tbody>
      </Table>
    )
  }
  
  export { TicketsTable };