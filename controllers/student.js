const { Teacher, Student, Parent, LangTeachStd } = require("../models");
const { validateStudent, loginValidation } = require("../validation");
const { serverErrs } = require("../middlewares/customError");
const generateRandomCode = require("../middlewares/generateCode");
const sendEmail = require("../middlewares/sendEmail");
const { compare, hash } = require("bcrypt");
const generateToken = require("../middlewares/generateToken");
const path = require("path");
const fs = require("fs");

const signUp = async (req, res) => {
  const { email, name, location } = req.body;
  await validateStudent.validate({ email, name, location });

  const teacher = await Teacher.findOne({
    where: {
      email,
      isRegistered: true,
    },
  });

  const student = await Student.findOne({
    where: {
      email,
      isRegistered: true,
    },
  });

  const parent = await Parent.findOne({
    where: {
      email,
    },
  });

  if (teacher) throw serverErrs.BAD_REQUEST("email is already used");
  if (student) throw serverErrs.BAD_REQUEST("email is already used");
  if (parent) throw serverErrs.BAD_REQUEST("email is already used");

  const code = generateRandomCode();
  const newStudent = await Student.create({
    email,
    name,
    location,
    registerCode: code,
  });
  await newStudent.save();

  sendEmail(email, code);
  res.send({ status: 201, msg: "successful send email" });
};

const verifyCode = async (req, res) => {
  const { registerCode, email } = req.body;

  const teacher = await Teacher.findOne({
    where: {
      email,
    },
  });

  const student = await Student.findOne({
    where: {
      email,
    },
  });

  const parent = await Parent.findOne({
    where: {
      email,
    },
  });

  if (!student) throw serverErrs.BAD_REQUEST("email not found");
  if (student.isRegistered)
    throw serverErrs.BAD_REQUEST("email is already used");
  if (teacher) throw serverErrs.BAD_REQUEST("email is already used");
  if (parent) throw serverErrs.BAD_REQUEST("email is already used");
  if (student.registerCode != registerCode) {
    throw serverErrs.BAD_REQUEST("code is wrong");
  }

  res.send({ status: 201, data: student, msg: "Verified code successfully" });
};

const signPassword = async (req, res) => {
  const { email, password } = req.body;

  const teacher = await Teacher.findOne({
    where: {
      email,
    },
  });

  const student = await Student.findOne({
    where: {
      email,
    },
  });

  const parent = await Parent.findOne({
    where: {
      email,
    },
  });

  if (!student) throw serverErrs.BAD_REQUEST("email not found");
  if (student.isRegister) throw serverErrs.BAD_REQUEST("email is already used");
  if (teacher) throw serverErrs.BAD_REQUEST("email is already used");
  if (parent) throw serverErrs.BAD_REQUEST("email is already used");

  const hashedPassword = await hash(password, 12);

  await student.update({ password: hashedPassword });
  await student.save();

  const token = await generateToken({
    userId: student.id,
    name: student.name,
    role: "student",
  });

  // res.cookie("token", token);
  res.send({
    status: 201,
    data: student,
    msg: "successful sign password",
    token: token,
  });
};

const signData = async (req, res) => {
  const { email, gender, levelId, curriculumId, classId } = req.body;

  const teacher = await Teacher.findOne({
    where: {
      email,
    },
  });

  const student = await Student.findOne({
    where: {
      email,
    },
  });

  const parent = await Parent.findOne({
    where: {
      email,
    },
  });

  if (!student) throw serverErrs.BAD_REQUEST("email not found");
  if (student.isRegister) throw serverErrs.BAD_REQUEST("email is already used");
  if (teacher) throw serverErrs.BAD_REQUEST("email is already used");
  if (parent) throw serverErrs.BAD_REQUEST("email is already used");

  await student.update({
    gender,
    LevelId: levelId,
    CurriculumId: curriculumId,
    ClassId: classId,
    isRegistered: true,
  });
  await student.save();
  res.send({ status: 201, data: student, msg: "signed up successfully" });
};

const getStudents = async (req, res) => {
  const Students = await Student.findAll();
  res.send({ status: 201, data: Students, msg: "successful get all Students" });
};

const getSingleStudent = async (req, res) => {
  const { studentId } = req.params;
  const student = await Student.findOne({
    where: { id: studentId },
    include: { all: true },
  });
  res.send({
    status: 201,
    data: student,
    msg: "successful get single student",
  });
};

const getLastTenStudent = async (req, res) => {
  const students = await Student.findAll({
    limit: 10,
    order: [["id", "DESC"]],
    include: { all: true },
  });
  res.send({
    status: 201,
    data: students,
    msg: "successful get last ten students",
  });
};

const editPersonalInformation = async (req, res) => {
  const { StudentId } = req.params;
  const student = await Student.findOne({ where: { id: StudentId } });
  if (!student) throw serverErrs.BAD_REQUEST("Student not found");

  const {
    name,
    gender,
    dateOfBirth,
    phoneNumber,
    city,
    nationality,
    location,
    regionTime,
    languages,
    LevelId,
    ClassId,
    CurriculumId,
  } = req.body;

  const clearImage = (filePath) => {
    filePath = path.join(__dirname, "..", `images/${filePath}`);
    fs.unlink(filePath, (err) => {
      if (err) throw serverErrs.BAD_REQUEST("Image not found");
    });
  };

  if (student.image && req.file) {
    clearImage(student.image);
  }
  if (req.file) await student.update({ image: req.file.filename });
  await student.update({
    name,
    gender,
    dateOfBirth,
    phoneNumber,
    city,
    nationality,
    location,
    regionTime,
    LevelId,
    ClassId,
    CurriculumId,
  });

  await LangTeachStd.destroy({
    where: {
      StudentId: student.id,
    },
  });

  await LangTeachStd.bulkCreate(languages).then(() =>
    console.log("LangTeachStd data have been created")
  );

  res.send({
    status: 201,
    msg: "successful edit personal information data",
  });
};

module.exports = {
  signUp,
  verifyCode,
  signPassword,
  signData,
  getStudents,
  getSingleStudent,
  getLastTenStudent,
  editPersonalInformation,
};
