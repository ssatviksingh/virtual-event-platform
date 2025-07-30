require("dotenv").config();
const mongoose = require("mongoose");
const Event = require("../models/Event");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    const result = await Event.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} event(s)`);
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
