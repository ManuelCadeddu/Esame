import React from 'react';
import { Top3Table } from './Top3Table.js';
import { Legend } from './Legend.js';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function MySidebar(props){
   
    return (
        <>
            <Top3Table top3={props.top3}/>
            <Legend/>
            {props.loggedIn &&  <AddButton/>} 
        </>  
    );  
}

function AddButton(props){

    return(
        <Link to='/add'>
            <Button variant='primary' size='lg' className='fixed-left-bottom'> &#43; </Button>
        </Link>
    )
}

export { MySidebar };