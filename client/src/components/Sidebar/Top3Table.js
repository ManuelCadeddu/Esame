import React from 'react';
import { Table } from 'react-bootstrap/';

function Top3Table(props){

    return(
        <Table striped bordered className='align-content-center'>
            <thead>
                <tr>
                    <th colSpan={3}><i className='bi bi-trophy-fill icon-trophy-custom'/> Top 3</th>
                </tr>
                <tr>
                    <th>#</th>
                    <th>Username</th>
                    <th>Score</th>
                </tr>
            </thead>
            <tbody>
                { props.top3.map((user) => <UserRow username={user.username} score={user.score} rank={user.rank} key={user.username}/>) }
            </tbody>
        </Table>
    );
}

function UserRow(props){
    return(
        <tr>
            <td>{props.rank}</td>
            <td>{props.username}</td>
            <td>{props.score}</td> 
        </tr>
    );
}

export { Top3Table };