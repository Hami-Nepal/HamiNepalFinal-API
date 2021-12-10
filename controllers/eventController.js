const Event = require("../models/eventModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIServices = require("./../utils/apiServices");
const multer = require("multer");
const sharp = require("sharp");
const factory = require("./handlerFactory");
const allqueryresults = require("../middleware/allqueryresults");
const Volunteer = require("../models/volunteerModel");

//@desc Create new event
//POST api/v1/events
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

exports.uploadEventPhoto = upload.array("photos", []);

exports.resizeEventPhoto = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  req.body.photos = [];
  await Promise.all(
    req.files.map(async (file) => {
      const filename = file.originalname.replace(/\..+$/, "");
      const newFilename = `event-${filename}-${Date.now()}.jpeg`;

      await sharp(file.buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/events/${newFilename}`);

      req.body.photos.push(
        `${req.protocol}://${req.get("host")}/img/events/${newFilename}`
      );
    })
  );

  next();
});

exports.createEvent = catchAsync(async (req, res, next) => {
  newEvent = await Event.create(req.body);
  res.status(201).json({ status: "success", data: newEvent });
});

//@desc Get all events
//GET api/v1/events
//Public
exports.getAllEvents = catchAsync(async (req, res, next) => {
  res.status(200).json(res.allqueryresults);
});

//@desc Get single events
//GET api/v1/events/:id
//Private
exports.getEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError("No event found with that id", 404));
  }
  res.status(200).json({ status: "success", data: event });
});

exports.verifyEvent = catchAsync(async (req, res, next) => {
  let event = await Event.findById(req.params.id);
  if (event.isVerified == false) {
    req.body.isVerified = true;
  } else {
    req.body.isVerified = false;
  }
  updateEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updateEvent) {
    return next(new AppError("No Event found with that ID", 404));
  }
  res.status(201).json({ status: "success", data: updateEvent });
});

//@desc Update the event
//PATCH api/v1/events/:id
//Private
exports.updateEvent = factory.updateOne(Event);

//@desc Update the event
//PATCH api/v1/events/:id
//Private
exports.deleteEvent = factory.deleteOne(Event);

exports.volunteerParticipate = catchAsync(async (req, res, next) => {
  const checkEvent = await Event.findById(req.params.eventId);

  const volunteerExists = checkEvent.volunteers.find(
    (volunteer) => volunteer.volunteerId === req.body.volunteerId
  );

  if (volunteerExists)
    return res.status(400).json({
      status: "failed",
      message: "volunteer id exists in this event.",
    });

  const event = await Event.findByIdAndUpdate(
    req.params.eventId,
    {
      $push: { volunteers: req.body },
    },
    { new: true }
  );

  res.status(200).json({ status: "ok", event });
});

exports.updateVolunteerParticipation = catchAsync(async (req, res, next) => {
  const event = await Event.findOneAndUpdate(
    { "volunteers._id": req.params.docId },
    { $set: { "volunteers.$.participated": req.body.participated } },
    { new: true }
  );

  const switchMethod = req.body.participated ? "$push" : "$pull";

  const volunteer = await Volunteer.findByIdAndUpdate(req.params.volunteerId, {
    [switchMethod]: { event_involvement: event._id },
  });

  res.status(200).json({ status: "ok", event });
});

exports.deleteVolunteer = catchAsync(async (req, res, next) => {
  const event = await Event.findByIdAndUpdate(
    req.params.eventId,
    {
      $pull: { volunteers: { volunteerId: req.params.volunteerId } },
    },
    { new: true }
  );

  res.status(200).json({ status: "ok", event });
});
