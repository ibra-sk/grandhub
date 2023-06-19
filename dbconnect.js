const mysql = require('mysql');
let instance = null;
let dbconnection;

let db_config = {
	host: process.env.MYDB_HOST,
    user: process.env.MYDB_USER,
    password: process.env.MYDB_PASS,
    database: process.env.MYDB_NAME,
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