// Generate bcrypt hash for password
const bcrypt = require('bcryptjs');

const password = 'password123';

bcrypt.hash(password, 10).then(hash => {
  console.log('\n=== PASSWORD HASH GENERATED ===');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\n=== SQL COMMAND ===');
  console.log(`UPDATE user_account SET password_hash = '${hash}' WHERE email = 'seller1@demo.com';`);
  console.log('\nCopy the UPDATE command above and run it in your database (MSSQL).\n');
}).catch(err => {
  console.error('Error:', err);
});
