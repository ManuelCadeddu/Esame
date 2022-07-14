import React from 'react'
import { useState, useEffect } from 'react';
import { Spinner, Row, Col, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { MySidebar } from './Sidebar/Sidebar.js';
import { RiddlesTable } from './Main/RiddlesTable.js';
import { LoginForm } from './Authentication/Auth.js';
import { RiddleForm } from './RiddleForm/RiddleForm.js';

import API from '../API';


/** Layout della pagina principale **/
function MainLayout(props) {

    const [top3, setTop3] = useState([]);
    const [riddles, setRiddles] = useState([]);
    const [dirty, setDirty] = useState(true);

    const [show, setShow] = useState(false);  // Usato per mostrare/nascondere messaggi di errore
    const [errorMessage, setErrorMessage] = useState(''); 
    
    /* useEffect per ricaricare gli indovinelli e la top3 (quando si accede alla route e quando si crea o si aggiorna un indovinello) 
        NOTA: quando si crea un indovinello e quando si inserisce una risposta errata non ci sarebbe bisogno di ricaricare la top3 
        ma, anche se lo fa, le prestazioni restano praticamente identiche (si evita un'altra useEffect)) */
    useEffect(() => {

      /* Funzione per il caricamento della top3 dal DB */
      const getTop3 = () => { 
        API.getTop3()
            .then(u => { setTop3(u) })
            .catch((err) => {
              setErrorMessage(err.error); 
              setShow(true); 
            }); 
      }
      
      if(dirty || !props.loggedIn){
        API.getRiddles()
            .then(r => {
                getTop3();
                setRiddles(r);
                setDirty(false);
            })
            .catch((err) => {
              setErrorMessage(err.error); 
              setShow(true); 
            });
      } 
    }, [dirty, props.loggedIn]);

    /* Aggiunta di una risposta nel DB */
    const addAnswer = (answer) => { 
      API.addAnswer(answer)
          .then(setDirty(true))
          .catch((err) => {
            setErrorMessage(err.error); 
            setShow(true); 
          }); 
    }

    /* Aggiornamento di un indovinello presente nel DB (quando scade il tempo) */
    const setRiddleClose = (riddleId) => {
      API.setRiddleClose(riddleId)
          .then(setDirty(true))
          .catch((err) => {
            setErrorMessage(err.error); 
            setShow(true); 
          }); 
    }

    /* Aggiornamento di un indovinello presente nel DB (quando scade il tempo) */
    const getSuggestion = () => {
        setDirty(true) 
    }
  
    return (  
      <Row className="vh-100 below-nav">
          <Col md={3}>
              <MySidebar top3={top3} loggedIn={props.loggedIn}/> 
          </Col>
          <Col md={9}>
              <h1>Riddles</h1>
              <Alert variant='danger' show={show} dismissible onClose={() => setShow(false)}> {errorMessage} </Alert>
              <RiddlesTable className="h-25" user={props.user} riddles={riddles} loggedIn={props.loggedIn} addAnswer={addAnswer} setRiddleClose={setRiddleClose} getSuggestion={getSuggestion}/>
          </Col>
      </Row>
    );
}

/** Layout mostrato quando si crea un nuovo indovinello */
function AddLayout(props) {
  return( 
    <Row className="justify-content-center below-nav">
      <Col md={8}>
        <RiddleForm/>
      </Col>
    </Row>
  );
}

/** Layout mostrato quando si esegue login **/
function LoginLayout(props) {
  return(
    <Row className='justify-content-center below-nav'>
      <Col md={4}>
        <LoginForm login={props.login} logout={props.logout} />
      </Col>
    </Row>
  );
}

/** Layout mostrato quando si attende una risposta dal server **/
function LoadingLayout(props) {
  return(
    <Row className='justify-content-center below-nav'>
      <Spinner animation='border' variant='primary'/>
        <div className='align-content-center'>
          <h1>Loading data from database</h1>
        </div>   
    </Row>
  )
}

/** Layout mostrato quando si cerca di accedere ad una route inesistente **/
function NotFoundLayout(){
  return(
    <Row className='below-nav'>
      <div className='align-content-center'>
        <h1>This route does not exist</h1>
        <Link to='/'>
          <Button variant='primary'>Home!</Button>
        </Link>
      </div>
    </Row>
  )
}

export { MainLayout, AddLayout, LoginLayout, LoadingLayout, NotFoundLayout }; 
