const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    vehicleType: { type: String, required: true, trim: true },
    vehicleModel: { type: String, required: true, trim: true },
    service: { type: String, required: true, trim: true },
    bookingDate: { type: String, required: true },
    bookingTime: { type: String, required: true },
    message: { type: String, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Rejected", "Completed"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
