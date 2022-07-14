'use strict';

/* Import */
const riddleDao = require('./dao-riddles'); 
const answerDao = require('./dao-answers');
const userDao = require('./dao-users');

const express = require('express'); 
const morgan = require('morgan');
const cors = require('cors');
const dayjs = require('dayjs');

const { check, validationResult, body } = require('express-validator');

const passport = require('passport');   
const LocalStrategy = require('passport-local'); 
const session = require('express-session');

/*** Inizializzazione e setup dei middleware ***/

const app = express();
const port = 3001;
app.use(morgan('dev'));
app.use(express.json());

/** Set up e abilitazione Cross-Origin Resource Sharing (CORS) **/
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
};
app.use(cors(corsOptions));

/** Passport **/
/* Scelta e set up della strategia di autenticazione */
passport.use(new LocalStrategy(async function verify(username, password, done){

    const user = await userDao.getUser(username, password) 
    
    // La callback fornisce un utente autenticato, oppure 'false' ed un messaggio di errore facoltativo
    if(!user)
        return done(null, false, 'Incorrect email or password');  
    return done(null, user);
}));
  
/* Scrivere nel cookie di sessione l'identificativo della sessione a partire dall'oggetto 'user' ottenuto da LocalStrategy(verify) */
passport.serializeUser(function (user, done){
    done(null, user.id);
});
  
/* Ottenere 'user' corrente a partire dal cookie di sessione */
passport.deserializeUser(function (user, done){

    // Controllo aggiuntivo per verificare che l'utente stia ancora nel DB
    userDao.getUserById(user)
        .then(user => { done(null, user); })
        .catch(err => { done(err, null); });
});

/** Creazione sessione **/
app.use(session({
    secret: "Secret",
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.authenticate('session'));
  
/** Definizione del middleware di verifica dell'autenticazione per proteggere le route **/
const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated())
        return next();
    return res.status(401).json({error: 'Not authorized'});
}


/*** Utility Functions ***/

/** Funzione per formattare gli errori ottenuti da express-validator in stringhe **/
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
    return `${location}[${param}]: ${msg}`;
};


/*** Users APIs ***/

/** POST /api/sessions (per login) **/ 
app.post('/api/sessions', 
        [body('username').isEmail().withMessage('Email not valid')],
        function(req, res, next) {

            const errors = validationResult(req).formatWith(errorFormatter);
            if(!errors.isEmpty()) 
                return res.status(422).json({ error: errors.array().join(", ")  });

            passport.authenticate('local', (err, user, info) => { 
           
                if(err)    return next(err);
                if(!user)  return res.status(401).json({ error: info});
         
                req.login(user, (err) => {
                    if(err) return next(err);
                    return res.json(req.user);
                });
            })(req, res, next); 
        }
);

/** GET /api/sessions/current (controlla se un utente è loggato) **/
app.get('/api/sessions/current', (req, res) => {
    
    if(req.isAuthenticated()) 
        res.status(200).json(req.user);
    else    
        res.status(401).json({error: 'Not authenticated'});
});

/** DELETE /api/session/current (per logout) **/
app.delete('/api/sessions/current', (req, res) => {
    req.logout(() => { res.status(200).json({}); });
});


/** GET /api/top3 (caricare i punteggi degli utenti dal DB) **/
app.get('/api/top3', (req, res) => { // Route utilizzabile anche da utenti non loggati
    
    userDao.getTop3()
        .then(users => res.json(users))
        .catch(err => res.status(500).json(err));
});

/*** Riddles APIs ***/
function formatRiddle(riddle, user){

    if(!user){      // Se l'utente non è loggato
        riddle.solution='';
        riddle.suggestion1='';
        riddle.suggestion2='';   
    }else{

        if(riddle.open && riddle.userId!==user.username){  // Se l'indovinello è aperto e non è dell'utente loggato
               
            riddle.solution='';

            if(riddle.dateFirstAnswer.format() == 'Invalid Date'){      // Se l'indovinello è nuovo
                riddle.suggestion1='';
                riddle.suggestion2='';
            }else{
                const secondRemaining = riddle.dateFirstAnswer.add(riddle.duration, 's').diff(dayjs(), 'second'); 
                if(secondRemaining > 0.5*riddle.duration)
                    riddle.suggestion1='';
                if(secondRemaining > 0.25*riddle.duration)
                    riddle.suggestion2='';
            }    
        }
    }
    return riddle;
}

/** GET /api/riddles (per caricare gli indovinelli dal DB) **/
app.get('/api/riddles', (req, res) => { // Route utilizzabile anche da utenti non loggati
    
    // NOTA: nascondo le soluzioni e i suggerimenti a chi non li deve conoscere
    riddleDao.getRiddles()
        .then(riddles => { 
            riddles = riddles.map(r => formatRiddle(r, req.user))
            res.json(riddles)
        })
        .catch(err => res.status(500).json(err));
});

/** POST /api/riddles (per aggiungere un nuovo indovinello nel DB) **/
app.post('/api/riddles', isLoggedIn,   // Route utlizzabile solo da utenti loggati (non serve controllare che l'utente esista perché se fosse isLoggedIn fallirebbe)
    [
        check('text')
            .exists().withMessage('Text must be present')
            .isString().withMessage('Text must be a string')
            .trim().notEmpty().withMessage('Text cannot be an empty string'),
        check('solution')
            .exists().withMessage('Solution must be present')
            .isString().withMessage('Solution must be a string')
            .trim().toLowerCase().notEmpty().withMessage('Solution cannot be an empty string'),
        check('suggestion1')
            .exists().withMessage('Suggestion1 must be present')
            .isString().withMessage('Suggestion1 must be a string')
            .trim().notEmpty().withMessage('suggestion1 cannot be an empty string'),
        check('suggestion2')
            .exists().withMessage('Suggestion2 must be present')
            .isString().withMessage('Suggestion2 must be a string')
            .trim().notEmpty().withMessage('Suggestion2 cannot be an empty string'),
        check('difficulty')
            .exists().withMessage('Difficulty must be present')
            .isIn(['facile', 'medio', 'difficile']).withMessage('Invalid difficulty')
            .toLowerCase(),
        check('duration')
            .exists().withMessage('Duration must be present')
            .isInt({ min: 30, max: 600 }).withMessage('Duration must be between 30 and 600')
    ], async (req, res) => {
    
        const errors = validationResult(req).formatWith(errorFormatter);
        if (!errors.isEmpty()) 
            return res.status(422).json({ error: errors.array().join(", ")  });

        const riddle = {
            text: req.body.text,
            solution: req.body.solution,
            suggestion1: req.body.suggestion1,
            suggestion2: req.body.suggestion2,
            difficulty: req.body.difficulty,
            duration: req.body.duration
        };  
       
        try{
            const result = await riddleDao.addRiddle(riddle, req.user.username);
            res.json(result); 
        }catch(err){
            res.status(503).json({ error: `Database error during the creation of new riddle: ${err}` }); 
        }
});

/** PUT /api/riddles/setClose/<id> (per modificare i campi 'dateFirstAnswer' e/o 'open' dell'indovinello **/     
app.put('/api/riddles/setClose/:id', // Route utlizzabile anche da utenti non loggati (per aggiornare quando viene chiuso un indovinello perché è scaduto il tempo e nessuno è loggato)
    [
        check('id')
            .isInt().withMessage('id must be an int'), 
        check('duration')
            .exists().withMessage('Duration must be present')
            .isInt({ min: 30, max: 600 }).withMessage('Duration must be between 30 and 600')
    ], async (req, res) => {

        const errors = validationResult(req).formatWith(errorFormatter);
        if(!errors.isEmpty()) 
            return res.status(422).json({ error: errors.array().join(", ")  });

        // Verifica che l'id nel body coincida con quello nell'URL
        if(req.body.id !== Number(req.params.id))   
            return res.status(422).json({ error: 'URL and body id mismatch' });

        try{

            // Verifica che se si vuole chiudere un indovinello ci sia una risposta vincente o il tempo deve essere scaduto
            if(!req.body.open){  
            
                const secondRemaining = req.body.dateFirstAnswer.add(req.body.duration, 's').diff(dayjs(), 'second');
                const answer = await answerDao.getWinnerAnswer(req.params.id)
                                                .then(a => {
                                                    if(answer.error && secondRemaining>0)
                                                        return res.status(422).json({error: 'The riddle cannot be closed' });
                                                })
            }
           
            // Verifica anche se l'indovinello non esiste perché da errore
            const result = await riddleDao.setRiddleClose(req.params.id);
            return res.json(result); 

        } catch (err) {
            res.status(503).json({ error: `Database error during the update of riddle: ${err}` });
        }
    }
);

/*** Answers APIs ***/

app.get('/api/answers', (req, res) => {    // Route utlizzabile solo da utenti loggati

    answerDao.getAnswers() 
        .then(answers => {
            if(req.user)
                res.json(answers)
            else
                res.json([])
        })
        .catch(err => res.status(500).json(err));
});

/** POST /api/answers (per aggiungere una nuova risposta) **/
app.post('/api/answers', isLoggedIn,  // Route utlizzabile solo da utenti loggati
    [
        check('text')
            .exists().withMessage('Text must be present')
            .isString().withMessage('Text must be a string')
            .trim().notEmpty().withMessage('Text cannot be an empty string')
            .toLowerCase(),
        check('riddleId')
            .exists().withMessage('riddleId must be present')
            .isInt().withMessage('RiddeId must be an int'),
    ], async (req, res) => {

        let result;
    
        const errors = validationResult(req).formatWith(errorFormatter);
        if(!errors.isEmpty()) 
            return res.status(422).json({ error: errors.array().join(", ")  }); 

        try{

            const riddle = await riddleDao.getRiddleById(req.body.riddleId);
            let riddlePoints = riddle.difficulty === 'facile' ? 1 : riddle.difficulty === 'medio' ? 2 : 3;

            // Verifico che la risposta sia relativa ad un indovinello esistente
            if(riddle.error)
                return res.status(422).json({ error: 'The answer relates to a non-existent riddle' });

            const answer = {
                text: req.body.text,
                winning: riddle.solution == req.body.text,
                riddleId: req.body.riddleId,
                userId: req.user.username
            }; 
            

            // Verifico che l'indovinello sia aperto quando viene inserita la risposta
            if(!riddle.open)
                return res.status(422).json({ error: `The riddle ${answer.riddleId} is close, you cannot enter an answer` });

            // Verifico che l'utente che ha inserito la risposta sia diverso da quello che ha creato l'indovinello
            if(riddle.userId === answer.userId)
                return res.status(422).json({ error: "The author of a riddle cannot answer it" });

            // Verifico che l'utente non abbia già risposto
            result = await answerDao.hasUserAlreadyAnswer(answer.riddleId, answer.userId); 
            if(result)
                return res.status(422).json({ error: `${req.user.username} has already entered an answer` });
       
            // Query per aggiornare gli indovinelli
            // NOTA: è da aggiornare prima l'indovinello perché altrimenti possono esserci problemi di sincronizzazione
            if(riddle.dateFirstAnswer.format() === "Invalid Date" && !answer.winning){  // Se è la prima risposta relativa all'indovinello (gestisce anche risposta corretta)
                await riddleDao.updateRiddle(riddle.id, { ...riddle, "dateFirstAnswer": dayjs().format('YYYY-MM-DDTHH:mm:ss'), "open": true});
            }else if(riddle.dateFirstAnswer.format() === "Invalid Date" && answer.winning){  // Se è la prima risposta relativa all'indovinello (gestisce anche risposta corretta)
                
                req.user.score = req.user.score + riddlePoints;
                
                await riddleDao.updateRiddle(riddle.id, { ...riddle, "dateFirstAnswer": dayjs().format('YYYY-MM-DDTHH:mm:ss'), "open": false});
                await userDao.updateUser(req.user.id, req.user);
                
            }else if(answer.winning){       // Se non è la prima risposta ma è corretta

                req.user.score = req.user.score + riddlePoints;

                await riddleDao.updateRiddle(riddle.id, { ...riddle, "open": false});
                await userDao.updateUser(req.user.id, req.user);
            } 
                
            // Query per l'aggiunta della risposta nel DB
            result = await answerDao.addAnswer(answer);
            res.json(result);

        }catch(err){
            res.status(503).json({ error: `Database error during the creation of new answer: ${err}` }); 
        }
});


/*** Attivazione del server ***/

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});