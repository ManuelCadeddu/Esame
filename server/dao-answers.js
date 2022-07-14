'use strict';

const sqlite = require('sqlite3');

/* Apertura database */
const db = new sqlite.Database('riddles.db', (err) => { if(err) throw err; });

/* Carica le risposte dal db */
exports.getAnswers = () => {

    return new Promise((resolve, reject) => {

        const sql = 'SELECT * FROM answers'
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else{
                const answers = rows.map((e) => ({id: e.id, text: e.text, winning: e.winning, riddleId: e.riddleId, userId: e.userId}));
                resolve(answers);
            }
        });
    });
};

/* Carica risposta by id */
exports.getAnswerById = (answerId) => {
    
    return new Promise((resolve, reject) => {

      const sql = 'SELECT * FROM answers WHERE id=?';
      
        db.get(sql, [answerId], (err, row) => {

            if(err){ reject(err);
            }else if(row == undefined){ resolve({ error: 'Answer not found.' });
            }else resolve(row);
        });
    });
};

/* Aggiungi una nuova risposta nel db */
exports.addAnswer = (answer, userId) => {
    
    return new Promise((resolve, reject) => {

        const sql = 'INSERT INTO answers (text, winning, riddleId, userId) VALUES(?, ?, ?, ?)';
        
        //Nota: la funzione passata come parametro in db.run() non è arrow function, così si può usare this.lastID
        db.run(sql, [answer.text, answer.winning, answer.riddleId, answer.userId], function (err) {
           
            if(err) reject(err);
            else resolve(exports.getAnswerById(this.lastID)); 
        });
    }); 
};

/* Carica la risposta vincente di un indovinello */
exports.getWinnerAnswer = (riddleId) => {

    return new Promise((resolve, reject) => {

        const sql = 'SELECT * FROM answers WHERE riddleId=? AND winning=1';

        db.all(sql, [riddleId], (err, row) => {

            if(err){ reject(err);
            }else if(row == undefined){ resolve({ error: 'Answer not found.' });
            }else   resolve(row);
        });
    });
};

/* Verifica se l'utente ha già risposto alla domanda */
exports.hasUserAlreadyAnswer = (riddleId, userId) => {
    
    return new Promise((resolve, reject) => {

      const sql = 'SELECT * FROM answers WHERE riddleId=? AND userId=?';
      
        db.get(sql, [riddleId, userId], (err, row) => {

            if(err){ reject(err);
            }else if(row == undefined){ resolve(false);
            }else resolve(true);
        });
    });
};
