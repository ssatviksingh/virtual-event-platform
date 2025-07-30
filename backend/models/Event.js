const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  speaker: { type: String, required: true },
  description: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  joinedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  tags: { type: [String], default: [] },
});

module.exports = mongoose.model("Event", EventSchema);
