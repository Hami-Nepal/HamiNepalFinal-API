const express = require("express");
const causeController = require("../controllers/causeController");
const authController = require("../controllers/authController");
const allqueryresults = require("../middleware/allqueryresults");
const Cause = require("../models/causeModel");

const router = express.Router();

router
  .route("/")
  .get(allqueryresults(Cause), causeController.getAllCauses)
  .post(
    authController.protect,
    authController.restrictToBoth("admin", "user"),
    causeController.uploadCausePhoto,
    causeController.resizeCausePhoto,
    causeController.createCause
  );

router
  .route("/:id")
  .get(causeController.getCause)
  .put(
    authController.protect,
    authController.restrictTo("admin"),
    causeController.uploadCausePhoto,
    causeController.resizeCausePhoto,
    causeController.updateCause
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    causeController.deleteCause
  );

router
  .route("/approval/:id")
  .put(
    authController.protect,
    authController.restrictTo("admin"),
    causeController.causeApproval
  );

router
  .route("/volunteers/:causeId")
  .post(authController.protect, causeController.volunteerParticipate);

router
  .route("/volunteers/:docId/update/:volunteerId")
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    causeController.updateVolunteerParticipation
  );

router
  .route("/volunteers/:causeId/delete/:volunteerId")
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    causeController.deleteVolunteer
  );

module.exports = router;
