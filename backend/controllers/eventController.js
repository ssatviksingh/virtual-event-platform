const Event = require('../models/Event');

// Create Event
const createEvent = async (req, res) => {  // create event function
  try {
    const { title, date, speaker, description } = req.body;

    const event = await Event.create({ // create event
      title,
      date,
      speaker,
      description,
      creator: req.user.id,
    });

    res.status(201).json(event); // return event
  } catch (err) {
    res.status(500).json({ message: "Event creation failed" }); // return error message
  }
};


// Get All Events
const getEvents = async (req, res) => {  // get all events function
  try {
    const events = await Event.find()
      .sort({ date: 1 })
      .populate("creator", "_id")
      .lean();                      // ⬅ returns plain JS objects

    // attach count without sending large joinedUsers array
    const withCounts = events.map((ev) => ({ // attach count without sending large joinedUsers array
      ...ev,
      joinedCount: ev.joinedUsers.length,
    }));

    res.json(withCounts); // return events with counts  
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events" }); // return error message
  }
};

// Get Event By ID
const getEventById = async (req, res) => {  // get event by id function
  console.log("HIT getEventById", req.params.id);
  try {
    const event = await Event.findById(req.params.id).populate("creator", "_id").lean(); // get event by id
    if (!event) return res.status(404).json({ message: "Event not found" });
    event.joinedCount = event.joinedUsers.length;
    res.json(event); // return event  
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch event" }); // return error message
  }
};

// Get My Events
const getMyEvents = async (req, res) => {  // get my events function
  try {
    const myEvents = await Event.find({ joinedUsers: req.user.id })
      .sort({ date: 1 })
      .lean();

    const withCounts = myEvents.map((ev) => ({ // attach count without sending large joinedUsers array
      ...ev,
      joinedCount: ev.joinedUsers.length,
    }));

    res.json(withCounts); // return events with counts  
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch my events" }); // return error message
  }
};

// Get Events Created By User
const getMyCreatedEvents = async (req, res) => {  // get my created events function
  console.log("HIT getMyCreatedEvents", req.user);
  try {
    if (!req.user || !req.user.id) {
      console.error("No user or user.id in request!");
      return res.status(401).json({ message: "Unauthorized: No user info" });
    }
    const myCreatedEvents = await Event.find({ creator: req.user.id }) // get my created events
      .sort({ date: 1 })
      .lean();
    console.log("Found events:", myCreatedEvents.length); // log number of events
    res.json(myCreatedEvents);
  } catch (err) {
    console.error("Error in getMyCreatedEvents:", err); // log error
    res.status(500).json({ message: "Failed to fetch created events", error: err.message });
  }
};

// Get RSVP Status
const getRSVPStatus = async (req, res) => {  // get rsvp status function
  const userId = req.user.id;
  const eventId = req.params.id;

  try {
    const event = await Event.findById(eventId); // get event by id
    if (!event) return res.status(404).json({ joined: false, message: "Event not found" });

    const joined = event.joinedUsers.includes(userId);
    res.json({ joined }); // return rsvp status 
  } catch (err) {
    res.status(500).json({ joined: false, message: "Error checking RSVP", error: err.message });
  }
};

//RSVP events
const rsvpEvent = async (req, res) => {  // rsvp event function
  const eventId = req.params.id;
  const userId = req.user.id;

  try {
    const event = await Event.findById(eventId); // get event by id
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Check if already joined
    if (event.joinedUsers.includes(userId)) {
      return res.status(200).json({ message: "Already joined this event" });
    }

    event.joinedUsers.push(userId);
    await event.save();

    res.json({ message: "RSVP successful", event }); // return rsvp successful message and event
  } catch (err) {
    res.status(500).json({ message: "Failed to RSVP", error: err.message });
  }
};

const updateEvent = async (req, res) => {  // update event function
  try {
    const event = await Event.findById(req.params.id); // get event by id
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.creator.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    const { title, date, speaker, description } = req.body;
    event.title = title;
    event.date = date;
    event.speaker = speaker;
    event.description = description;
    await event.save(); // save event

    res.json({ message: "Event updated", event });
  } catch (err) {
    res.status(500).json({ message: "Update failed" }); // return error message
  }
};

const deleteEvent = async (req, res) => {  // delete event function
  try {
    const event = await Event.findById(req.params.id); // get event by id
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.creator.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    await event.deleteOne(); // delete event
    res.json({ message: "Event deleted" }); // return event deleted message
  } catch (err) {
    res.status(500).json({ message: "Delete failed" }); // return error message
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

