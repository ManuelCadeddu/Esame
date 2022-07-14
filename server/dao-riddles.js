'use strict';

const sqlite = require('sqlite3');
const dayjs = require("dayjs");

/* Apertura database */
const db = new sqlite.Database('riddles.db', (err) => { if(err) throw err; });

/* Ottieni tutti gli indovinelli */
exports.getRiddles = () => {

    return new Promise((resolve, reject) => {

        const sql = 'SELECT * FROM riddles';

        db.all(sql, [], (err, rows) => {
            if(err) reject(err); 
            else{
                const riddles = rows.map((e) => ({...e, dateFirstAnswer: dayjs(e.dateFirstAnswer)}));
                resolve(riddles);
            }
        });
    });
};

/* Ottieni indovinello by id */
exports.getRiddleById = (riddleId) => {
    
    return new Promise((resolve, reject) => {

        const sql = 'SELECT * FROM riddles WHERE id=?';
      
        db.get(sql, [riddleId], (err, row) => {

            if(err){ reject(err);
            }else if(row == undefined){ resolve({ error: 'Riddle not found.' });
            }else{
                row.dateFirstAnswer = dayjs(row.dateFirstAnswer)
                resolve(row);
            } 
        });
    });
};

/* Aggiungi un nuovo indovinello */
exports.addRiddle = (riddle, userId) => {
    
    return new Promise((resolve, reject) => {

        const sql = 'INSERT INTO riddles (text, solution, suggestion1, suggestion2, difficulty, duration, userId) VALUES(?, ?, ?, ?, ?, ?, ?)';
        
        //Nota: la funzione passata come parametro in db.run() non è arrow function, così si può usare this.lastID
        db.run(sql, [riddle.text, riddle.solution, riddle.suggestion1, riddle.suggestion2, riddle.difficulty, riddle.duration, userId], function (err) {
           
            if(err) reject(err);
            else resolve(exports.getRiddleById(this.lastID)); 
        });
    }); 
};

/* Aggiorna un indovinello */
exports.updateRiddle = (riddleId, riddle) => {

    return new Promise((resolve, reject) => {
      
        const sql = 'UPDATE riddles SET text=?, solution=?, suggestion1=?, suggestion2=?, difficulty=?, duration=?, dateFirstAnswer=?, open=? WHERE id=?';
        
        db.run(sql, [riddle.text, riddle.solution, riddle.suggestion1, riddle.suggestion2, riddle.difficulty, riddle.duration, riddle.dateFirstAnswer, riddle.open, riddleId], function (err) {
        
            if(err) reject(err);
            else resolve(exports.getRiddleById(riddleId)); 
      });
    });
};

/* Imposta un indovinello come 'chiuso' */
exports.setRiddleClose = (riddleId) => {

    return new Promise((resolve, reject) => {
      
        const sql = 'UPDATE riddles SET open=false WHERE id=?';
        
        db.run(sql, [riddleId], function (err) {
            if(err) reject(err);
            else resolve(exports.getRiddleById(riddleId)); 
      });
    });
}
