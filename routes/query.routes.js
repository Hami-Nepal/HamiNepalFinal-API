const express = require("express");
const queryController = require("../controllers/queryController");
const authController = require("../controllers/authController");

const router = express.Router();

router.route("/causes/totalDonations").get(
  // authController.protect,
  // authController.restrictTo("admin"),
  queryController.causeDonationAmount
);
router.route("/events/totalDonations").get(queryController.eventDonationAmount);

// router
//   .route("/causes/totalDonations")
//   .get(
//     authController.protect,
//     authController.restrictTo("admin"),
//     queryController.eventDonationAmount
//   );
router.route("/events/topdonar").get(queryController.topEventDonar);

router.route("/causes/topdonar").get(queryController.topCauseDonar);

router
  .route("/allevents/totaldonation")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    queryController.allEventDonationAmount
  );

router.route("/totalDonations").get(queryController.totalDonation);
router.route("/totalkindDonations").get(queryController.totalKindDonation);
router.route("/totalExpenses").get(queryController.totalExpenses);
router.route("/totalkindExpenses").get(queryController.totalKindExpenses);

router.route("/average/rating").get(queryController.getAverageRating);

router.route("/volunteers/state").get(queryController.stateVolunteer);

router.route("/volunteers/city").get(queryController.cityVolunteer);

router
  .route("/eventlocation/volunteers/:id")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    queryController.eventVolunteerLocation
  );

router
  .route("/events/volunteers")

  .get(queryController.eventVolunteer);

router
  .route("/user/mydonation")
  .get(
    authController.protect,
    authController.restrictTo("user"),
    queryController.userMyDonation
  );

module.exports = router;
