const Volunteer = require("../models/volunteerModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIServices = require("./../utils/apiServices");
const multer = require("multer");
const sharp = require("sharp");
const factory = require("./handlerFactory");
const allqueryresults = require("../middleware/allqueryresults");
const jwt = require("jsonwebtoken");
const Token = require("../models/tokenModel.js");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
//@desc Create new Volunteer
//GET api/v1/volunteer
//Public
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

exports.uploadVolunteerPhoto = upload.single("photo");

exports.resizeVolunteerPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `volunteer-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/volunteer/${req.file.filename}`);

  req.body.photo = `${req.protocol}://${req.get("host")}/img/volunteer/${
    req.file.filename
  }`;

  next();
});

//@desc Create new Volunteer
//POST api/v1/volunteer
//Public
exports.createVolunteer = catchAsync(async (req, res, next) => {
  const {
    first_name,
    last_name,
    phone,
    email,
    photo,
    age,
    bloodGroup,
    field_of_expertise,
    motivation,
    country,
    state,
    city,
    street_address,
  } = req.body;

  const volunteerExists = await Volunteer.findOne({ email });
  // error occur
  if (volunteerExists) {
    return res.status(400).json({
      Status: false,
      reason: `${volunteerExists.email} is already registered`,
    });
  }

  const cVolunteer = await Volunteer.create(req.body);
  res.status(201).json({ status: "success", data: cVolunteer });
});

exports.verifyVolunteer = catchAsync(async (req, res, next) => {
  let volunteer = await Volunteer.findById(req.params.id);
  if (volunteer.isVerified == false) {
    req.body.isVerified = true;
  } else {
    req.body.isVerified = false;
  }
  updateVolunteer = await Volunteer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updateVolunteer) {
    return next(new AppError("No volunteer found with that ID", 404));
  }
  res.status(201).json({ status: "success", data: updateVolunteer });
});

//@desc Create new Volunteer
//GET api/v1/volunteer
//Public
exports.getAllVolunteers = catchAsync(async (req, res, next) => {
  res.status(200).json(res.allqueryresults);
});

//@desc Create new Volunteer
//GET api/v1/volunteer/:id
//Public
exports.getVolunteer = catchAsync(async (req, res, next) => {
  const volunteer = await Volunteer.findById(req.params.id);

  if (!volunteer) {
    return next(new AppError("No volunteer found with that id", 404));
  }
  res.status(200).json({ status: "success", data: { volunteer } });
});

//@desc delete new Volunteer
//DELETE api/v1/volunteer/:id
//Private
exports.deleteVolunteer = factory.deleteOne(Volunteer);

//@desc Create new Volunteer
//PATCH api/v1/volunteer/:id
//Private
exports.updateVolunteer = factory.updateOne(Volunteer);

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (volunteer, statusCode, req, res) => {
  const token = signToken(volunteer._id);

  // user.password = undefined;
  Token.create();
  res.status(statusCode).json({
    status: "success",
    token,
    id: volunteer._id,
    // data: user,AS
  });
};

exports.VolunteerLogin = catchAsync(async (req, res, next) => {
  const schema = Joi.object({
    password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    }),
  });

  const { error } = schema.validate({
    email: req.body.email,
    password: req.body.password,
  });

  if (error) {
    return next(new AppError(`${error.details[0].message}`, 403));
  }

  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  // 2) Check if user exists && password is correct
  const volunteer = await Volunteer.findOne({ email }).select("+password");

  if (!volunteer || !bcrypt.compareSync(password, volunteer.password)) {
    return next(new AppError("Invalid email or password", 401));
  }
  // if (!volunteer.isVerified) {
  //   return res.status(401).send({
  //     status: 'fail',
  //     message: 'Your Email has not been verified. Please contact admin',
  //   });
  // }

  // 3) If everything ok, send token to client
  if (volunteer.isVerified === false) {
    return next(new AppError("Account not verified", 403));
  }
  createSendToken(volunteer, 200, req, res);
});
