const Cause = require("../models/causeModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
const multer = require("multer");
const sharp = require("sharp");
const BoardMember = require("../models/boardMemberModel");
const path = require("path");
const fs = require("fs");

//@desc Upload the picture of the cause
//POST api/v1/causes/
//Private
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadBoardMemberPhoto = upload.single("photo");

exports.resizeBoardMemberPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `boardmember-${Date.now()}.jpeg`;

  var dir = "public/img/boardmember";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, 0744);
  }

  await sharp(req.file.buffer)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/boardmember/${req.file.filename}`);
  req.body.photo = `${req.protocol}://${req.get("host")}/img/boardmember/${
    req.file.filename
  }`;

  next();
});

//@desc Create new board Members
//POST api/v1/boardmembers
//Private
exports.createBoardMembers = catchAsync(async (req, res, next) => {
  members = await BoardMember.create(req.body);
  res.status(201).json({ status: "success", data: { members } });
});

//@desc Get all board members
//GET api/v1/boardmembers
//Public
exports.getAllBoardMembers = catchAsync(async (req, res, next) => {
  res.status(200).json(res.allqueryresults);
});

//@desc Get single board member
//GET api/v1/boardmembers/:id
//Public
exports.getSingleBoardMember = catchAsync(async (req, res, next) => {
  const members = await BoardMember.findById(req.params.id);

  if (!members) {
    return next(new AppError("No members found with that id", 404));
  }
  res.status(200).json({ status: "success", data: { members } });
});

//@desc Update the board member
//GET api/v1/boardmembers/:id
//Private
exports.updateBoardMember = catchAsync(async (req, res, next) => {
  const members = await BoardMember.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: false,
    new: true,
  }).populate();

  if (!members) {
    return next(new AppError("No members found with that id", 404));
  }
  res.status(200).json({ status: "success", data: { members } });
});

//@desc Delete the board member
//GET api/v1/boardmembers/:id
//Private
exports.deleteBoardMember = factory.deleteOne(BoardMember);
