const mysql = require('mysql2/promise');

async function checkDb() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Viji@323',
      database: 'ayursutra_db'
    });

    console.log('Connected to DB');

    const [users] = await connection.execute('SELECT id, username, email, phone, role FROM users');
    console.log('--- USERS ---');
    console.table(users);

    const [doctors] = await connection.execute('SELECT id, user_id, specialization FROM doctors');
    console.log('--- DOCTORS ---');
    console.table(doctors);

    await connection.end();
  } catch (err) {
    console.error(err);
  }
}

checkDb();
