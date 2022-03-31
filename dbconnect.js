const mysql = require('mysql');
let instance = null;
let dbconnection;

let db_config = {
    // host: "localhost",
    // user: "root",
    // password: "",
    // database: 'delivrbase',
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b2a5fa40654afb',
    password: '556171fa',
    database: 'heroku_6003e04e89b9d0d',
    connectionLimit: 50,
    queueLimit: 0,
    waitForConnection: true,
    debug: false,
    timezone: 'utc',
    supportBigNumbers: true,
    bigNumberStrings: true
};

let tempPool = mysql.createPool(db_config);
    tempPool.getConnection(function(err, connection) {
        
        dbconnection = connection;
        if(err){
            console.log('db refused connection');
            console.log(err);
        }
        console.log(`db ${connection.state}`);
    });

console.log("Waiting for stuff....");

// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'delivrbase',
//     port: '3306'
// });

// connection.connect( (err) => {
//     if(err){
//         //console.log(err.message);
//         console.log('db refused connection');
//     }
//     console.log(`db ${connection.state}`);
// })

class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    async queueData(q, params) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = q;
                
                //console.log(dbconnection.tempPool.state)
                console.log(dbconnection.state)

                if(dbconnection.state == "disconnected"){
                    tempPool.getConnection(function(err, connection) {
        
                        dbconnection = connection;
                        if(err){
                            console.log('db refused connection');
                            console.log(err);
                        }else{
                            dbconnection.query(query, params, (err, results) => {
                                if(err) reject(new Error(err.message));
                                resolve(results);
                            })
                        }
                        console.log(`db ${connection.state}`);
                    });
                    
                }else{
                    dbconnection.query(query, params, (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    })
                }
                
                
            });

            //console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    }
    

}

module.exports = DbService;
