const express = require("express");
const router = express.Router();
const { createEvent, getEvents, rsvpEvent, getRSVPStatus, getMyEvents, getMyCreatedEvents, updateEvent, deleteEvent, getEventById } = require("../controllers/eventController");
const verifyToken = require("../middleware/authMiddleware");

router.post("/", verifyToken, createEvent); // Protected POST
router.get("/", verifyToken, getEvents);    // Protected GET
router.get("/my", verifyToken, getMyEvents);
router.get("/my-created", verifyToken, getMyCreatedEvents);
router.get("/:id/status", verifyToken, getRSVPStatus);
router.post("/:id/rsvp", verifyToken, rsvpEvent);
router.put("/:id", verifyToken, updateEvent);
router.delete("/:id", verifyToken, deleteEvent);
router.get("/:id", verifyToken, getEventById); // THIS MUST BE LAST

module.exports = router;
