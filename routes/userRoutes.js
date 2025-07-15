const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { isAuthenticated, isAdmin } = require("../auth");

router.get("/getDetails", isAuthenticated, userController.getUserDetails);
router.post("/register", userController.createUser);
router.put("/update", isAuthenticated, userController.updateUser);
router.get("/farmers", isAuthenticated, userController.getFarmers);
router.get("/unverified", isAuthenticated, userController.getUnverifiedUsers);
router.put("/verify/:id", isAuthenticated, userController.verifyUser);
router.put("/reject/:id", isAuthenticated, userController.rejectUser);
router.get("/:id", isAuthenticated, userController.getUserById);

module.exports = router;
