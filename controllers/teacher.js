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
  Rate,
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
const { db } = require("../firebaseConfig");

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

  if (teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "الإيميل مستخدم سابقا",
      english: "email is already used",
    });
  if (student)
    throw serverErrs.BAD_REQUEST({
      arabic: "الإيميل مستخدم سابقا",
      english: "email is already used",
    });
  if (parent)
    throw serverErrs.BAD_REQUEST({
      arabic: "الإيميل مستخدم سابقا",
      english: "email is already used",
    });

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
    from: "info@moalime.com",
    to: email,
    subject: "منصة معلمي: رمز التحقق الخاص بك",
    html: `<div> مرحبًا ، <br> شكرًا جزيلاً لك على الوقت الذي استغرقته للانضمام إلينا </ b>
    يسعدنا إخبارك بأنه تم إنشاء حسابك <br>
    !للتحقق من حسابك أدخل الرمز من فضلك <br>
    <b> ${code} </b>
    .حظًا سعيدًا <br>
    ,فريق معلمي
    </div>`,
  };
  sendEmail(mailOptions);
  res.send({
    status: 201,
    msg: { arabic: "تم ارسال الإيميل بنجاح", english: "successful send email" },
  });
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
  if (registeredTeacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "الإيميل مستخدم سابقا",
      english: "email is already used",
    });
  if (student)
    throw serverErrs.BAD_REQUEST({
      arabic: "الإيميل مستخدم سابقا",
      english: "email is already used",
    });
  if (parent)
    throw serverErrs.BAD_REQUEST({
      arabic: "الإيميل مستخدم سابقا",
      english: "email is already used",
    });

  const teacher = await Teacher.findOne({
    where: {
      email,
      registerCode,
    },
  });

  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "الكود خاطئ",
      english: "code is wrong",
    });

  await teacher.update({ isRegistered: true });

  res.send({
    status: 201,
    data: teacher,
    msg: {
      arabic: "تم تأكيد تفعيل الكود بنجاح",
      english: "Verified code successfully",
    },
  });
};

const signPassword = async (req, res) => {
  const { email, password } = req.body;

  const teacher = await Teacher.findOne({
    where: {
      email,
      isRegistered: true,
    },
  });

  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "الإيميل مستخدم سابقا",
      english: "email is already used",
    });

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
    from: "info@moalime.com",
    to: email,
    subject: "!منصة معلمي : تم إنشاء الحساب بنجاح",
    html: `<div> مرحبًا ، <br> شكرًا جزيلاً لك على تخصيص بعض الوقت للانضمام إلينا </ b>
    يسعدنا إخبارك أنه تم إنشاء حسابك بنجاح. <br>
    تهانينا على اتخاذ الخطوة الأولى نحو تجربة موقعنا <br> <br>
    .نتطلع إلى تزويدك بتجربة استثنائية <br>
    ,حظًا سعيدًا <br>
    فريق معلمي
    </div>`,
  };
  sendEmail(mailOptions);

  res.send({
    status: 201,
    data: teacher,
    msg: { arabic: "تم التسجيل بنجاح", english: "successful sign up" },
    token: token,
  });
};

const signAbout = async (req, res) => {
  const { teacherId } = req.params;
  const teacher = await Teacher.findOne({ where: { id: teacherId } });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المعلم غير موجود",
      english: "Invalid teacherId! ",
    });

  if (teacher.id != req.user.userId)
    throw serverErrs.BAD_REQUEST({
      arabic: "لا يوجد حق بالوصول",
      english: "No Auth ",
    });

  const { firstName, lastName, gender, dateOfBirth, phone, country, city } =
    req.body;
  let { languages } = req.body;
  if (typeof languages === "string") {
    languages = JSON.parse(languages);
  }
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
    msg: {
      arabic: "تم تسجيل معلوماتك بنجاح",
      english: "successful sign about data",
    },
  });
};

const signAdditionalInfo = async (req, res) => {
  const { teacherId } = req.params;
  // console.log("teacherId: ", teacherId);
  const teacher = await Teacher.findOne({ where: { id: teacherId } });
  // console.log("teacher: ", teacher);
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المعلم غير موجود",
      english: "Invalid teacherId! ",
    });

  if (teacher.id != req.user.userId)
    throw serverErrs.BAD_REQUEST({
      arabic: "لا يوجد حق بالوصول",
      english: "No Auth ",
    });

  const {
    haveCertificates,
    haveExperience,
    experienceYears,
    favStdGender,
    favHours,
    articleExperience,
  } = req.body;

  let { levels, curriculums } = req.body;
  if (typeof levels === "string") {
    levels = JSON.parse(levels);
  }
  if (typeof curriculums === "string") {
    curriculums = JSON.parse(curriculums);
  }

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
    msg: {
      arabic: "تم تسجيل معلومات إضافية بنجاح",
      english: "successful sign Additional Information! ",
    },
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

  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المعلم غير موجود",
      english: "Invalid teacherId! ",
    });

  res.send({
    status: 201,
    data: teacher,
    msg: {
      arabic: "تم إرجاع معلومات المعلم بنجاح",
      english: "successful get single Teacher",
    },
  });
};

const uploadImage = async (req, res) => {
  const { teacherId } = req.params;

  if (!req.file)
    throw serverErrs.BAD_REQUEST({
      arabic: " الصورة غير موجودة ",
      english: "Image not exist ",
    });

  const teacher = await Teacher.findOne({ where: { id: teacherId } });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المعلم غير موجود",
      english: "Invalid teacherId! ",
    });

  if (teacher.id != req.user.userId)
    throw serverErrs.BAD_REQUEST({
      arabic: "لا يوجد حق بالوصول",
      english: "No Auth ",
    });

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
    msg: {
      arabic: "تم إدراج الصورة بنجاح",
      english: "uploaded image successfully",
    },
  });
};

const addSubjects = async (req, res) => {
  const { teacherId } = req.params;

  const teacher = await Teacher.findOne({ where: { id: teacherId } });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المعلم غير موجود",
      english: "Invalid teacherId! ",
    });

  if (teacher.id != req.user.userId)
    throw serverErrs.BAD_REQUEST({
      arabic: "لا يوجد حق بالوصول",
      english: "No Auth ",
    });

  const { remote, f2fStudent, f2fTeacher } = req.body;

  let { subjects } = req.body;
  if (typeof subjects === "string") {
    subjects = JSON.parse(subjects);
  }
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
    msg: {
      arabic: "تم إضافة مادة ونوع الجلسة بنجاح",
      english: "added subjects and session type successfully",
    },
  });
};

const signAvailability = async (req, res) => {
  const { teacherId } = req.params;
  const teacher = await Teacher.findOne({ where: { id: teacherId } });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المعلم غير موجود",
      english: "Invalid teacherId! ",
    });

  if (teacher.id != req.user.userId)
    throw serverErrs.BAD_REQUEST({
      arabic: "لا يوجد حق بالوصول",
      english: "No Auth ",
    });

  const { timeZone } = req.body;
  let { teacherDayes } = req.body;

  if (typeof teacherDayes === "string") {
    teacherDayes = JSON.parse(teacherDayes);
  }

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
    msg: {
      arabic: "تم تسجيل الوقت المتاح بنجاح",
      english: "successful sign availability!",
    },
  });
};

const addDescription = async (req, res) => {
  const { teacherId } = req.params;

  const teacher = await Teacher.findOne({ where: { id: teacherId } });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المعلم غير موجود",
      english: "Invalid teacherId! ",
    });

  if (teacher.id != req.user.userId)
    throw serverErrs.BAD_REQUEST({
      arabic: "لا يوجد حق بالوصول",
      english: "No Auth ",
    });

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
    msg: {
      arabic: "تم إضافة وصف بنجاح",
      english: "added description successfully",
    },
  });
};

const signResume = async (req, res) => {
  const { teacherId } = req.params;
  const teacher = await Teacher.findOne({ where: { id: teacherId } });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المعلم غير موجود",
      english: "Invalid teacherId! ",
    });

  if (teacher.id != req.user.userId)
    throw serverErrs.BAD_REQUEST({
      arabic: "لا يوجد حق بالوصول",
      english: "No Auth ",
    });

  let { certificates, experiences, educationDegrees } = req.body;

  if (typeof certificates === "string") {
    certificates = JSON.parse(certificates);
  }
  if (typeof experiences === "string") {
    experiences = JSON.parse(experiences);
  }
  if (typeof educationDegrees === "string") {
    educationDegrees = JSON.parse(educationDegrees);
  }

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
    msg: {
      arabic: "تم إدخال معلومات السيرة الذاتية بنجاح",
      english: "successful sign Resume Information!",
    },
  });
};

const signVideoLink = async (req, res) => {
  const { teacherId } = req.params;
  const teacher = await Teacher.findOne({ where: { id: teacherId } });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المعلم غير موجود",
      english: "Invalid teacherId! ",
    });

  if (teacher.id != req.user.userId)
    throw serverErrs.BAD_REQUEST({
      arabic: "لا يوجد حق بالوصول",
      english: "No Auth ",
    });

  const { videoLink } = req.body;

  await teacher.update({
    videoLink,
  });

  await teacher.save();
  res.send({
    status: 201,
    data: teacher,
    msg: {
      arabic: "تم إدراج الفيديو بنجاح",
      english: "successful sign VideoLink Information!",
    },
  });
};

const searchTeacherFilterSide = async (req, res) => {
  const { videoLink, gender, LanguageId, CurriculumId } = req.body;
  const { currency } = req.query;
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
    msg: {
      arabic: "تم البحث بنجاح",
      english: "successful search",
    },
  });
};

const searchTeacherFilterTop = async (req, res) => {
  const { LevelId } = req.body;
  let { subjects } = req.body;
  if (typeof subjects === "string") {
    subjects = JSON.parse(subjects);
  }
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
    msg: {
      arabic: "تم البحث بنجاح",
      english: "successful search",
    },
  });
};

const resetPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { TeacherId } = req.params;
  const teacher = await Teacher.findOne({
    where: { id: TeacherId },
    include: { all: true },
  });
  if (!teacher)
    throw serverErrs.BAD_REQUEST({
      arabic: "المعلم غير موجود",
      english: "teacher not found",
    });
  const result = await compare(oldPassword, teacher?.password);
  if (!result)
    throw serverErrs.BAD_REQUEST({
      arabic: "كلمة المرور غير صحيحة",
      english: "Old password is wrong",
    });
  const hashedPassword = await hash(newPassword, 12);
  await teacher.update({ password: hashedPassword });
  res.send({
    status: 201,
    data: teacher,
    msg: {
      arabic: "تم تحديث كلمة المرور بنجاح",
      english: "successful update teacher password",
    },
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
    msg: {
      arabic: "تم إرجاع جميع الدروس بنجاح",
      english: "successful get all lessons",
    },
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
    msg: {
      arabic: "تم إرجاع مستحقات المعلم بنجاح",
      english: "successful get all teacher credit & dues",
    },
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
    msg: {
      arabic: "تم إرجاع السجل المالي بنجاح",
      english: "successful get all financial records",
    },
  });
};

const updateNotification = async (req, res) => {
  const { TeacherId } = req.params;
  const notificationsRef = db.collection("Notifications");
  const query = notificationsRef.where("TeacherId", "==", TeacherId);

  query.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const notificationRef = notificationsRef.doc(doc.id);
      notificationRef.update({ seen: true });
    });
  });

  res.send({
    status: 201,
    msg: {
      arabic: "تم رؤية جميع الإشعارات ",
      english: "successful seen for all Notification",
    },
  });
};

const getTeacherRate = async (req, res) => {
  const { TeacherId } = req.params;
  const rates = await Rate.findAll({
    where: {
      TeacherId,
    },
  });

  res.send({
    status: 201,
    data: rates,
    msg: {
      arabic: "تم ارجاع تقييم المعلم بنجاح",
      english: "successful get teacher rate",
    },
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
  updateNotification,
  getTeacherRate,
};
