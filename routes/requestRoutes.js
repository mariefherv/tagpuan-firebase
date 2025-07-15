const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");
const { isAuthenticated } = require("../auth");

router.get("/get/all", isAuthenticated, requestController.allRequests);
router.post("/create", isAuthenticated, requestController.createRequest);
router.post("/direct/:id", isAuthenticated, requestController.createDirectRequest);
router.get("/get/:id", isAuthenticated, requestController.getRequest);
router.get("/user", isAuthenticated, requestController.getRequestByUser);
router.put("/set-winning-bid/:reqId", isAuthenticated, requestController.setWinningBid);
router.get("/get-winning-bid/:reqId", isAuthenticated, requestController.getWinningBid);

module.exports = router;
