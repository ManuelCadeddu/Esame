'use strict';

const sqlite = require('sqlite3');

/* Apertura database */
const db = new sqlite.Database('riddles.db', (err) => { if(err) throw err; });

const crypto = require('crypto');

/* Ritorna informazioni dell'utente dato il suo id */
exports.getUserById = (id) => {
    
    return new Promise((resolve, reject) => {
        
        const sql = 'SELECT * FROM users WHERE id = ?';
        
        db.get(sql, [id], (err, row) => {
          
            if(err){ reject(err);
            }else if(row === undefined){  resolve({ error: 'User not found.' });
            }else {
                const user = {id: row.id, email: row.email, username: row.username, score: row.score}
                resolve(user);
            }
        });
    });
};

/* Funzione per verificare username e password nel momento del login */
exports.getUser = (email, password) => {

    return new Promise((resolve, reject) => {

        const sql = 'SELECT * FROM users WHERE email = ?';
          
        db.get(sql, [email], (err, row) => {
        
            if(err){ reject(err); } 
            else if(row === undefined){ resolve(false); }
            else {
                
                const user = {id: row.id, email: row.email, username: row.username, score: row.score};
  
                crypto.scrypt(password, row.salt, 32, function (err, hashedPassword) {
                    if(err) reject(err);
                    if(!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword))  // Confronta password inserita con quella del DB
                        resolve(false);
                    else
                        resolve(user);
                });
            }
        });
    });
};

/* Carica top-3 dal DB */
exports.getTop3 = () => {

    return new Promise((resolve, reject) => {

        const sql = 'SELECT username, score, rank FROM(SELECT username, score, DENSE_RANK() OVER (ORDER BY score DESC) as rank FROM users) WHERE rank <= 3'

        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else{
                const users = rows.map((e) => ({username: e.username, score: e.score, rank: e.rank}));
                resolve(users);
            }
        });
    });
};

/* Aggiorna un indovinello esistente dato il suo id e le nuove proprietà */
exports.updateUser = (id, user) => {

    return new Promise((resolve, reject) => {
      
        const sql = 'UPDATE users SET email=?, username=?, score=? WHERE id=?';
        
        db.run(sql, [user.email, user.username, user.score, id], function (err) {
            if(err) reject(err);
            else resolve(exports.getUserById(id)); 
      });
    });
};
