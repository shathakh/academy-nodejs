const { serverErrs } = require("../middlewares/customError");
const { Teacher, Session } = require("../models");
const Rate = require("../models/Rates");

const rateTeacher = async (req, res) => {
  const { StudentId, TeacherId, rating, comment } = req.body;

  const teacher = await Teacher.findOne({
    where: {
      id: TeacherId,
    },
  });

  const session = await Session.findOne({
    where: {
      TeacherId,
      StudentId,
    },
  });

  if (!session)
    throw serverErrs.BAD_REQUEST("You don't have any session with the teacher");

  const rateData = await Rate.findOne({
    where: {
      TeacherId,
      StudentId,
    },
  });

  if (rateData) throw serverErrs.BAD_REQUEST("You already Rated the teacher ");

  const rate = await Rate.create({
    StudentId,
    TeacherId,
    rating,
    comment,
  });

  const rates = await Rate.findAll({
    where: {
      TeacherId,
    },
  });
  const teacherRates = 0;
  rates.forEach((ele) => {
    teacherRates += +ele.rating;
  });

  teacher.rate = teacherRates / rates.length;
  await teacher.save();

  res.send({
    status: 201,
    data: rate,
    msg: "successful rate teacher",
  });
};

const getTeacherRate = async (req, res) => {
  const { TeacherId } = req.body;
  const rates = await Rate.findAll({
    where: {
      TeacherId,
    },
  });

  res.send({
    status: 201,
    data: rates,
    msg: "successful get teacher rate",
  });
};

module.exports = { rateTeacher, getTeacherRate };
