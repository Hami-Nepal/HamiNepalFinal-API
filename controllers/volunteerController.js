const Volunteer = require("../models/volunteerModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { promisify } = require("util");
const APIServices = require("./../utils/apiServices");
const multer = require("multer");
const sharp = require("sharp");
const factory = require("./handlerFactory");
const allqueryresults = require("../middleware/allqueryresults");
const jwt = require("jsonwebtoken");
const Token = require("../models/tokenModel.js");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/email");
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
  if (volunteer.isVerified === false) {
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
  res.status(200).json({ status: "success", data: updateVolunteer });
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
exports.updateVolunteer = (req, res, next) => {
  const id = req.volunteer._id.toString();

  if (req.params.id !== id)
    return next(
      new AppError(`You are not logged in to your volunteer profile`, 401)
    );

  factory.updateOne(Volunteer)(req, res, next);
};

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

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // else if (req.cookies.jwt) {
  //   token = req.cookies.jwt;
  // }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentVolunteer = await Volunteer.findById(decoded.id);
  if (!currentVolunteer) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  // if (currentUser.changedPasswordAfter(decoded.iat)) {
  //   return next(
  //     new AppError("User recently changed password! Please log in again.", 401)
  //   );
  // }

  // GRANT ACCESS TO PROTECTED ROUTE

  req.volunteer = currentVolunteer;

  // res.locals.user = currentUser;
  next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const volunteer = await Volunteer.findOne({ email: req.body.email });
  if (!volunteer) {
    return next(new AppError("There is no volunteer with email address.", 404));
  }

  // 2) Generate the random reset token
  const resetToken = volunteer.createPasswordResetToken();
  await volunteer.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Hello ${volunteer.first_name} ${volunteer.last_name}\n\n Forgot Your Password? Submit a Patch Request with your new password and PasswordConfirm to : ${resetURL} \n If you did not send this request , please ignore this message.\n\n Thank You!!\nTeam Hami Nepal`;

    await sendEmail({
      email: volunteer.email,
      subject: "Your password reset token valid for 10 minutes.",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to email!, Please check your email",
    });
  } catch (err) {
    volunteer.passwordResetToken = undefined;
    volunteer.passwordResetExpires = undefined;
    await volunteer.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const volunteer = await Volunteer.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!volunteer) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  volunteer.password = req.body.password;
  volunteer.passwordConfirm = req.body.passwordConfirm;
  volunteer.passwordResetToken = undefined;
  volunteer.passwordResetExpires = undefined;
  await volunteer.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(volunteer, 200, req, res);
});
