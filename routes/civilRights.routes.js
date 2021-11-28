const express = require("express");
const civilRightController = require("../controllers/civilRightsController");
const authController = require("../controllers/authController");
const allqueryresults = require("../middleware/allqueryresults");
const CivilRights = require("../models/civilRightsModel");

const router = express.Router();

router
  .route("/")
  .get(allqueryresults(CivilRights), civilRightController.getAllCivilRight)
  .post(
    authController.protect,
    authController.restrictToBoth("admin"),
    civilRightController.uploadCivilRightPhoto,
    civilRightController.resizeCivilRightPhoto,
    civilRightController.createCivilRight
  );

router
  .route("/:id")
  .get(civilRightController.getCivilRight)
  .put(
    authController.protect,
    authController.restrictTo("admin"),
    civilRightController.uploadCivilRightPhoto,
    civilRightController.resizeCivilRightPhoto,
    civilRightController.updateCivilRight
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    civilRightController.deleteCivilRight
  );

module.exports = router;
