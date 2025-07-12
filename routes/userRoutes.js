const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { isAuthenticated } = require("../auth");

router.get("/", userController.getUsers);
router.post("/register", userController.createUser);
router.get("/:id", isAuthenticated, userController.getUserById);
router.put("/update", isAuthenticated, userController.updateUser);

module.exports = router;
