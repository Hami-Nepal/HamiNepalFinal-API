const express = require("express");
const kindnessController = require("../controllers/kindessController");
const authController = require("../controllers/authController");
const allqueryresults = require("../middleware/allqueryresults");
const ActOfKindness = require("../models/kindnessModel");

const router = express.Router();

router.route("/featured").get(kindnessController.getFeatured);
router
  .route("/")
  .get(
    allqueryresults(ActOfKindness, {
      path: "volunteer",
      select: "first_name last_name field_of_expertise",
    }),
    kindnessController.getAllKindness
  )
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    kindnessController.uploadKindnessPhoto,
    kindnessController.resizeKindnessPhoto,
    kindnessController.createKindness
  );

router
  .route("/:id")
  .get(kindnessController.getKindness)
  .put(
    authController.protect,
    authController.restrictTo("admin"),
    kindnessController.uploadKindnessPhoto,
    kindnessController.resizeKindnessPhoto,
    kindnessController.updateKindness
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    kindnessController.deleteKindness
  );

module.exports = router;
