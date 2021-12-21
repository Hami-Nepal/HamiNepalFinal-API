const ActOfKindness = require("../models/kindnessModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIServices = require("./../utils/apiServices");
const multer = require("multer");
const sharp = require("sharp");
const factory = require("./handlerFactory");
const allqueryresults = require("../middleware/allqueryresults");
const Volunteer = require("../models/volunteerModel");

//@desc Create new kindness
//POST api/v1/kindness
const multerStorage = multer.memoryStorage();

const multerFilter = (req, files, cb) => {
  if (files.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadKindnessPhoto = upload.array("photos", []);

exports.resizeKindnessPhoto = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length == 0) return next();

  req.body.photos = [];
  await Promise.all(
    req.files.map(async (file) => {
      const filename = file.originalname.replace(/\..+$/, "");
      const newFilename = `kindness-${filename}-${Date.now()}.jpeg`;

      await sharp(file.buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/kindness/${newFilename}`);

      req.body.photos.push(
        `${req.protocol}://${req.get("host")}/img/kindness/${newFilename}`
      );
    })
  );

  next();
});

exports.createKindness = catchAsync(async (req, res, next) => {
  newKindness = await ActOfKindness.create(req.body);
  res.status(201).json({ status: "success", data: newKindness });
});

//@desc Get all kindness
//GET api/v1/kindness
//Public

exports.getAllKindness = catchAsync(async (req, res, next) => {
  res.status(200).json(res.allqueryresults);
});

//@desc Get single kindness
//GET api/v1/events/:id
//Private
exports.getKindness = catchAsync(async (req, res, next) => {
  const kindness = await ActOfKindness.findById(req.params.id);

  if (!kindness) {
    return next(new AppError("No act of kindness found with that id", 404));
  }
  res.status(200).json({ status: "success", data: kindness });
});

//@desc Update the kindess
//PATCH api/v1/events/:id
//Private
exports.updateKindness = factory.updateOne(ActOfKindness);

//@desc Update the event
//PATCH api/v1/events/:id
//Private
exports.deleteKindness = factory.deleteOne(ActOfKindness);

exports.getFeatured = async (req, res, next) => {
  const featured = await ActOfKindness.find({ featured: true }).sort(
    "featured_ranking"
  );

  res.status(200).json({ status: "ok", featured });
};

exports.volunteerParticipate = catchAsync(async (req, res, next) => {
  const checkKindness = await ActOfKindness.findById(req.params.kindnessId);

  const volunteerExists = checkKindness.volunteers.find(
    (volunteer) => volunteer.volunteerId === req.body.volunteerId
  );

  if (volunteerExists)
    return res.status(400).json({
      status: "failed",
      message: "volunteer id exists in this act of kindness.",
    });

  const kindness = await ActOfKindness.findByIdAndUpdate(
    req.params.kindnessId,
    {
      $push: { volunteers: req.body },
    },
    { new: true }
  );

  res.status(200).json({ status: "ok", kindness });
});

exports.updateVolunteerParticipation = catchAsync(async (req, res, next) => {
  const kindness = await ActOfKindness.findOneAndUpdate(
    { "volunteers._id": req.params.docId },
    { $set: { "volunteers.$.participated": req.body.participated } },
    { new: true }
  );

  const switchMethod = req.body.participated ? "$push" : "$pull";

  const volunteer = await Volunteer.findByIdAndUpdate(req.params.volunteerId, {
    [switchMethod]: { kindness_involvement: kindness._id },
  });

  res.status(200).json({ status: "ok", kindness });
});

exports.deleteVolunteer = catchAsync(async (req, res, next) => {
  const kindness = await ActOfKindness.findByIdAndUpdate(
    req.params.kindnessId,
    {
      $pull: { volunteers: { volunteerId: req.params.volunteerId } },
    },
    { new: true }
  );

  const volunteer = await Volunteer.findByIdAndUpdate(
    req.params.volunteerId,
    {
      $pull: { kindness_involvement: kindness._id },
    },
    { new: true }
  );

  res.status(200).json({ status: "ok", kindness });
});
