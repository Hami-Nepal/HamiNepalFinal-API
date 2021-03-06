const Event_type = require("../models/event_typeModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
const APIServices = require("../utils/apiServices");
const allqueryresults = require("../middleware/allqueryresults");

exports.createEvent_type = catchAsync(async (req, res, next) => {
  newEvent_type = await Event_type.create(req.body);
  res.status(201).json({ status: "success", data: { newEvent_type } });
});

exports.getAllEvent_type = catchAsync(async (req, res, next) => {
  res.status(200).json(res.allqueryresults);
});

exports.getSingleEvent_type = catchAsync(async (req, res, next) => {
  const event_type = await Event_type.findById(req.params.id);

  if (!event_type) {
    return next(new AppError("No event_type found with that id", 404));
  }
  res.status(200).json({ status: "success", data: { event_type } });
});

exports.updateEvent_type = factory.updateOne(Event_type);

exports.deleteEvent_type = factory.deleteOne(Event_type);
