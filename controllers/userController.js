const { userSchema } = require("../validators/userValidator");
const userService = require("../services/userService");

exports.getUserDetails = async (req, res) => {
  const userData = await userService.getUserDetails(req.user.userId);
  res.status(200).json(userData);
};

exports.createUser = async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const parsed = userSchema.parse(req.body);

    const createdId = await userService.createUser({
      ...parsed,
      agricoin: 0,
      is_verified: false,
      createdAt: new Date()
    });

    res.status(201).json({ message: "User created", id: createdId });
  } catch (err) {
    if (err.name === "ZodError") {
      console.warn("Validation failed:", err.errors);
      return res.status(400).json({ error: "Validation failed", details: err.errors });
    }

    console.error("Error in userController.createUser:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userService.getUserById(userId);
    res.json(user);
  } catch (err) {
    if (err.message === "User not found") {
      return res.status(404).json({ error: err.message });
    }
    console.error("Error in userController.getUserById:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

exports.updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const parsed = userSchema.parse(req.body);

    const updatedUser = await userService.updateUser(userId, parsed);
    res.json(updatedUser);
  } catch (err) {
    if (err.name === "ZodError") {
      console.warn("Validation failed:", err.errors);
      return res.status(400).json({ error: "Validation failed", details: err.errors });
    }
    if (err.message === "User not found") {
      return res.status(404).json({ error: err.message });
    }
    console.error("Error in userController.updateUser:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

exports.getFarmers = async (req, res) => {
  try {
    const farmers = await userService.getFarmers();
    res.status(200).json(farmers);
  } catch (err) {
    console.error("Error in userController.getFarmers:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

exports.getUnverifiedUsers = async (req, res) => {
  try {
    const requester = req.user;
    const requesterData = await userService.getUserById(requester.userId);
    if (requesterData.role !== "Admin") {
      return res.status(403).json({ error: "No permission." });
    }

    const unverifiedUsers = await userService.getUnverifiedUsers();
    
    res.status(200).json(unverifiedUsers);
  } catch (err) {
    console.error("Error in userController.getUnverifiedUsers:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

exports.verifyUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const requester = req.user;

    const requesterData = await userService.getUserById(requester.userId);
    if (requesterData.role !== "Admin") {
      return res.status(403).json({ error: "No permission." });
    }

    await userService.verifyUser(userId);
    res.status(200).json({ message: "User verified successfully" });
  } catch (err) {
    if (err.message === "User not found") {
      return res.status(404).json({ error: err.message });
    }
    console.error("Error in userController.verifyUser:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

exports.rejectUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const requester = req.user;

    const requesterData = await userService.getUserById(requester.userId);
    if (requesterData.role !== "Admin") {
      return res.status(403).json({ error: "No permission." });
    }

    await userService.rejectUser(userId);
    res.status(200).json({ message: "User rejected successfully" });
  } catch (err) {
    if (err.message === "User not found") {
      return res.status(404).json({ error: err.message });
    }
    console.error("Error in userController.rejectUser:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
