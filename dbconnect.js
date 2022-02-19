const mysql = require('mysql');
let instance = null;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'delivrbase',
    port: '3306'
});

connection.connect( (err) => {
    if(err){
        //console.log(err.message);
        console.log('db refused connection');
    }
    console.log(`db ${connection.state}`);
})

class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    async queueData(q, params) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = q;
                connection.query(query, params, (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results);
                })
            });

            //console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    }
    

}

module.exports = DbService;