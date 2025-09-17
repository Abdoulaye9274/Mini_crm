// hash.js (version ES module)
import bcrypt from "bcrypt";

const plainPassword = "admin123";

bcrypt.hash(plainPassword, 10).then((hash) => {
  console.log("✅ Hash généré:", hash);
}).catch((err) => {
  console.error("❌ Erreur de hash:", err);
});
