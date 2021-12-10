const Cause = require("../models/causeModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIServices = require("./../utils/apiServices");
const multer = require("multer");
const sharp = require("sharp");
const factory = require("./handlerFactory");
const allqueryresults = require("../middleware/allqueryresults");

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

exports.uploadCausePhoto = upload.array("photos", []);

exports.resizeCausePhoto = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  req.body.photos = [];
  await Promise.all(
    req.files.map(async (file) => {
      const filename = file.originalname.replace(/\..+$/, "");
      const newFilename = `cause-${filename}-${Date.now()}.jpeg`;

      await sharp(file.buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/causes/${newFilename}`);

      req.body.photos.push(
        `${req.protocol}://${req.get("host")}/img/causes/${newFilename}`
      );
    })
  );

  next();
});

//@desc Create new cause along with the picture
//GET api/v1/causes
//Private
exports.createCause = catchAsync(async (req, res, next) => {
  newCause = await Cause.create(req.body);
  res.status(201).json({ status: "success", data: { newCause } });
});

//@desc Get all causes
//GET api/v1/causes
//Public
exports.getAllCauses = catchAsync(async (req, res, next) => {
  res.status(200).json(res.allqueryresults);
});

//@desc Get single cause
//GET api/v1/causes
//Public
exports.getCause = catchAsync(async (req, res, next) => {
  const cause = await Cause.findById(req.params.id);

  if (!cause) {
    return next(new AppError("No cause found with that id", 404));
  }
  res.status(200).json({ status: "success", data: { cause } });
});

//@desc Update the causes
//GET api/v1/causes/:id
//Private
exports.updateCause = catchAsync(async (req, res, next) => {
  const cause = await Cause.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: false,
    new: true,
  }).populate();

  if (!cause) {
    return next(new AppError("No cause found with that id", 404));
  }
  res.status(200).json({ status: "success", data: { cause } });
});

//@desc Update the causes
//GET api/v1/causes/:id
//Private
exports.deleteCause = factory.deleteOne(Cause);

exports.causeApproval = catchAsync(async (req, res, next) => {
  let cause = await Cause.findById(req.params.id);

  if (!cause) {
    return next(
      new ErrorResponse(`No cause with the id of ${req.params.id}`, 404)
    );
  }

  if (cause.approval === "Unapproved") {
    req.body.approval = "Approved";
  } else {
    return next(new ErrorResponse("This cause is already approved", 400));
  }

  res.status(200).json({
    success: true,
    data: { cause },
  });
});

exports.volunteerParticipate = catchAsync(async (req, res, next) => {
  const checkCause = await Cause.findById(req.params.causeId);

  const volunteerExists = checkCause.volunteers.find(
    (volunteer) => volunteer.volunteerId === req.body.volunteerId
  );

  if (volunteerExists)
    return res.status(400).json({
      status: "failed",
      message: "volunteer id exists in this cause.",
    });

  const cause = await Cause.findByIdAndUpdate(
    req.params.causeId,
    {
      $push: { volunteers: req.body },
    },
    { new: true }
  );

  res.status(200).json({ status: "ok", cause });
});
