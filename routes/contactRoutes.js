const express = require("express");
const Contact = require("../models/Contact");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required"
      });
    }

    const contact = await Contact.create({ name, email, phone, message });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      contact
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Unable to send message" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to fetch messages" });
  }
});

router.patch("/:id/read", authMiddleware, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    res.json({ success: true, contact });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to update message" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    res.json({ success: true, message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to delete message" });
  }
});

module.exports = router;
