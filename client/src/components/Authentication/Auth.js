import React from 'react'
import { useState } from 'react';
import { Form, Button, Alert, Col, Row } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';

function LoginForm(props){

    const [username, setUsername] = useState('u1@p.it');
    const [password, setPassword] = useState('password');

    const [show, setShow] = useState(false);  // Usato per mostrare/nascondere messaggi di errore
    const [errorMessage, setErrorMessage] = useState(''); 

    const navigate = useNavigate();

    const handleSubmit = (event) => {

        event.preventDefault();
        const credentials = { username, password };

        props.login(credentials)
              .then(() => navigate('/'))
              .catch((err) => {
                  setErrorMessage(err.error); 
                  setShow(true); 
              });
    };

    return(
      <Row className='border rounded form-padding'>
        <Col>
        
          <h1 className='mb-4'>Login</h1>

          <Form  onSubmit={handleSubmit}>

            <Alert variant='danger' show={show} dismissible onClose={() => setShow(false)}> {errorMessage} </Alert>
          
            <Form.Group className='mb-3' controlId='username'>    
              <Form.Label>Email address</Form.Label>
              <Form.Control
                  type='email'
                  value={username} 
                  placeholder='Enter email'
                  onChange={(ev) => setUsername(ev.target.value)}
                  required={true}
              />
            </Form.Group>

            <Form.Group className='mb-4' controlId='password'>
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type='password'
                  value={password} 
                  placeholder='Enter password'
                  onChange={(ev) => setPassword(ev.target.value)}
                  required={true}
                />
            </Form.Group>

            <Button type='submit' className='mb-3' onSubmit={handleSubmit}>Login</Button>
            &nbsp;
            <Link to={'/'}> 
                <Button className='mb-3 btn-cancel-form'>Home</Button>
            </Link>

          </Form>
        </Col>
      </Row>
  )
};

/* Componente per il bottone di login nella Navbar */
function LoginButton(props) {
  return(
    <Button variant='outline-light' onClick={props.login}>Login</Button>
  )
}

/* Componente per il bottone di logout nella Navbar */
function LogoutButton(props) {
  return(
    <Button variant='outline-light' onClick={props.logout}>Logout</Button>
  )
}

export { LoginForm, LoginButton, LogoutButton };
