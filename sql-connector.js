const sqlite3 = require('sqlite3').verbose();

const dbPath = './app-database.db';

let db;

async function initialize() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error connecting to the database:', err.message);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database.');

      db.run(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          password TEXT NOT NULL,
          otherSensitiveData TEXT
        )`,
        (err) => {
          if (err) {
            console.error('Error creating table:', err.message);
            reject(err);
            return;
          }

          console.log('Users table created or already exists.');

          db.get(`SELECT COUNT(*) AS count FROM users`, [], (err, row) => {
            if (err) {
              console.error('Error checking table data:', err.message);
              reject(err);
              return;
            }

            if (row.count === 0) {
              const sampleData = [
                ['user1', 'password1', 'sensitiveData1'],
                ['user2', 'password2', 'sensitiveData2'],
                ['user3', 'password3', 'sensitiveData3'],
                ['user4', 'password4', 'sensitiveData4'],
                ['user5', 'password5', 'sensitiveData5'],
              ];

              const insertQuery = `INSERT INTO users (username, password, otherSensitiveData) VALUES (?, ?, ?)`;

              sampleData.forEach((record) => {
                db.run(insertQuery, record, (err) => {
                  if (err) {
                    console.error('Error inserting data:', err.message);
                  }
                });
              });

              console.log('Inserted 5 sample records into the users table.');
            } else {
              console.log('Users table already contains data.');
            }
            resolve();
          });
        }
      );
    });
  });
}

async function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Error executing query:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = { initialize, query };
