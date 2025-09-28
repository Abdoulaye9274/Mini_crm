
const express = require("express");
const router = express.Router();
const { loginUser, changePassword } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User"); // Assurez-vous d'importer le modèle User

// ... les autres routes comme login, etc.

router.post("/login", loginUser);
router.post("/change-password", protect, changePassword);

// NOUVELLE ROUTE À AJOUTER
// @desc    Get user profile
// @route   GET /api/users/me
// @access  Private
router.get("/me", protect, async (req, res) => {
  try {
    // req.user est ajouté par le middleware 'protect'
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
