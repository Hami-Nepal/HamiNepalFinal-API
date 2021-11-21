const express = require("express");
const volunteerController = require("../controllers/volunteerController");
const authController = require("./../controllers/authController");
const Volunteer = require("../models/volunteerModel");
const allqueryresults = require("../middleware/allqueryresults");

const router = express.Router();

router
  .route("/")
  .get(allqueryresults(Volunteer), volunteerController.getAllVolunteers)
  .post(
    volunteerController.uploadVolunteerPhoto,
    volunteerController.resizeVolunteerPhoto,
    volunteerController.createVolunteer
  );

router
  .route("/:id")
  .get(volunteerController.getVolunteer)
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    volunteerController.deleteVolunteer
  )
  .put(
    volunteerController.uploadVolunteerPhoto,
    volunteerController.resizeVolunteerPhoto,
    volunteerController.updateVolunteer
  );

module.exports = router;
