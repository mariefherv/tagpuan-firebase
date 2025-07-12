const express = require("express");
const router = express.Router();
const bidController = require("../controllers/bidController");
const { isAuthenticated } = require("../auth");

router.post("/create", isAuthenticated, bidController.createBid);
router.get("/view/:bidId", isAuthenticated, bidController.viewBid);
router.get("/request/:requestId", isAuthenticated, bidController.getBidsByRequest);
router.put("/withdraw/:bidId", isAuthenticated, bidController.withdrawBid);
router.put("/rebid/:bidId", isAuthenticated, bidController.rebid);
router.get("/check/:requestId", isAuthenticated, bidController.hasActiveBid);

module.exports = router;
