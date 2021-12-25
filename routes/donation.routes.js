const express = require("express");
const donationController = require("../controllers/donationController");
const authController = require("../controllers/authController");
const allqueryresults = require("../middleware/allqueryresults");
const Donation = require("../models/donationModel");

const router = express.Router();

router
  .route("/userdonations")
  .post(
    authController.protect,
    authController.restrictTo("user"),
    donationController.createDonation
  )
  .get(
    authController.protect,
    authController.restrictTo("user"),
    donationController.getMyDonation
  );

router
  .route("/")
  .get(
    allqueryresults(Donation, [
      {
        path: "event",
        select: "name type balance status",
      },
      {
        path: "cause",
        select: "name status balance",
      },
      {
        path: "kindness",
        select: "title",
      },
    ]),
    donationController.index
  )
  .post(donationController.store);
router.route("/:id").get(donationController.getDonation);
router.route("/:id").delete(donationController.deleteDonations);

module.exports = router;
