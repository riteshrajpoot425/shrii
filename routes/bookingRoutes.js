const express = require("express");
const Booking = require("../models/Booking");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      customerName, phone, email, vehicleType, vehicleModel,
      service, bookingDate, bookingTime, message
    } = req.body;

    if (!customerName || !phone || !vehicleType || !vehicleModel ||
        !service || !bookingDate || !bookingTime) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields"
      });
    }

    const booking = await Booking.create({
      customerName, phone, email, vehicleType, vehicleModel,
      service, bookingDate, bookingTime, message
    });

    res.status(201).json({
      success: true,
      message: "Booking submitted successfully",
      booking
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ success: false, message: "Unable to create booking" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Unable to fetch bookings" });
  }
});

router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["Pending", "Confirmed", "Rejected", "Completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid booking status" });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, message: `Booking marked as ${status}`, booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Unable to update booking" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Unable to delete booking" });
  }
});

module.exports = router;
