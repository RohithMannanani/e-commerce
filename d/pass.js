const bcrypt = require('bcrypt');

async function hashPassword() {
  const plainPassword = "admin@2004";
  const saltRounds = 10; // higher = more secure but slower
  const hashed = await bcrypt.hash(plainPassword, saltRounds);
  console.log("Hashed password:", hashed);
}

hashPassword();
