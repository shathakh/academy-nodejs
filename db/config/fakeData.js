const admin = [
  {
    email: "ahmed@gmail.com",
    name: "Ahmed",
    password: "$2y$10$ZM/WrL9nOvwvpFMrF9TULuJgQfc1F2HpqVh9oyGDzyn1xqH4gkPTO", // 1234
  },
];

const teachers = [
  {
    email: "ali@gmail.com",
    firstName: "Ali",
    lastName: "Mater",
    password: "$2y$10$L6Q3y.O9Q5ZFb6VQpvJSF.N5lYXz1APUV8tVBXvVZs6yuwNkb7jJm", //1234
    gender: "male",
    phone: "0599993697",
    // image:
    //   "https://www.shutterstock.com/image-photo/head-shot-profile-photo-portrait-260nw-1831529317.jpg",
    videoLink: "https://www.youtube.com/watch?v=qqRp2CJk3ro",
    dateOfBirth: "10/6/1998",
    city: "Paris",
    experience: true,
    experienceYears: 3,
    favStdGender: "male",
    certificates: true,
    favHours: " from 9 am to 5 pm",
    shortHeadlineAr: "لغة عربية ",
    shortHeadlineEn: "Arabic ",
    descriptionAr: "معلم لغة عربية محترف متخصص بالأداب",
    descriptionEn: "Arabic Teacher specialized in literature",
    instantBooking: true,
    isRegistered: false,
    isVerified: false,
    EducationDegreeId: 1,
    CertificateId: 1,
    ExperienceId: 1,
    // 1
  },
  {
    email: "Islam@gmail.com",
    firstName: "Islam",
    lastName: "Ali",
    password: "$2y$10$NYLOPjnCZoZFNvjdQ55myuoq8ypEs/jUP76whwKVdz1hI9Sey.IH6", //4321
    gender: "male",
    phone: "0599923697",
    // image:
    //   "https://www.shutterstock.com/image-photo/head-shot-profile-photo-portrait-260nw-1831529317.jpg",
    videoLink: "https://www.youtube.com/watch?v=qqRp2CJk3ro",
    dateOfBirth: "10/6/1995",
    city: "Paris",
    experience: true,
    experienceYears: 3,
    favStdGender: "male",
    certificates: true,
    favHours: " from 9 am to 5 pm",
    shortHeadlineAr: "لغة انجليزية ",
    shortHeadlineEn: "English ",
    descriptionAr: "معلم لغة انجليزية محترف متخصص بالأداب",
    descriptionEn: "English Teacher specialized in literature",
    instantBooking: true,
    isRegistered: false,
    isVerified: false,
    EducationDegreeId: 2,
    CertificateId: 2,
    ExperienceId: 2,
    // 2
  },
  {
    email: "mart@gmail.com",
    firstName: "Mart",
    lastName: "Ahmed",
    password: "$2y$10$G7AXXySlmW/1IPNHguTXaOL9LcqSMO2YiRCsoELITJN1Vp8va264e", //5678
    gender: "male",
    phone: "0599923697",
    // image:
    //   "https://www.shutterstock.com/image-photo/head-shot-profile-photo-portrait-260nw-1831529317.jpg",
    videoLink: "https://www.youtube.com/watch?v=qqRp2CJk3ro",
    dateOfBirth: "10/2/1995",
    city: "Paris",
    experience: true,
    experienceYears: 3,
    favStdGender: "male",
    certificates: true,
    favHours: " from 9 am to 5 pm",
    shortHeadlineAr: " احصاء ",
    shortHeadlineEn: "Counting ",
    descriptionAr: "معلم احصاء محترف",
    descriptionEn: "Counting Teacher",
    instantBooking: true,
    isRegistered: false,
    isVerified: false,
    EducationDegreeId: 3,
    CertificateId: 2,
    ExperienceId: 3,
    // 3
  },
];

const students = [
  {
    email: "rawan@gmail.com",
    name: "Rawan Ali",
    password: "$2y$10$qyPwWfg1kdd4/jMIJ/aWyuCSl8CBtEGyns9b1HfrbhXTUR03cQrVm", // 1234
    gender: "female",
    city: "London",
    isVerified: false,
    dateOfBirth: "10/7/1999",
    nationality: "English",
    location: "England",
    phoneNumber: "0592626126",
    regionTime: "GM",
    // image:
    //   "https://www.shutterstock.com/image-photo/head-shot-profile-photo-portrait-260nw-1831529317.jpg",
    LevelId: 1,
    ClassId: 1,
    CurriculumId: 1,
    // 1
  },
  {
    email: "sara@gmail.com",
    name: "Sara Ali",
    password: "$2y$10$bHRzbIQH2Gm7n73pS7CzueCRZicTnj.r.yBM2IzqSiSxJQc0QPtGq", // 4321
    gender: "female",
    city: "Canada",
    isVerified: false,
    dateOfBirth: "10/7/1990",
    nationality: "American",
    location: "USA",
    phoneNumber: "0593026126",
    regionTime: "GM",
    // image:
    //   "https://www.shutterstock.com/image-photo/head-shot-profile-photo-portrait-260nw-1831529317.jpg",
    LevelId: 2,
    ClassId: 2,
    CurriculumId: 2,
    // 2
  },
  {
    email: "Awne@gmail.com",
    name: "Awne Ali",
    password: "$2y$10$bHRzbIQH2Gm7n73pS7CzueCRZicTnj.r.yBM2IzqSiSxJQc0QPtGq", // 4321
    gender: "male",
    city: "Canada",
    isVerified: false,
    dateOfBirth: "10/2/1990",
    nationality: "American",
    location: "USA",
    phoneNumber: "0590026126",
    regionTime: "GM",
    // image:
    //   "https://www.shutterstock.com/image-photo/head-shot-profile-photo-portrait-260nw-1831529317.jpg",
    LevelId: 3,
    ClassId: 3,
    CurriculumId: 3,
    // 3
  },
];

const subjectCategories = [
  {
    titleAR: "رياضيات",
    titleEN: "math",
  }, //1
  {
    titleAR: "لغات",
    titleEN: "languages",
  }, //2
  {
    titleAR: "علوم",
    titleEN: "science",
  }, //3
  {
    titleAR: "تاريخ",
    titleEN: "history",
  }, //4
];

const subjects = [
  {
    titleAR: "جبر",
    titleEN: "Algebra",
    subjectCategoryId: 1,
  }, //1
  {
    titleAR: "احصاء",
    titleEN: "Counting",
    subjectCategoryId: 1,
  }, //2
  {
    titleAR: "كيمياء",
    titleEN: "chemistry",
    subjectCategoryId: 2,
  }, //3
  {
    titleAR: "احياء",
    titleEN: "biology",
    subjectCategoryId: 2,
  }, //4
  {
    titleAR: "فيزيا",
    titleEN: "physics",
    subjectCategoryId: 2,
  }, //5
  {
    titleAR: "تاريخ العرب",
    titleEN: "History of the Arabs",
    subjectCategoryId: 3,
  }, //6
];

const levels = [
  {
    titleAR: "لبتدائي",
    titleEN: "primary",
  }, //1
  {
    titleAR: "اعدادي",
    titleEN: "secondary",
  }, //2
  {
    titleAR: "ثانوي",
    titleEN: "high School",
  }, //3
  {
    titleAR: "جامعة",
    titleEN: "University",
  }, //4
];

const classes = [
  {
    titleAR: "سنة أولى",
    titleEN: "first year",
  }, //1
  {
    titleAR: "سنة ثانية",
    titleEN: "second year",
  }, //2
  {
    titleAR: "سنة ثالثة",
    titleEN: "third year",
  }, //3
  {
    titleAR: "سنة رابعة",
    titleEN: "fourth year",
  }, //4
];

const curriculums = [
  {
    titleAR: " المنهج الأمريكي",
    titleEN: "american curriculum",
  }, //1
  {
    titleAR: "المنهج البريطاني",
    titleEN: "british curriculum",
  }, //2
  {
    titleAR: "المنهج السعودي",
    titleEN: "saudi curriculum",
  }, //3
  {
    titleAR: " المنهج الاماراتي",
    titleEN: "emarites curriculum",
  }, //4
];
const curriculumLevels = [
  {
    LevelId: 1,
    CurriculumId: 1,
  },
  {
    LevelId: 2,
    CurriculumId: 1,
  },
  {
    LevelId: 3,
    CurriculumId: 2,
  },
  {
    LevelId: 2,
    CurriculumId: 3,
  },
  {
    LevelId: 4,
    CurriculumId: 1,
  },
  {
    LevelId: 4,
    CurriculumId: 4,
  },
  {
    LevelId: 3,
    CurriculumId: 4,
  },
];

const languages = [
  {
    title: "english",
  },
  {
    title: "arabic",
  },
  {
    title: "french",
  },
  {
    title: "italian",
  },
];

const experiences = [
  {
    jobTitle: "arabic teacher",
    companyName: "islam school",
    from: "12/4/2010",
    to: "8/8/2020",
  },
  {
    jobTitle: "english teacher",
    companyName: "american school",
    from: "3/3/3303",
    to: "4/5/5505",
  },
  {
    jobTitle: "math teacher",
    companyName: "ahmed school",
    from: "2/4/2003",
    to: "2/5/2023",
  },
];

const educationDegree = [
  {
    UniversityName: "azhar university",
    degree: "BA",
    from: "23/5/2000",
    to: "23/5/2007",
  },
  {
    UniversityName: "islamic university",
    degree: "master",
    from: "30/3/2020",
    to: "3/4/2022",
  },
  {
    UniversityName: "gaza university",
    degree: "BA",
    from: "22/3/1987",
    to: "5/6/1988",
  },
];

const certificates = [
  {
    name: "web development",
    subject: "technology",
    from: "22/3/1987",
    to: "5/6/1988",
  },
  {
    name: "algorethims",
    subject: "math",
    from: "22/3/1987",
    to: "5/6/1988",
  },
];

const parents = [
  {
    email: "omar@gmail.com",
    name: "Omar",
    password: "$2y$10$GiRwVzGsajZynsdUGfXC7.QyH5QajFN99i35C2TYfIQq/ZtJ/4dT6", // 1234
    // image:
    //   "https://www.esafety.gov.au/sites/default/files/2019-07/protect_your_personal_information_0.jpg",
    // 1
  },
];

module.exports = {
  admin,
  students,
  parents,
  levels,
  subjectCategories,
  subjects,
  teachers,
  classes,
  curriculums,
  languages,
  experiences,
  educationDegree,
  certificates,
  curriculumLevels,
};
