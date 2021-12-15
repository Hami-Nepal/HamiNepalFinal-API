const KindDonation = require("../models/kindDonationModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIServices = require("./../utils/apiServices");
const multer = require("multer");
const sharp = require("sharp");
const factory = require("./handlerFactory");

//@desc Create new transparency
//GET api/v1/transparency
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

exports.uploadKindDonationPhotos = upload.array("photos", []);

exports.resizeKindDonationPhoto = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length == 0) return next();

  req.body.photos = [];
  await Promise.all(
    req.files.map(async (file) => {
      const filename = file.originalname.replace(/\..+$/, "");
      const newFilename = `kindDonation-${filename}-${Date.now()}.jpeg`;

      await sharp(file.buffer)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/kindDonation/${newFilename}`);

      req.body.photos.push(
        `${req.protocol}://${req.get("host")}/img/kindDonation/${newFilename}`
      );
    })
  );

  next();
});

exports.createKindDonation = catchAsync(async (req, res, next) => {
  newKDonation = await KindDonation.create(req.body);
  res.status(201).json({ status: "success", data: newKDonation });
});

//@desc Get all kinddonation data
//GET api/v1/kinddonation
//Public
exports.getAllKDonation = catchAsync(async (req, res, next) => {
  res.status(200).json(res.allqueryresults);
});

//@desc Get single kinddonation
//GET api/v1/kinddonation
//Public
exports.getKdonation = catchAsync(async (req, res, next) => {
  const Kdonation = await KindDonation.findById(req.params.id);

  if (!Kdonation) {
    return next(new AppError("No kinddonation found with that id", 404));
  }
  res.status(200).json({ status: "success", data: { Kdonation } });
});

//@desc Update kinddonation
//GET api/v1/kinddonation/:id
//Private
exports.updateKindness = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const kDonation = await KindDonation.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      runValidators: false,
      new: true,
    }
  );

  if (!kDonation) {
    return next(new AppError("No kinddonation found with that id", 404));
  }
  res.status(200).json({ status: "success", data: { kDonation } });
});

//@desc Delete kinddonation
//GET api/v1/kinddonation/:id
//Private
exports.deleteKindness = factory.deleteOne(KindDonation);
