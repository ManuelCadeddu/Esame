import dayjs from 'dayjs';
import React from 'react'
import { useState, useEffect} from 'react';
import { Form, Button, Accordion, Row, Col, ListGroup, Table, Alert } from 'react-bootstrap/'
import { Answer } from '../../models/Answer';

import API from '../../API';

function RiddlesTable(props){

  const [answers, setAnswers] = useState([]);
  const [dirty, setDirty] = useState(true);

  const [show, setShow] = useState(false);  // Usato per mostrare/nascondere messaggi di errore
  const [errorMessage, setErrorMessage] = useState(''); 

  /* useEffect per ricaricare le risposte (ogni secondo e solo se l'utente è loggato) */
  useEffect(() => {

      API.getAnswers()
          .then(a => {
              setAnswers(a);
              setTimeout(() => setDirty(!dirty), 1000);
          })
          .catch((err) => {
            setErrorMessage(err.error); 
            setShow(true); 
          }); 
    
  }, [dirty])

  

  return (<>
      <Alert variant='danger' show={show} dismissible onClose={() => setShow(false)}> {errorMessage} </Alert>
      <ListGroup as="ul">
        { props.riddles.map((riddle) => <RiddleRow  user={props.user}
                                                    loggedIn={props.loggedIn}
                                                    riddle={riddle} 
                                                    answers={answers.filter((a) => a.riddleId===riddle.id)}
                                                    addAnswer={props.addAnswer}
                                                    setRiddleClose={props.setRiddleClose}
                                                    getSuggestion={props.getSuggestion}
                                                    key={riddle.id} />)}
      </ListGroup>
  </>); 
}

function RiddleRow(props){

  // Funzione che mostra il vincitore o il tempo che scorre. Se finisce il tempo chiude l'indovinello
  const handleBodyHeaderLayout = () => {

    const secondRemaining = props.riddle.dateFirstAnswer.add(props.riddle.duration, 's').diff(dayjs(), 'second');
    
    if(props.riddle.open && secondRemaining <= 0)   // Se non c'è più tempo
          props.setRiddleClose(props.riddle);

    if(props.loggedIn)                              // Se l'utente è loggato
      if(props.riddle.open){                          // e l'indovinello è aperto
        if(secondRemaining > 0)                         // e c'è ancora tempo
            return  <b> { secondRemaining } </b>
      }else                                           // se l'indovinello è chiuso
          return  <>Vincitore: <b>{ props.answers.filter(a => a.winning===1).map(a => a.userId) }</b></>
  }

  // Funzione che mostra i suggerimenti
  const handleSuggestionLayout = (suggestion, coef) => {

    const secondRemaining = props.riddle.dateFirstAnswer.add(props.riddle.duration, 's').diff(dayjs(), 'second');

    if( props.loggedIn &&                                 // Se l'utente è loggato
        props.riddle.open &&                              // e se l'indovinello è aperto
        props.riddle.userId !== props.user.username &&    // e se l'utente non è l'autore dell'indovinello
        props.answers.find(a => a.userId === props.user.username)===undefined && // e l'utente non ha ancora risposto
        secondRemaining < coef*props.riddle.duration ){   // e se il tempo rimasto è minore di quello definito per mostrare gli indovinelli 
          if(suggestion==='')         // se non è già stato mostrato il suggerimento caricalo dal DB
            props.getSuggestion();  
          return <Col>Suggestion: <b>{suggestion}</b></Col>
        } 
    return <></>
  }

  const handleHiddenLayout = () => {

    if(props.loggedIn){                                     // Se l'utente è loggato
      if(props.riddle.open)                                   // e l'indovinello è aperto
        if(props.riddle.userId !== props.user.username){        // e l'utente non ha scritto l'indovinello
          if(props.answers.find(a => a.userId === props.user.username)===undefined)  // e l'utente non ha ancora risposto
            return <AnswerForm addAnswer={props.addAnswer} riddle={props.riddle} user={props.user} loggedIn={props.loggedIn}/>
          else
            return <b><u>LA RISPOSTA INSERITA E' ERRATA</u></b>
        }

      // In tutti gli altri casi
      return <AnswerList answers={props.answers}  riddle={props.riddle}/>
    }
    return <></>
  }

  const personalCSS = () => {
    if(props.loggedIn && props.riddle.userId === props.user.username)
      return "personal-custom";
    return '';
  }

  const openCSS = () => {
    if(props.riddle.open)
      return props.riddle.dateFirstAnswer.format()==="Invalid Date" ? "open-new-custom" : "open-started-custom";
    return "closed-custom";
  } 

  return (
    <ListGroup.Item as="li" className={personalCSS()}>
      <Accordion>
          <Accordion.Item className={openCSS()} eventKey="0">
            <Accordion.Header>
              <Col md={1}><b>({props.riddle.difficulty}) </b></Col>
              <Col md={11}>{props.riddle.text}</Col>
            </Accordion.Header>
            <Accordion.Body>
              <Row>
                <Col md={12}>
                  { handleBodyHeaderLayout() }
                </Col>
              </Row>
              <Row> { handleSuggestionLayout(props.riddle.suggestion1, 0.5) } </Row>
              <Row> { handleSuggestionLayout(props.riddle.suggestion2, 0.25) } </Row>
              <Row> { handleHiddenLayout() } </Row>  
            </Accordion.Body>
          </Accordion.Item>
      </Accordion>
    </ListGroup.Item>
  );
}

function AnswerForm(props) {
  
  const [text, setText] = useState('');

  const handleSubmit = (event) => {

    event.preventDefault();
    const riddleId = props.riddle.id;  
    const answer = new Answer( {text, riddleId} ); 
    props.addAnswer(answer); 
  }

  return(
    <Form onSubmit={handleSubmit}>    
        <Form.Group className="mb-3">
            <Form.Label><b>Answer</b></Form.Label>
            <Form.Control as="textarea" rows="2" required={true} onChange={event => setText(event.target.value)}/>
        </Form.Group>
        <Button className="mb-3" type="submit">Save</Button>
    </Form>
  );
}

function AnswerList(props) {
  
  return(
    <Table bordered style={{textAlign:"center"}} key={props.answers.id} >
        <thead>
          <tr><th> {props.riddle.open ? <></> : <>Solution: { props.riddle.solution }</>} </th></tr>
        </thead>
        <tbody>
          { props.answers.map((answer) => <tr key={answer.id}><td>{ answer.text }</td></tr>) }
        </tbody>
    </Table>
  );
}


export { RiddlesTable };