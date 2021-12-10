const KindTransparency = require("../models/kindTransparencyModel");
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

exports.uploadKindTransparencyPhoto = upload.array("photos", []);

exports.resizeKindTransparencyPhoto = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  req.body.photos = [];
  await Promise.all(
    req.files.map(async (file) => {
      const filename = file.originalname.replace(/\..+$/, "");
      const newFilename = `kindtransparency-${filename}-${Date.now()}.jpeg`;

      await sharp(file.buffer)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/kindtransparency/${newFilename}`);

      req.body.photos.push(
        `${req.protocol}://${req.get(
          "host"
        )}/img/kindtransparency/${newFilename}`
      );
    })
  );

  next();
});

exports.createKindTransparency = catchAsync(async (req, res, next) => {
  newKindTransparency = await KindTransparency.create(req.body);
  res.status(201).json({ status: "success", data: newKindTransparency });
});

//@desc Get all transparency data
//GET api/v1/transparency
//Public
exports.getAllKindTransparency = catchAsync(async (req, res, next) => {
  res.status(200).json(res.allqueryresults);
});

//@desc Get single transparency
//GET api/v1/transparency
//Public
exports.getKindTransparency = catchAsync(async (req, res, next) => {
  const kindtransparency = await KindTransparency.findById(req.params.id);

  if (!kindtransparency) {
    return next(new AppError("No kind transparency found with that id", 404));
  }
  res.status(200).json({ status: "success", data: { kindtransparency } });
});

//@desc Update transparency
//GET api/v1/transparency
//Private
exports.updateKindTransparency = catchAsync(async (req, res, next) => {
  const kindtransparency = await KindTransparency.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      runValidators: false,
      new: true,
    }
  );

  if (!kindtransparency) {
    return next(new AppError("No kind transparency found with that id", 404));
  }
  res.status(200).json({ status: "success", data: { kindtransparency } });
});

//@desc Delete transparency
//GET api/v1/transparency/::id
//Private
exports.deleteKindTransparency = factory.deleteOne(KindTransparency);
