import React from 'react'
import { useState } from 'react';
import { Form, Button, Col, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../API';

const RiddleForm = (props) => {

    /* Si crea uno stato per ogni parametro dell'indovinello */
    const [text, setText] = useState('');
    const [solution, setSolution] = useState('');
    const [suggestion1, setSuggestion1] = useState('');
    const [suggestion2, setSuggestion2] = useState('');
    const [difficulty, setDifficulty] = useState('facile');
    const [duration, setDuration] = useState(30);

    const [show, setShow] = useState(false);  // Usato per mostrare/nascondere messaggi di errore
    const [errorMessage, setErrorMessage] = useState(''); 

    const navigate = useNavigate();   // necessario per cambiare pagina

    const handleSubmit = (event) => {

        event.preventDefault();
        const riddle = {text, solution, suggestion1, suggestion2, difficulty, duration};

        API.addRiddle(riddle)
                .then(() => navigate('/'))
                .catch((err) => {
                    setErrorMessage(err.error); 
                    setShow(true); 
                });
    }

    return ( 

        <Form className='login-form-custom border rounded mb-0 form-padding' onSubmit={handleSubmit}>

            <Alert variant='danger' show={show} dismissible onClose={() => setShow(false)}> {errorMessage} </Alert>
        
            <Form.Group className='mb-3'>
                <Form.Label><b>Riddle</b></Form.Label>
                <Form.Control as="textarea" required={true} value={text} onChange={event => setText(event.target.value)}/>
            </Form.Group>

            <Form.Group className='mb-3'>
                <Form.Label><b>Solution</b></Form.Label>
                <Form.Control as='textarea' rows='1' required={true} value={solution} onChange={event => setSolution(event.target.value)}/>
            </Form.Group>

            <Form.Group className='mb-3'>
                <Form.Label><b>Suggestion1</b></Form.Label>
                <Form.Control as='textarea' rows='1' required={true} value={suggestion1} onChange={event => setSuggestion1(event.target.value)}/>
            </Form.Group>

            <Form.Group className='mb-3'>
                <Form.Label><b>Suggestion2</b></Form.Label>
                <Form.Control as='textarea' rows='1' required={true} value={suggestion2} onChange={event => setSuggestion2(event.target.value)}/>
            </Form.Group>

            <Form.Group className='mb-3'>
                <Form.Label><b>Difficulty</b></Form.Label>
                <Form.Select value={difficulty} onChange={event => setDifficulty(event.target.value)}>
                    <option value='facile'>Facile</option>
                    <option value='medio'>Medio</option>
                    <option value='difficile'>Difficile</option>
                </Form.Select>
            </Form.Group>

            <Form.Group className='mb-4'>
                <Form.Label><b>Duration</b></Form.Label>
                <Col md={2}>
                    <Form.Control type='text' required={true} aria-label='Duration' defaultValue={duration} onChange={event => setDuration(event.target.value)} />
                </Col>
                <Form.Text muted> La durata deve essere compresa tra i 30s e i 600s</Form.Text>
            </Form.Group>

            <Button className='mb-3' type='submit'>Save</Button>
            &nbsp;
            <Link to={"/"}> 
                <Button className='mb-3 btn-cancel-form'>Cancel</Button>
            </Link>
        </Form>
  )
}

export { RiddleForm };