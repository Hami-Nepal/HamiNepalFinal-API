const express = require("express");
const kindDonationController = require("../controllers/kindDonationController");
const authController = require("../controllers/authController");
const allqueryresults = require("../middleware/allqueryresults");
const KindDonation = require("../models/kindDonationModel");

const router = express.Router();

router
  .route("/")
  .get(allqueryresults(KindDonation), kindDonationController.getAllKDonation)
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    kindDonationController.uploadKindDonationPhotos,
    kindDonationController.resizeKindDonationPhoto,
    kindDonationController.createKindDonation
  );

router
  .route("/:id")
  .get(kindDonationController.getKdonation)
  .put(
    authController.protect,
    authController.restrictTo("admin"),
    kindDonationController.uploadKindDonationPhotos,
    kindDonationController.resizeKindDonationPhoto,
    kindDonationController.updateKindness
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    kindDonationController.deleteKindness
  );

module.exports = router;
