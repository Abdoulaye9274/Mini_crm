const bcrypt = require("bcrypt");
const pool = require("./db");

(async () => {
  const hashedPassword = await bcrypt.hash("admin123!", 10);
  await pool.query(
    "INSERT INTO users (login, password, role) VALUES ($1, $2, $3) ON CONFLICT (login) DO NOTHING",
    ["admin", hashedPassword, "admin"]
  );
  console.log("✅ Utilisateur admin créé !");
  process.exit();
})();
