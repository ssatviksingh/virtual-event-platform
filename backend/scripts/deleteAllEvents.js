require("dotenv").config();
const mongoose = require("mongoose");
const Event = require("../models/Event");

mongoose
  .connect(process.env.MONGO_URI) // connect to mongodb using MONGO_URI from .env
  .then(async () => {
    const result = await Event.deleteMany({}); // delete all events
    console.log(`✅ Deleted ${result.deletedCount} event(s)`); // log number of events deleted
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
