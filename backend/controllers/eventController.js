const Event = require('../models/Event');

// Create Event
const createEvent = async (req, res) => {
  try {
    const { title, date, speaker, description } = req.body;

    const event = await Event.create({
      title,
      date,
      speaker,
      description,
      creator: req.user.id,
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: "Event creation failed" });
  }
};


// Get All Events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ date: 1 })
      .populate("creator", "_id")
      .lean();                      // ⬅ returns plain JS objects

    // attach count without sending large joinedUsers array
    const withCounts = events.map((ev) => ({
      ...ev,
      joinedCount: ev.joinedUsers.length,
    }));

    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

// Get Event By ID
const getEventById = async (req, res) => {
  console.log("HIT getEventById", req.params.id);
  try {
    const event = await Event.findById(req.params.id).populate("creator", "_id").lean();
    if (!event) return res.status(404).json({ message: "Event not found" });
    event.joinedCount = event.joinedUsers.length;
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch event" });
  }
};

// Get My Events
const getMyEvents = async (req, res) => {
  try {
    const myEvents = await Event.find({ joinedUsers: req.user.id })
      .sort({ date: 1 })
      .lean();

    const withCounts = myEvents.map((ev) => ({
      ...ev,
      joinedCount: ev.joinedUsers.length,
    }));

    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch my events" });
  }
};

// Get Events Created By User
const getMyCreatedEvents = async (req, res) => {
  console.log("HIT getMyCreatedEvents", req.user);
  try {
    if (!req.user || !req.user.id) {
      console.error("No user or user.id in request!");
      return res.status(401).json({ message: "Unauthorized: No user info" });
    }
    const myCreatedEvents = await Event.find({ creator: req.user.id })
      .sort({ date: 1 })
      .lean();
    console.log("Found events:", myCreatedEvents.length);
    res.json(myCreatedEvents);
  } catch (err) {
    console.error("Error in getMyCreatedEvents:", err);
    res.status(500).json({ message: "Failed to fetch created events", error: err.message });
  }
};

// Get RSVP Status
const getRSVPStatus = async (req, res) => {
  const userId = req.user.id;
  const eventId = req.params.id;

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ joined: false, message: "Event not found" });

    const joined = event.joinedUsers.includes(userId);
    res.json({ joined });
  } catch (err) {
    res.status(500).json({ joined: false, message: "Error checking RSVP", error: err.message });
  }
};

//RSVP events
const rsvpEvent = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Check if already joined
    if (event.joinedUsers.includes(userId)) {
      return res.status(200).json({ message: "Already joined this event" });
    }

    event.joinedUsers.push(userId);
    await event.save();

    res.json({ message: "RSVP successful", event });
  } catch (err) {
    res.status(500).json({ message: "Failed to RSVP", error: err.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.creator.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    const { title, date, speaker, description } = req.body;
    event.title = title;
    event.date = date;
    event.speaker = speaker;
    event.description = description;
    await event.save();

    res.json({ message: "Event updated", event });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.creator.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    await event.deleteOne();
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

module.exports = {
  createEvent,
  getEvents,
  rsvpEvent,
  getRSVPStatus,
  getMyEvents,
  getMyCreatedEvents,
  updateEvent,
  deleteEvent,
  getEventById,
};

