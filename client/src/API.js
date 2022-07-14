import { Answer } from './models/Answer';
import { Riddle } from './models/Riddle';
import { UserTop3 } from './models/User';

const SERVER_URL = 'http://localhost:3001/api/';

/* Funzione per fare parsing dell'HTTP response */
function getJson(httpResponsePromise) {

    return new Promise((resolve, reject) => {

        httpResponsePromise.then((response) => {
            
            if(response.ok){

                response.json()
                    .then( json => resolve(json) )
                    .catch( err => reject({ error: "Cannot parse server response" }))
            }else{
                response.json()
                    .then( obj => reject(obj) )
                    .catch(err => reject({ error: "Cannot parse server response" }))
            }
        
        }).catch(err => reject({ error: "Cannot communicate"  }))
    });
}

/* Funzione eseguita durante il login */
const logIn = async (credentials) => {
    
    return getJson( fetch(SERVER_URL + 'sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        credentials: 'include',
        body: JSON.stringify(credentials)
    }))
};
  
/* Funzione usata per verificare se l'utente è ancora loggato */
const getUserInfo = async () => {
    
    return getJson( fetch(SERVER_URL + 'sessions/current', {
        credentials: 'include' 
    }))
};
  
/* Funzione che distrugge la sessione utente corrente ed esegue logout */
const logOut = async() => {
    
    return getJson( fetch(SERVER_URL + 'sessions/current', {
        method: 'DELETE',
        credentials: 'include' 
    }))
};

/* Ottiene lista indovinelli dal server */
const getRiddles = async () => {

    return getJson( fetch( SERVER_URL + 'riddles/', { credentials: 'include' } ) )
        .then( json => { return json.map((riddle) => new Riddle(riddle)) })
};

/* Invia un nuovo indovinello al server */
function addRiddle(riddle){

    return getJson(

        fetch(SERVER_URL + 'riddles/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(riddle) 
        })
    )
}

/* Richiede la chiudura di un indovinello al server */
function setRiddleClose(riddle) {

    return getJson(

        fetch(SERVER_URL + 'riddles/setClose/' + riddle.id, {
            method: 'PUT',
            headers: {
            'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ 'id': riddle.id, 'open': riddle.open, 'duration': riddle.duration, 'dateFirstAnswer': riddle.dateFirstAnswer }) 
        })
    )
}

/* Ottiene lista delle risposte dal server */
const getAnswers = async () => {

    return getJson( fetch( SERVER_URL + 'answers/', { credentials: 'include' } ) )
        .then( json => { return json.map((answer) => new Answer(answer)) })
};

/* Invia una nuova risposta al server */
function addAnswer(answer){

    return getJson(

        fetch(SERVER_URL + 'answers/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(answer) 
        })
    )
}

/* Richiede l'aggiornamento di un utente nel server (usato per aggiornare il punteggio) */
function updateUser(user){

    return getJson(
        
        fetch(SERVER_URL + 'users/' + user.id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(user) 
        })
    )
}

/* Ottiene la Top3 dal server */
const getTop3 = async () => {
 
    return getJson( fetch(SERVER_URL + 'top3') )
        .then( json => { return json.map((user) => new UserTop3(user)) })
}

const API = {logIn, getUserInfo, logOut, getRiddles, addRiddle, setRiddleClose, getAnswers, addAnswer, getTop3, updateUser};
export default API;
