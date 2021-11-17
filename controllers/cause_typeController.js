const Cause_type = require("../models/cause_typeModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
const APIServices = require("../utils/apiServices");

exports.createCause_type = catchAsync(async (req, res, next) => {
  newCause_type = await Cause_type.create(req.body);
  res.status(201).json({ status: "success", data: { newCause_type } });
});

exports.getAllCause_type = catchAsync(async (req, res, next) => {
  const cause_type = new APIServices(Cause_type.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const Cause_type_var = await cause_type.query;

  return res.status(200).json({
    status: "success",
    results: Cause_type_var.length,
    data: { Cause_type_var },
  });
});

exports.getCause_type = catchAsync(async (req, res, next) => {
  const cause_type = await Cause_type.findById(req.params.id);

  if (!cause_type) {
    return next(new AppError("No cause_type found with that id", 404));
  }
  res.status(200).json({ status: "success", data: { cause_type } });
});

exports.updateCause_type = factory.updateOne(Cause_type);

exports.deleteCause_type = factory.deleteOne(Cause_type);
