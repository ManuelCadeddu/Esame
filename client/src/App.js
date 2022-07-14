import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import React from 'react';
import { useState, useEffect} from 'react';
import { Container } from 'react-bootstrap/';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

import { MainLayout, AddLayout, LoginLayout, LoadingLayout, NotFoundLayout } from './components/PageLayout.js';
import { MyNavbar } from './components/Navbar/Navbar.js';

import API from './API';

function App() {
    return (
        <BrowserRouter> 
            <Container fluid>
                <Routes>
                    <Route path="/*" element={<Main/>}/>
                </Routes>
            </Container>
        </BrowserRouter>
    )
}

function Main() {

    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    const navigate = useNavigate();

    /* Funzione per ottenere le info dell'utente e mostrare la pagina di caricamento */
    useEffect(() => {
        
        const init = async () => {
            try {
                setLoading(true);
                const user = await API.getUserInfo();
                setUser(user);
                setLoggedIn(true);
                setLoading(false);
            } catch (err) {
                console.log(err);
                setUser(null);
                setLoggedIn(false);
                setLoading(false);
            }
        };
        
        init();
    }, []);

    /* Funzione che gestisce il processo di login */
    const handleLogin = async (credentials) => {
        try {
            const user = await API.logIn(credentials);
            setUser(user);
            setLoggedIn(true);
            navigate('/');
        } catch (err) { throw err; }    // l'errore è gestito e visualizzato nel form del login (qui non viene gestito ma solo lanciato)
    };

    /* Funzione che gestisce il processo di logout */
    const handleLogout = async () => {
        await API.logOut();
        setLoggedIn(false);
        setUser(null);
        navigate('/');
    };

    return(<>
        <MyNavbar logout={handleLogout} user={user} loggedIn={loggedIn} />
        
        <Routes>
            <Route path="/" element={ loading ? <LoadingLayout/> : <MainLayout user={user} loggedIn={loggedIn}/> }/>
            <Route path="add" element={<AddLayout/>} /> 
            <Route path="login" element={<LoginLayout login={handleLogin} logout={handleLogout}/>}  /> {/* Passo handleLogout perché usato nel bottone logout */}
            <Route path="*" element={<NotFoundLayout/>} />
        </Routes>    
    </>);
}

export default App;
