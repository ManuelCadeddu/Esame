import React from 'react'
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LoginButton, LogoutButton } from '../Authentication/Auth';

function MyNavbar(props){

    return(
        
        <Navbar bg='primary' variant='dark' fixed='top' className='navbar-custom'>
            <Container fluid={true}>

                <Navbar.Brand>
                    <i className='bi bi-patch-question'/> Riddles
                </Navbar.Brand>

                <Nav>
                    <Navbar.Text className='mx-2'>  
                        {props.loggedIn && `Welcome, ${props.user.username}!`}
                    </Navbar.Text>

                    {
                        props.loggedIn ? 
                            <LogoutButton logout={props.logout}/> :
                            <Link to='/login'>  <LoginButton/>  </Link>
                    }
                </Nav>
            </Container>
        </Navbar>
    );
}

export { MyNavbar }; 