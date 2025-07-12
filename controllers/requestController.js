const { requestSchema } = require("../validators/requestValidator");
const requestService = require("../services/requestService");

exports.createRequest = async (req, res) => {
  try {
    const parsed = requestSchema.parse(req.body);
    const id = await requestService.createRequest(parsed);
    res.status(201).json({ message: "Request created", id });
  } catch (err) {
    if (err.name === "ZodError") {
      console.warn("Validation failed:", err.errors);
      return res.status(400).json({ error: "Validation failed", details: err.errors });
    }
    console.error("Error creating request:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getRequest = async (req, res) => {
  try {
    const id = req.params.id;
    const request = await requestService.getRequestbyId(id);
    res.json(request);
  } catch (err) {
    console.error("Error retrieving request:", err);
    res.status(404).json({ error: "Request not found" });
  }
};

exports.allRequests = async (req, res) => {
  try {
    const requests = await requestService.getAllRequests();
    res.json(requests);
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getRequestByUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    const requests = await requestService.getRequestsByUser(userId);
    res.json(requests);
  } catch (err) {
    console.error("Error fetching requests by user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

exports.setWinningBid = async (req, res) => {
  try {
    const { reqId } = req.params;
    const { bidId } = req.body;
    if (!bidId) {
      return res.status(400).json({ error: "Bid ID is required" });
    }
    await requestService.setWinningBid(reqId, bidId);
    res.status(200).json({ message: "Winning bid set successfully" });
  } catch (err) {
    if (err.message === "Bid not found") {
      return res.status(404).json({ error: err.message });
    }
    console.error("Error setting winning bid:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

exports.getWinningBid = async (req, res) => {
  try {
    const { reqId } = req.params;
    const winningBid = await requestService.getWinningBid(reqId);
    res.status(200).json(winningBid);
  } catch (err) {
    if (err.message === "No winning bid found") {
      return res.status(404).json({ error: err.message });
    }
    console.error("Error retrieving winning bid:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}