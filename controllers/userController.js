const { userSchema } = require("../validators/userValidator");
const userService = require("../services/userService");

exports.getUsers = async (req, res) => {
  const users = await userService.getAllUsers();
  res.json(users);
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


