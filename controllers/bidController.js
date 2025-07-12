const { bidSchema } = require("../validators/bidValidator.js");
const bidService = require("../services/bidService.js");

exports.createBid = async (req, res) => {
    try {
        console.log("Request body:", req.body);

        const parsed = bidSchema.parse(req.body);

        // Prevent creating another bid if user already has an active bid for the request
        const { hasActiveBid } = await bidService.hasActiveBid(parsed.request_id, req.user.userId);
        if (hasActiveBid) {
            return res.status(400).json({ error: "User already has an active bid for this request" });
        }

        const bid = await bidService.createBid(parsed);
        res.status(201).json(bid);
    } catch (err) {
        if (err.name === "ZodError") {
            console.warn("Validation failed:", err.errors);
            return res.status(400).json({ error: "Validation failed", details: err.errors });
        }
        console.error("Error in bidController.createBid:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.viewBid = async (req, res) => {
    try {
        const bid = await bidService.viewBid(req.params.bidId);
        res.status(200).json(bid);
    } catch (err) {
        if (err.message === "Bid not found") {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getBidsByRequest = async (req, res) => {
    try {
        const bids = await bidService.getBidsByRequest(req.params.requestId);
        res.status(200).json(bids);
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.withdrawBid = async (req, res) => {
    try {
        const bid = await bidService.withdrawBid(req.params.bidId);
        res.status(200).json(bid);
    } catch (err) {
        if (err.message === "Bid not found" || err.message === "Cannot withdraw a winning bid") {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.rebid = async (req, res) => {
    try {
        const rebid = await bidService.rebid(req.params.bidId, req.user.userId);
        res.status(200).json(rebid);
    } catch (err) {
        if (err.message === "Bid not found") {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
}

exports.hasActiveBid = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user.userId;
        const hasBid = await bidService.hasActiveBid(requestId, userId);
    res.status(200).json({ hasActiveBid: hasBid });
    } catch (err) {
        console.error("Error checking active bid:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
