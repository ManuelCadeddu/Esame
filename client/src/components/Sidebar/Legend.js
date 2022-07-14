import React from 'react';
import { Table } from 'react-bootstrap/';

function Legend(props){

    return(
        <Table bordered className='align-content-center' >
            <thead>
                <tr>
                    <th colSpan={2}>Legend</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><i className='bi bi-square-fill icon-personal-custom'></i></td>
                    <td> Your Riddle </td> 
                </tr>
                <tr>
                    <td><i className='bi bi-square-fill icon-open-new-custom'></i></td>
                    <td> Open New Riddle </td> 
                </tr>
                <tr>
                    <td><i className='bi bi-square-fill icon-open-started-custom'></i></td>
                    <td> Open Started Riddle </td> 
                </tr>
                <tr>
                    <td><i className='bi bi-square-fill icon-closed-custom'></i></td>
                    <td> Closed Riddle </td> 
                </tr>
            </tbody>
        </Table>
    );
}

export { Legend };