const express = require("express");
const boardMembersController = require("../controllers/boardMemberController");
const authController = require("../controllers/authController");
const BoardMember = require("../models/boardMemberModel");
const allqueryresults = require("../middleware/allqueryresults");

const router = express.Router();

router
  .route("/")
  .get(allqueryresults(BoardMember), boardMembersController.getAllBoardMembers)
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    boardMembersController.uploadBoardMemberPhoto,
    boardMembersController.resizeBoardMemberPhoto,
    boardMembersController.createBoardMembers
  );

router
  .route("/:id")
  .get(boardMembersController.getSingleBoardMember)
  .put(
    authController.protect,
    authController.restrictTo("admin"),
    boardMembersController.uploadBoardMemberPhoto,
    boardMembersController.resizeBoardMemberPhoto,
    boardMembersController.updateBoardMember
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    boardMembersController.deleteBoardMember
  );

module.exports = router;
