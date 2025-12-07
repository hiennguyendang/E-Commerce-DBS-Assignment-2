// Generate bcrypt hash for password
const bcrypt = require('bcryptjs');

// Get password from command line or use default
const password = process.argv[2] || 'password123';
const email = process.argv[3] || 'user@demo.com';

bcrypt.hash(password, 12).then(hash => {
  console.log('\n=== PASSWORD HASH GENERATED ===');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\n=== SQL COMMAND ===');
  console.log(`UPDATE user_account SET password_hash = '${hash}' WHERE email = '${email}';`);
  console.log('\nCopy the UPDATE command above and run it in your database (MSSQL).\n');
}).catch(err => {
  console.error('Error:', err);
});
