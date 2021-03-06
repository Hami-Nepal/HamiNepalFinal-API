const express = require("express");

const event_typeController = require("./../controllers/event_typeController");
const authController = require("./../controllers/authController");
const router = express.Router();
const Event_type = require("../models/event_typeModel");
const allqueryresults = require("../middleware/allqueryresults");

router
  .route("/")
  .get(allqueryresults(Event_type), event_typeController.getAllEvent_type)
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    event_typeController.createEvent_type
  );

router
  .route("/:id")

  .put(
    authController.protect,
    authController.restrictTo("admin"),
    event_typeController.updateEvent_type
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    event_typeController.deleteEvent_type
  )
  .get(event_typeController.getSingleEvent_type);

module.exports = router;
