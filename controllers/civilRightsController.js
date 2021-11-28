const CivilRights = require("../models/civilRightsModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const multer = require("multer");
const sharp = require("sharp");
const factory = require("./handlerFactory");

//@desc Upload the picture of the civil rights movement
//POST api/v1/civilrights/
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

exports.uploadCivilRightPhoto = upload.array("photos", []);

exports.resizeCivilRightPhoto = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  req.body.photos = [];
  await Promise.all(
    req.files.map(async (file) => {
      const filename = file.originalname.replace(/\..+$/, "");
      const newFilename = `civilrights-${filename}-${Date.now()}.jpeg`;

      await sharp(file.buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/civilrights/${newFilename}`);

      req.body.photos.push(
        `${req.protocol}://${req.get("host")}/img/civilrights/${newFilename}`
      );
    })
  );

  next();
});

//@desc Create new civil right movement with the image
//GET api/v1/civilrights
//Private
exports.createCivilRight = catchAsync(async (req, res, next) => {
  const civilRights = await CivilRights.create(req.body);
  res.status(201).json({ status: "success", data: { civilRights } });
});

//@desc Get all Civil Right
//GET api/v1/civilrights
//Public
exports.getAllCivilRight = catchAsync(async (req, res, next) => {
  res.status(200).json(res.allqueryresults);
});

//@desc Get single Civil Right
//GET api/v1/civilrights
//Public
exports.getCivilRight = catchAsync(async (req, res, next) => {
  const civilRights = await CivilRights.findById(req.params.id);

  if (!civilRights) {
    return next(
      new AppError("No civil right data was found with that id", 404)
    );
  }
  res.status(200).json({ status: "success", data: { civilRights } });
});

//@desc Update the Civil Right
//GET api/v1/civilrights/:id
//Private
exports.updateCivilRight = catchAsync(async (req, res, next) => {
  let civilRights = await CivilRights.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      runValidators: false,
      new: true,
    }
  );

  if (!civilRights) {
    return next(
      new AppError("No civil right data was found with that id", 404)
    );
  }

  res.status(200).json({ status: "success", data: { civilRights } });
});

//@desc Delete the Civil Right
//DELETE api/v1/civilrights/:id
//Private
exports.deleteCivilRight = factory.deleteOne(CivilRights);
