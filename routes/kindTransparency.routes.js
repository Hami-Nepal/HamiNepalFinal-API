const express = require("express");
const kindtransparencyController = require("../controllers/kindTransparencyController");
const authController = require("../controllers/authController");
const allqueryresults = require("../middleware/allqueryresults");
const KindTransparency = require("../models/kindTransparencyModel");

const router = express.Router();

router
  .route("/")
  .get(
    allqueryresults(KindTransparency),
    kindtransparencyController.getAllKindTransparency
  )
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    kindtransparencyController.uploadKindTransparencyPhoto,
    kindtransparencyController.resizeKindTransparencyPhoto,
    kindtransparencyController.createKindTransparency
  );

router
  .route("/:id")
  .get(kindtransparencyController.getKindTransparency)
  .put(
    authController.protect,
    authController.restrictTo("admin"),
    kindtransparencyController.uploadKindTransparencyPhoto,
    kindtransparencyController.resizeKindTransparencyPhoto,
    kindtransparencyController.updateKindTransparency
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    kindtransparencyController.deleteKindTransparency
  );

module.exports = router;
