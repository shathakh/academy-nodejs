const {
  Teacher,
  Student,
  Parent,
  LangTeachStd,
  TeacherLevel,
  CurriculumTeacher,
  RemoteSession,
  F2FSessionStd,
  F2FSessionTeacher,
  TeacherDay,
  Certificates,
  Experience,
  EducationDegree,
  Language,
  Days,
  Level,
  Curriculum,
  Subject,
  Session,
  FinancialRecord,
} = require("../models");
const { validateTeacher, loginValidation } = require("../validation");
const { serverErrs } = require("../middlewares/customError");
const generateRandomCode = require("../middlewares/generateCode");
const sendEmail = require("../middlewares/sendEmail");
const { compare, hash } = require("bcrypt");
const generateToken = require("../middlewares/generateToken");
const path = require("path");
const fs = require("fs");
const TeacherSubject = require("../models/TeacherSubject");
const { Op } = require("sequelize");

const signUp = async (req, res) => {
  const { email } = req.body;
  await validateTeacher.validate({ email });

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

  const existTeacher = await Teacher.findOne({
    where: {
      email,
      isRegistered: false,
    },
  });
  if (existTeacher) await existTeacher.update({ registerCode: code });
  else {
    const newTeacher = await Teacher.create({
      email,
      registerCode: code,
    });
  }
  const mailOptions = {
    from: "moalemy2022@gmail.com",
    to: email,
    subject: "Moalemy platform: Your Verification Code",
    html: `<div>Welcome, <br>Thank you so much for taking time to joining us </b>
    We are happy to let you know that your account have been created.<br>
    To verify your Account enter the code please!<br>
    <b> ${code} </b>
    Good luck,<br>
    Moalemy Team
    </div> `,
  };
  sendEmail(mailOptions);
  res.send({ status: 201, msg: "successful send email" });
};

const verifyCode = async (req, res) => {
  const { registerCode, email } = req.body;

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

  const registeredTeacher = await Teacher.findOne({
    where: {
      email,
      isRegistered: true,
    },
  });
  if (registeredTeacher) throw serverErrs.BAD_REQUEST("email is already used");
  if (student) throw serverErrs.BAD_REQUEST("email is already used");
  if (parent) throw serverErrs.BAD_REQUEST("email is already used");

  const teacher = await Teacher.findOne({
    where: {
      email,
      registerCode,
    },
  });

  if (!teacher) throw serverErrs.BAD_REQUEST("code is wrong");

  await teacher.update({ isRegistered: true });

  res.send({ status: 201, data: teacher, msg: "Verified code successfully" });
};

const signPassword = async (req, res) => {
  const { email, password } = req.body;

  const teacher = await Teacher.findOne({
    where: {
      email,
      isRegistered: true,
    },
  });

  if (!teacher) throw serverErrs.BAD_REQUEST("email not found");

  const hashedPassword = await hash(password, 12);

  await teacher.update({ password: hashedPassword });
  await teacher.save();

  const token = await generateToken({
    userId: teacher.id,
    name: teacher.name,
    role: "teacher",
  });

  // res.cookie("token", token);
  const mailOptions = {
    from: "moalemy2022@gmail.com",
    to: email,
    subject: "Moalemy platform: Account Creation Successful!",
    html: `<div>Welcome, <br>Thank you so much for taking time to joining us </b>
    We are delighted to inform you that your account has been successfully created.<br>
    Congratulations on taking the first step towards experiencing our website<br><br>
    We look forward to providing you with an exceptional experience.<br>
    Good luck,<br>
    Moalemy Team
    </div> `,
  };
  sendEmail(mailOptions);

  res.send({
    status: 201,
    data: teacher,
    msg: "successful sign up",
    token: token,
  });
};

const signAbout = async (req, res) => {
  const { teacherId } = req.params;
  const teacher = await Teacher.findOne({ where: { id: teacherId } });
  if (!teacher) throw serverErrs.BAD_REQUEST("Invalid teacherId! ");

  if (teacher.id != req.user.userId) throw serverErrs.BAD_REQUEST("No Auth ");

  const {
    firstName,
    lastName,
    gender,
    dateOfBirth,
    phone,
    country,
    city,
    languages,
  } = req.body;

  await teacher.update({
    firstName,
    lastName,
    gender,
    dateOfBirth,
    phone,
    country,
    city,
  });
  const langTeacher = await LangTeachStd.destroy({
    where: {
      TeacherId: teacher.id,
    },
  });

  await LangTeachStd.bulkCreate(languages).then(() =>
    console.log("LangTeachStd data have been created")
  );

  const langTeachers = await LangTeachStd.findAll({
    where: {
      TeacherId: teacher.id,
    },
    include: { all: true },
  });
  await teacher.save();
  const firstNames = teacher.firstName;
  const lastNames = teacher.lastName;

  res.send({
    status: 201,
    data: { firstName: firstNames, lastName: lastNames },
    msg: "successful sign about data",
  });
};

const signAdditionalInfo = async (req, res) => {
  const { teacherId } = req.params;
  console.log("teacherId: ", teacherId);
  const teacher = await Teacher.findOne({ where: { id: teacherId } });
  console.log("teacher: ", teacher);
  if (!teacher) throw serverErrs.BAD_REQUEST("Invalid teacherId! ");

  if (teacher.id != req.user.userId) throw serverErrs.BAD_REQUEST("No Auth ");

  const {
    haveCertificates,
    haveExperience,
    experienceYears,
    favStdGender,
    favHours,
    articleExperience,
    levels,
    curriculums,
  } = req.body;

  await teacher.update({
    haveCertificates,
    haveExperience,
    experienceYears,
    favStdGender,
    favHours,
    articleExperience,
  });
  const curriculumTeacher = await CurriculumTeacher.destroy({
    where: {
      TeacherId: teacher.id,
    },
  });

  const teacherLevel = await TeacherLevel.destroy({
    where: {
      TeacherId: teacher.id,
    },
  });

  await TeacherLevel.bulkCreate(levels).then(() =>
    console.log("LangTeachStd data have been created")
  );
  await CurriculumTeacher.bulkCreate(curriculums).then(() =>
    console.log("LangTeachStd data have been created")
  );

  const teacherLevels = await TeacherLevel.findAll({
    where: {
      TeacherId: teacher.id,
    },
    include: { all: true },
  });

  const curriculumTeachers = await CurriculumTeacher.findAll({
    where: {
      TeacherId: teacher.id,
    },
    include: { all: true },
  });
  await teacher.save();
  res.send({
    status: 201,
    data: { teacher, teacherLevels, curriculumTeachers },
    msg: "successful sign Additional Information! ",
  });
};

const getSingleTeacher = async (req, res) => {
  const { teacherId } = req.params;

  const teacher = await Teacher.findOne({
    where: { id: teacherId },
    include: [
      { model: LangTeachStd, include: [Language] },
      { model: Experience },
      { model: EducationDegree },
      { model: Certificates },
      { model: TeacherDay, include: [Days] },
      { model: TeacherLevel, include: [Level] },
      { model: CurriculumTeacher, include: [Curriculum] },
      { model: TeacherSubject, include: [Subject] },
      { model: RemoteSession },
      { model: F2FSessionStd },
      { model: F2FSessionTeacher },
    ],
  });

  if (!teacher) throw serverErrs.BAD_REQUEST("Invalid teacherId! ");

  res.send({
    status: 201,
    data: teacher,
    msg: "successful get single Teacher",
  });
};

const uploadImage = async (req, res) => {
  const { teacherId } = req.params;

  if (!req.file) throw serverErrs.BAD_REQUEST("Image not exist ");

  const teacher = await Teacher.findOne({ where: { id: teacherId } });
  if (!teacher) throw serverErrs.BAD_REQUEST("Invalid teacherId! ");

  if (teacher.id != req.user.userId) throw serverErrs.BAD_REQUEST("No Auth ");

  const clearImage = (filePath) => {
    filePath = path.join(__dirname, "..", `images/${filePath}`);
    fs.unlink(filePath, (err) => {
      if (err) throw serverErrs.BAD_REQUEST("Image not found");
    });
  };

  if (teacher.image) {
    clearImage(teacher.image);
  }
  await teacher.update({ image: req.file.filename });
  res.send({
    status: 201,
    data: req.file.filename,
    msg: "uploaded image successfully",
  });
};

const addSubjects = async (req, res) => {
  const { teacherId } = req.params;

  const teacher = await Teacher.findOne({ where: { id: teacherId } });
  if (!teacher) throw serverErrs.BAD_REQUEST("Invalid teacherId! ");

  if (teacher.id != req.user.userId) throw serverErrs.BAD_REQUEST("No Auth ");

  const { subjects, remote, f2fStudent, f2fTeacher } = req.body;

  await TeacherSubject.destroy({
    where: {
      TeacherId: teacher.id,
    },
  });

  await RemoteSession.destroy({
    where: {
      TeacherId: teacher.id,
    },
  });

  await F2FSessionStd.destroy({
    where: {
      TeacherId: teacher.id,
    },
  });
  await F2FSessionTeacher.destroy({
    where: {
      TeacherId: teacher.id,
    },
  });

  await TeacherSubject.bulkCreate(subjects).then(() =>
    console.log("Teacher Subjects data have been created")
  );
  if (remote) {
    await RemoteSession.create(remote).then(() =>
      console.log("Teacher remote session has been saved")
    );
  }
  if (f2fStudent) {
    await F2FSessionStd.create(f2fStudent).then(() =>
      console.log("teacher session at home student has been saved")
    );
  }
  if (f2fTeacher) {
    await F2FSessionTeacher.create(f2fTeacher).then(() =>
      console.log("Teacher session at teacher home has been saved")
    );
  }

  const teacherSubjects = await TeacherSubject.findAll({
    where: {
      TeacherId: teacherId,
    },
    include: {
      all: true,
    },
  });

  const remoteSession = await RemoteSession.findAll({
    where: {
      TeacherId: teacherId,
    },
    include: {
      all: true,
    },
  });

  const f2fStudentSession = await F2FSessionStd.findAll({
    where: {
      TeacherId: teacherId,
    },
    include: {
      all: true,
    },
  });

  const f2fTeacherSession = await F2FSessionTeacher.findAll({
    where: {
      TeacherId: teacherId,
    },
    include: {
      all: true,
    },
  });
  res.send({
    status: 201,
    data: {
      teacherSubjects,
      remoteSession,
      f2fStudentSession,
      f2fTeacherSession,
    },
    msg: "added subjects and session type successfully",
  });
};

const signAvailability = async (req, res) => {
  const { teacherId } = req.params;
  const teacher = await Teacher.findOne({ where: { id: teacherId } });
  if (!teacher) throw serverErrs.BAD_REQUEST("Invalid teacherId! ");

  if (teacher.id != req.user.userId) throw serverErrs.BAD_REQUEST("No Auth ");

  const { timeZone, teacherDayes } = req.body;

  await teacher.update({
    timeZone,
  });
  const teacherDay = await TeacherDay.destroy({
    where: {
      TeacherId: teacher.id,
    },
  });

  await TeacherDay.bulkCreate(teacherDayes).then(() =>
    console.log("TeacherDay data have been created")
  );

  const dayesTeacher = await TeacherDay.findAll({
    where: {
      TeacherId: teacher.id,
    },
    include: { all: true },
  });

  await teacher.save();
  res.send({
    status: 201,
    data: { teacher, dayesTeacher },
    msg: "successful sign availability!",
  });
};

const addDescription = async (req, res) => {
  const { teacherId } = req.params;

  const teacher = await Teacher.findOne({ where: { id: teacherId } });
  if (!teacher) throw serverErrs.BAD_REQUEST("Invalid teacherId! ");

  if (teacher.id != req.user.userId) throw serverErrs.BAD_REQUEST("No Auth ");

  const { shortHeadlineAr, shortHeadlineEn, descriptionAr, descriptionEn } =
    req.body;

  const updatedTeacher = await teacher.update({
    shortHeadlineAr,
    shortHeadlineEn,
    descriptionAr,
    descriptionEn,
  });
  res.send({
    status: 201,
    data: updatedTeacher,
    msg: "added description successfully",
  });
};

const signResume = async (req, res) => {
  const { teacherId } = req.params;
  const teacher = await Teacher.findOne({ where: { id: teacherId } });
  if (!teacher) throw serverErrs.BAD_REQUEST("Invalid teacherId! ");

  if (teacher.id != req.user.userId) throw serverErrs.BAD_REQUEST("No Auth ");

  const { certificates, experiences, educationDegrees } = req.body;

  const teacherCertificate = await Certificates.destroy({
    where: {
      TeacherId: teacher.id,
    },
  });

  const teacherExperience = await Experience.destroy({
    where: {
      TeacherId: teacher.id,
    },
  });

  const teacherEducationDegree = await EducationDegree.destroy({
    where: {
      TeacherId: teacher.id,
    },
  });

  await Certificates.bulkCreate(certificates).then(() =>
    console.log("Certificates data have been created")
  );
  await Experience.bulkCreate(experiences).then(() =>
    console.log("Experience data have been created")
  );
  await EducationDegree.bulkCreate(educationDegrees).then(() =>
    console.log("EducationDegree data have been created")
  );

  const teacherCertificates = await Certificates.findAll({
    where: {
      TeacherId: teacher.id,
    },
    include: { all: true },
  });

  const teacherExperiences = await Experience.findAll({
    where: {
      TeacherId: teacher.id,
    },
    include: { all: true },
  });

  const teacherEducationDegrees = await EducationDegree.findAll({
    where: {
      TeacherId: teacher.id,
    },
    include: { all: true },
  });
  await teacher.save();
  res.send({
    status: 201,
    data: { teacherCertificates, teacherExperiences, teacherEducationDegrees },
    msg: "successful sign Resume Information! ",
  });
};

const signVideoLink = async (req, res) => {
  const { teacherId } = req.params;
  const teacher = await Teacher.findOne({ where: { id: teacherId } });
  if (!teacher) throw serverErrs.BAD_REQUEST("Invalid teacherId! ");

  if (teacher.id != req.user.userId) throw serverErrs.BAD_REQUEST("No Auth ");

  const { videoLink } = req.body;

  await teacher.update({
    videoLink,
  });

  await teacher.save();
  res.send({
    status: 201,
    data: teacher,
    msg: "successful sign VideoLink Information! ",
  });
};

const searchTeacherFilterSide = async (req, res) => {
  const { videoLink, gender, LanguageId, CurriculumId } = req.body;
  let whereTeacher = { isVerified: 1 };
  let whereInclude = [];
  if (videoLink) {
    whereTeacher["videoLink"] = { [Op.not]: "" };
  }
  if (gender == "male" || gender == "female") {
    whereTeacher["gender"] = gender;
  }
  if (LanguageId) {
    whereInclude.push({
      model: LangTeachStd,
      where: { LanguageId: 1 },
    });
  } else {
    whereInclude.push({
      model: LangTeachStd,
    });
  }
  if (CurriculumId !== "all") {
    whereInclude.push({
      model: CurriculumTeacher,
      where: { CurriculumId: +CurriculumId },
    });
  }
  const teachers = await Teacher.findAll({
    where: whereTeacher,
    include: whereInclude,
  });

  res.send({
    status: 201,
    data: teachers,
    msg: "successful search ",
  });
};

const searchTeacherFilterTop = async (req, res) => {
  const { LevelId, subjects } = req.body;
  let whereInclude = [];
  if (LevelId !== "all") {
    whereInclude.push({
      model: TeacherLevel,
      where: { LevelId: +LevelId },
    });
  }
  if (subjects.length > 0) {
    whereInclude.push({
      model: TeacherSubject,
      where: {
        SubjectId: {
          [Op.or]: subjects,
        },
      },
    });
  }
  const teachers = await Teacher.findAll({
    where: { isVerified: 1 },
    include: whereInclude,
  });

  res.send({
    status: 201,
    data: teachers,
    msg: "successful search",
  });
};

const resetPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { TeacherId } = req.params;
  const teacher = await Teacher.findOne({
    where: { id: TeacherId },
    include: { all: true },
  });
  if (!teacher) throw serverErrs.BAD_REQUEST("teacher not found");
  const result = await compare(oldPassword, teacher?.password);
  if (!result) throw serverErrs.BAD_REQUEST("Old password is wrong");
  const hashedPassword = await hash(newPassword, 12);
  await teacher.update({ password: hashedPassword });
  res.send({
    status: 201,
    data: teacher,
    msg: "successful update teacher password",
  });
};

const getAllLessons = async (req, res) => {
  const { TeacherId } = req.params;

  const lessons = await Session.findAll({
    where: {
      TeacherId,
      isPaid: true,
    },
    include: [{ model: Student }],
  });

  res.send({
    status: 201,
    data: lessons,
    msg: "successful get all lessons",
  });
};

const getCredit = async (req, res) => {
  const { TeacherId } = req.params;

  const teacher = await Teacher.findOne({
    where: {
      id: TeacherId,
    },
  });

  res.send({
    status: 201,
    data: { totalAmount: teacher.totalAmount, dues: teacher.dues },
    msg: "successful get all teacher credit",
  });
};

const getTeacherFinancial = async (req, res) => {
  const { TeacherId } = req.params;

  const records = await FinancialRecord.findAll({
    where: {
      TeacherId,
    },
  });

  res.send({
    status: 201,
    data: records,
    msg: "successful get all financial records for teacher",
  });
};

module.exports = {
  signUp,
  verifyCode,
  signPassword,
  signAbout,
  signAdditionalInfo,
  getSingleTeacher,
  uploadImage,
  addSubjects,
  addDescription,
  signResume,
  signAvailability,
  signVideoLink,
  searchTeacherFilterSide,
  searchTeacherFilterTop,
  resetPassword,
  getAllLessons,
  getCredit,
  getTeacherFinancial,
};
