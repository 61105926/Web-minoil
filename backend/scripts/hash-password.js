const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'admin123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error generando hash:', err);
    return;
  }
  console.log('\n=================================');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('=================================\n');
  console.log('SQL para insertar usuario:');
  console.log(`INSERT INTO "USUARIOS" ("USERNAME", "PASSWORD_HASH") VALUES ('admin', '${hash}');`);
  console.log('\n');
});
