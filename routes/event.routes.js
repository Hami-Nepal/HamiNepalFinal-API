const express = require("express");
const eventController = require("../controllers/eventController");
const authController = require("../controllers/authController");
const allqueryresults = require("../middleware/allqueryresults");
const Event = require("../models/eventModel");

const router = express.Router();

router
  .route("/")
  .get(allqueryresults(Event), eventController.getAllEvents)
  .post(
    authController.protect,
    // authController.restrictTo("admin"),
    eventController.uploadEventPhoto,
    eventController.resizeEventPhoto,
    eventController.createEvent
  );

router
  .route("/:id")
  .get(eventController.getEvent)
  .put(
    authController.protect,
    authController.restrictTo("admin"),
    eventController.uploadEventPhoto,
    eventController.resizeEventPhoto,
    eventController.updateEvent
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    eventController.deleteEvent
  );

router
  .route("/verify/:id")
  .put(
    authController.protect,
    authController.restrictTo("admin"),
    eventController.verifyEvent
  );

router
  .route("/volunteers/:eventId")
  .post(authController.protect, eventController.volunteerParticipate);

module.exports = router;
