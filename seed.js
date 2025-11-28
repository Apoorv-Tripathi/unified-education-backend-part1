require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/student.model');
const Institution = require('./models/institution.model');
const Teacher = require('./models/teacher.model');

const MONGODB_URI = process.env.MONGODB_URI;

// Sample Data
const institutions = [
  { name: "Indian Institute of Technology Bombay", shortName: "IIT Bombay", aisheCode: "U-0058", location: "Mumbai, Maharashtra", type: "Government", accreditation: "NAAC A++", nirfScore: 96, ranking: 1, compliance: 99, students: 12500, faculty: 620, departments: 17, projects: 500, established: 1958, placement: 98 },
  { name: "Indian Institute of Technology Delhi", shortName: "IIT Delhi", aisheCode: "U-0059", location: "New Delhi", type: "Government", accreditation: "NAAC A++", nirfScore: 95, ranking: 2, compliance: 98, students: 11000, faculty: 580, departments: 16, projects: 480, established: 1961, placement: 97 },
  { name: "BITS Pilani", shortName: "BITS", aisheCode: "U-0211", location: "Pilani, Rajasthan", type: "Private", accreditation: "NAAC A+", nirfScore: 88, ranking: 25, compliance: 95, students: 8500, faculty: 420, departments: 12, projects: 280, established: 1964, placement: 94 },
  { name: "IIIT Hyderabad", shortName: "IIITH", aisheCode: "U-1234", location: "Hyderabad, Telangana", type: "Government", accreditation: "NAAC A+", nirfScore: 87, ranking: 30, compliance: 94, students: 7800, faculty: 340, departments: 8, projects: 310, established: 1998, placement: 97 },
  { name: "VIT Vellore", shortName: "VIT", aisheCode: "U-0456", location: "Vellore, Tamil Nadu", type: "Private", accreditation: "NAAC A++", nirfScore: 80, ranking: 17, compliance: 93, students: 21000, faculty: 1200, departments: 32, projects: 620, established: 1984, placement: 92 },

  { name: "Jadavpur University", shortName: "JU", aisheCode: "U-0987", location: "Kolkata, West Bengal", type: "Government", accreditation: "NAAC A", nirfScore: 77, ranking: 12, compliance: 90, students: 9800, faculty: 450, departments: 28, projects: 180, established: 1955, placement: 89 },
  { name: "University of Delhi", shortName: "DU", aisheCode: "U-0071", location: "New Delhi", type: "Government", accreditation: "NAAC A+", nirfScore: 82, ranking: 11, compliance: 93, students: 150000, faculty: 7000, departments: 90, projects: 300, established: 1922, placement: 85 },
  { name: "SRM University", shortName: "SRM", aisheCode: "U-0442", location: "Chennai", type: "Private", accreditation: "NAAC A++", nirfScore: 78, ranking: 20, compliance: 92, students: 25000, faculty: 1600, departments: 40, projects: 450, established: 1985, placement: 90 },
  { name: "Amity University Noida", shortName: "Amity", aisheCode: "U-0815", location: "Noida, UP", type: "Private", accreditation: "NAAC A+", nirfScore: 65, ranking: 35, compliance: 85, students: 30000, faculty: 2000, departments: 45, projects: 350, established: 2003, placement: 82 },
  { name: "IIT Kanpur", shortName: "IITK", aisheCode: "U-0061", location: "Kanpur, UP", type: "Government", accreditation: "NAAC A++", nirfScore: 93, ranking: 4, compliance: 97, students: 9000, faculty: 515, departments: 14, projects: 410, established: 1959, placement: 96 },

  { name: "NIT Trichy", shortName: "NITT", aisheCode: "U-0345", location: "Tamil Nadu", type: "Government", accreditation: "NAAC A+", nirfScore: 82, ranking: 8, compliance: 92, students: 10000, faculty: 550, departments: 18, projects: 250, established: 1964, placement: 94 },
  { name: "NIT Warangal", shortName: "NITW", aisheCode: "U-0347", location: "Telangana", type: "Government", accreditation: "NAAC A+", nirfScore: 79, ranking: 21, compliance: 91, students: 8000, faculty: 430, departments: 16, projects: 240, established: 1959, placement: 92 },
  { name: "IIT Madras", shortName: "IITM", aisheCode: "U-0062", location: "Chennai", type: "Government", accreditation: "NAAC A++", nirfScore: 95, ranking: 1, compliance: 98, students: 8500, faculty: 550, departments: 16, projects: 490, established: 1959, placement: 98 },
  { name: "IIT Roorkee", shortName: "IITR", aisheCode: "U-0063", location: "Roorkee, Uttarakhand", type: "Government", accreditation: "NAAC A+", nirfScore: 90, ranking: 6, compliance: 96, students: 9000, faculty: 500, departments: 22, projects: 430, established: 1847, placement: 97 },
  { name: "NIT Suratkal", shortName: "NITS", aisheCode: "U-0352", location: "Karnataka", type: "Government", accreditation: "NAAC A+", nirfScore: 77, ranking: 23, compliance: 89, students: 8500, faculty: 410, departments: 14, projects: 210, established: 1960, placement: 91 },

  { name: "IIT Guwahati", shortName: "IITG", aisheCode: "U-0064", location: "Assam", type: "Government", accreditation: "NAAC A++", nirfScore: 89, ranking: 7, compliance: 95, students: 7100, faculty: 430, departments: 11, projects: 290, established: 1994, placement: 95 },
  { name: "Manipal Institute of Technology", shortName: "MIT", aisheCode: "U-0567", location: "Karnataka", type: "Private", accreditation: "NAAC A+", nirfScore: 73, ranking: 35, compliance: 86, students: 16000, faculty: 880, departments: 28, projects: 350, established: 1957, placement: 88 },
  { name: "Lovely Professional University", shortName: "LPU", aisheCode: "U-0999", location: "Punjab", type: "Private", accreditation: "NAAC A++", nirfScore: 62, ranking: 38, compliance: 83, students: 45000, faculty: 3000, departments: 60, projects: 450, established: 2005, placement: 80 },
  { name: "Christ University", shortName: "Christ", aisheCode: "U-0712", location: "Bengaluru", type: "Private", accreditation: "NAAC A+", nirfScore: 68, ranking: 40, compliance: 87, students: 25000, faculty: 1500, departments: 45, projects: 190, established: 1969, placement: 86 },
  { name: "IISc Bangalore", shortName: "IISc", aisheCode: "U-0012", location: "Karnataka", type: "Government", accreditation: "NAAC A++", nirfScore: 97, ranking: 1, compliance: 99, students: 5000, faculty: 530, departments: 40, projects: 900, established: 1909, placement: 99 },

  { name: "IIT Patna", shortName: "IITP", aisheCode: "U-0065", location: "Bihar", type: "Government", accreditation: "NAAC A+", nirfScore: 78, ranking: 33, compliance: 90, students: 5400, faculty: 300, departments: 10, projects: 200, established: 2008, placement: 92 },
  { name: "IIT Indore", shortName: "IITI", aisheCode: "U-0066", location: "MP", type: "Government", accreditation: "NAAC A+", nirfScore: 80, ranking: 14, compliance: 92, students: 6000, faculty: 340, departments: 12, projects: 220, established: 2009, placement: 93 },
  { name: "IIT Bhubaneswar", shortName: "IITBBS", aisheCode: "U-0067", location: "Odisha", type: "Government", accreditation: "NAAC A+", nirfScore: 76, ranking: 20, compliance: 89, students: 5700, faculty: 320, departments: 11, projects: 210, established: 2008, placement: 90 },
  { name: "Delhi Technological University", shortName: "DTU", aisheCode: "U-0145", location: "Delhi", type: "Government", accreditation: "NAAC A+", nirfScore: 75, ranking: 29, compliance: 90, students: 16000, faculty: 780, departments: 28, projects: 300, established: 1941, placement: 92 },
  { name: "Jamia Millia Islamia", shortName: "JMI", aisheCode: "U-0105", location: "New Delhi", type: "Government", accreditation: "NAAC A+", nirfScore: 79, ranking: 12, compliance: 91, students: 22000, faculty: 1300, departments: 55, projects: 260, established: 1920, placement: 88 }
];

const students = [
  { name: "Rahul Sharma", apaarId: "APAAR2024001", email: "rahul.sharma@student.edu", course: "B.Tech CSE", semester: 6, cgpa: 8.5, attendance: 92, assignments: 88, achievements: ["Smart India Hackathon", "Best Project Award"], schemes: ["PM Scholarship", "Merit Scholarship"] },
  { name: "Priya Patel", apaarId: "APAAR2024002", email: "priya.patel@student.edu", course: "B.Tech ECE", semester: 4, cgpa: 9.1, attendance: 95, assignments: 96, achievements: ["Research Paper", "University Topper"], schemes: ["Merit Scholarship"] },
  { name: "Amit Kumar", apaarId: "APAAR2024003", email: "amit.kumar@student.edu", course: "B.Tech Mechanical", semester: 6, cgpa: 7.8, attendance: 85, assignments: 82, achievements: ["Sports Captain"], schemes: ["Sports Scholarship"] },
  { name: "Sneha Reddy", apaarId: "APAAR2024004", email: "sneha.reddy@student.edu", course: "M.Tech AI", semester: 2, cgpa: 9.3, attendance: 97, assignments: 95, achievements: ["AI Competition Winner"], schemes: ["Research Fellowship"] },
  { name: "Vikram Singh", apaarId: "APAAR2024005", email: "vikram.singh@student.edu", course: "B.Tech Civil", semester: 8, cgpa: 8.0, attendance: 90, assignments: 87, achievements: ["Best Design Project"], schemes: ["Industry Scholarship"] },

  { name: "Ananya Gupta", apaarId: "APAAR2024006", email: "ananya.gupta@student.edu", course: "B.Tech IT", semester: 5, cgpa: 8.8, attendance: 93, assignments: 92, achievements: ["GSoC Contributor"], schemes: ["Tech Scholarship"] },
  { name: "Harsh Verma", apaarId: "APAAR2024007", email: "harsh.verma@student.edu", course: "BCA", semester: 2, cgpa: 7.9, attendance: 88, assignments: 85, achievements: [], schemes: [] },
  { name: "Kritika Jain", apaarId: "APAAR2024008", email: "kritika.jain@student.edu", course: "MBA", semester: 3, cgpa: 8.7, attendance: 91, assignments: 90, achievements: ["Marketing Fest Winner"], schemes: [] },
  { name: "Rohit Meena", apaarId: "APAAR2024009", email: "rohit.meena@student.edu", course: "B.Tech EE", semester: 7, cgpa: 8.2, attendance: 89, assignments: 86, achievements: ["Robotics Competition"], schemes: ["PM Scholarship"] },
  { name: "Sanya Kapoor", apaarId: "APAAR2024010", email: "sanya.kapoor@student.edu", course: "BBA", semester: 1, cgpa: 8.1, attendance: 94, assignments: 93, achievements: [], schemes: ["Merit Scholarship"] },

  { name: "Tarun Yadav", apaarId: "APAAR2024011", email: "tarun.yadav@student.edu", course: "B.Tech CSE", semester: 4, cgpa: 7.6, attendance: 82, assignments: 79, achievements: [], schemes: [] },
  { name: "Riya Malhotra", apaarId: "APAAR2024012", email: "riya.malhotra@student.edu", course: "B.Tech IT", semester: 3, cgpa: 9.0, attendance: 96, assignments: 97, achievements: ["Coding Olympiad Top 10"], schemes: ["Tech Scholarship"] },
  { name: "Gaurav Singh", apaarId: "APAAR2024013", email: "gaurav.singh@student.edu", course: "B.Pharm", semester: 6, cgpa: 8.4, attendance: 91, assignments: 90, achievements: [], schemes: [] },
  { name: "Pooja Kumari", apaarId: "APAAR2024014", email: "pooja.kumari@student.edu", course: "B.Tech CSE", semester: 1, cgpa: 8.3, attendance: 97, assignments: 98, achievements: ["Hackathon Winner"], schemes: [] },
  { name: "Yash Jain", apaarId: "APAAR2024015", email: "yash.jain@student.edu", course: "M.Tech ML", semester: 3, cgpa: 9.4, attendance: 95, assignments: 96, achievements: ["Published 2 Papers"], schemes: ["Research Fellowship"] },

  { name: "Manvi Shekhar", apaarId: "APAAR2024016", email: "manvi.shekhar@student.edu", course: "B.Tech ECE", semester: 2, cgpa: 8.0, attendance: 89, assignments: 87, achievements: [], schemes: [] },
  { name: "Shivam Patel", apaarId: "APAAR2024017", email: "shivam.patel@student.edu", course: "B.Tech ME", semester: 7, cgpa: 7.7, attendance: 83, assignments: 78, achievements: [], schemes: [] },
  { name: "Latika Sinha", apaarId: "APAAR2024018", email: "latika.sinha@student.edu", course: "B.Sc CS", semester: 5, cgpa: 8.9, attendance: 92, assignments: 91, achievements: ["Research Internship"], schemes: [] },
  { name: "Raghav Tiwari", apaarId: "APAAR2024019", email: "raghav.tiwari@student.edu", course: "B.Tech CSE-AI", semester: 3, cgpa: 9.2, attendance: 96, assignments: 95, achievements: ["AI Challenge Runner-up"], schemes: [] },
  { name: "Komal Chauhan", apaarId: "APAAR2024020", email: "komal.chauhan@student.edu", course: "B.Tech IT", semester: 6, cgpa: 8.6, attendance: 90, assignments: 93, achievements: [], schemes: [] },

  { name: "Neeraj Singh", apaarId: "APAAR2024021", email: "neeraj.singh@student.edu", course: "B.Com", semester: 1, cgpa: 8.0, attendance: 88, assignments: 85, achievements: [], schemes: [] },
  { name: "Tanisha Arora", apaarId: "APAAR2024022", email: "tanisha.arora@student.edu", course: "B.Tech EEE", semester: 5, cgpa: 8.3, attendance: 92, assignments: 90, achievements: ["Paper Presentation"], schemes: [] },
  { name: "Deepak Jaiswal", apaarId: "APAAR2024023", email: "deepak.jaiswal@student.edu", course: "B.Tech CE", semester: 8, cgpa: 7.9, attendance: 87, assignments: 84, achievements: [], schemes: [] },
  { name: "Shreya Verma", apaarId: "APAAR2024024", email: "shreya.verma@student.edu", course: "B.Tech IT", semester: 4, cgpa: 9.0, attendance: 94, assignments: 96, achievements: ["Hackathon Finalist"], schemes: ["Merit Scholarship"] },
  { name: "Arjun Rathore", apaarId: "APAAR2024025", email: "arjun.rathore@student.edu", course: "B.Tech CSE", semester: 2, cgpa: 8.7, attendance: 93, assignments: 92, achievements: [], schemes: [] }
];

const teachers = [
  { name: "Dr. Anita Desai", aparId: "APAR2024001", email: "anita.desai@faculty.edu", department: "Computer Science & Engineering", designation: "Professor", publications: 45, projects: 12, hIndex: 28, experience: 15, rating: 4.7, specializations: ["Machine Learning", "Data Mining", "AI"] },
  { name: "Prof. Rajesh Kumar", aparId: "APAR2024002", email: "rajesh.kumar@faculty.edu", department: "ECE", designation: "Associate Professor", publications: 28, projects: 8, hIndex: 18, experience: 10, rating: 4.5, specializations: ["VLSI", "DSP"] },
  { name: "Dr. Meera Nair", aparId: "APAR2024003", email: "meera.nair@faculty.edu", department: "Mechanical Engineering", designation: "Professor", publications: 52, projects: 15, hIndex: 32, experience: 18, rating: 4.8, specializations: ["Thermal Engg", "Robotics"] },
  { name: "Dr. Suresh Iyer", aparId: "APAR2024004", email: "suresh.iyer@faculty.edu", department: "AI & ML", designation: "Assistant Professor", publications: 18, projects: 5, hIndex: 12, experience: 6, rating: 4.4, specializations: ["DL", "NLP", "CV"] },
  { name: "Prof. Kavita Sharma", aparId: "APAR2024005", email: "kavita.sharma@faculty.edu", department: "Civil Engineering", designation: "Professor", publications: 60, projects: 18, hIndex: 35, experience: 20, rating: 4.9, specializations: ["Structural Engg"] },

  { name: "Dr. Arun Prakash", aparId: "APAR2024006", email: "arun.prakash@faculty.edu", department: "Chemical Engineering", designation: "Associate Professor", publications: 34, projects: 10, hIndex: 22, experience: 12, rating: 4.6, specializations: ["Process Engg"] },
  { name: "Dr. Nidhi Verma", aparId: "APAR2024007", email: "nidhi.verma@faculty.edu", department: "Computer Science", designation: "Assistant Professor", publications: 20, projects: 4, hIndex: 15, experience: 7, rating: 4.3, specializations: ["Web Dev", "Cloud"] },
  { name: "Dr. Alok Tandon", aparId: "APAR2024008", email: "alok.tandon@faculty.edu", department: "Mathematics", designation: "Professor", publications: 40, projects: 6, hIndex: 25, experience: 14, rating: 4.7, specializations: ["Applied Math"] },
  { name: "Prof. Ritu Sharma", aparId: "APAR2024009", email: "ritu.sharma@faculty.edu", department: "IT", designation: "Associate Professor", publications: 22, projects: 7, hIndex: 17, experience: 9, rating: 4.4, specializations: ["Cybersecurity"] },
  { name: "Dr. Mohan Singh", aparId: "APAR2024010", email: "mohan.singh@faculty.edu", department: "ECE", designation: "Professor", publications: 55, projects: 16, hIndex: 34, experience: 19, rating: 4.9, specializations: ["Communication Systems"] },

  { name: "Dr. Sneha Kulkarni", aparId: "APAR2024011", email: "sneha.kulkarni@faculty.edu", department: "AI", designation: "Assistant Professor", publications: 15, projects: 5, hIndex: 11, experience: 5, rating: 4.2, specializations: ["LLMs", "AI Ethics"] },
  { name: "Prof. Deepak Rao", aparId: "APAR20240112", email: "deepak.rao@faculty.edu", department: "Mechanical", designation: "Associate Professor", publications: 25, projects: 8, hIndex: 19, experience: 11, rating: 4.6, specializations: ["CAD/CAM"] },
  { name: "Dr. Kanika Bhatia", aparId: "APAR2024013", email: "kanika.bhatia@faculty.edu", department: "Civil", designation: "Professor", publications: 50, projects: 14, hIndex: 29, experience: 17, rating: 4.8, specializations: ["Environmental Engg"] },
  { name: "Dr. Vivek Rana", aparId: "APAR2024014", email: "vivek.rana@faculty.edu", department: "CSE", designation: "Assistant Professor", publications: 12, projects: 3, hIndex: 9, experience: 4, rating: 4.1, specializations: ["Networks"] },
  { name: "Prof. Smita Roy", aparId: "APAR2024015", email: "smita.roy@faculty.edu", department: "IT", designation: "Professor", publications: 42, projects: 13, hIndex: 30, experience: 18, rating: 4.7, specializations: ["Cloud Computing"] },

  { name: "Dr. Farhan Ali", aparId: "APAR2024016", email: "farhan.ali@faculty.edu", department: "EEE", designation: "Professor", publications: 48, projects: 12, hIndex: 27, experience: 16, rating: 4.8, specializations: ["Power Systems"] },
  { name: "Prof. Manish Jain", aparId: "APAR2024017", email: "manish.jain@faculty.edu", department: "Physics", designation: "Associate Professor", publications: 26, projects: 7, hIndex: 18, experience: 10, rating: 4.5, specializations: ["Quantum Physics"] },
  { name: "Dr. Asha Menon", aparId: "APAR2024018", email: "asha.menon@faculty.edu", department: "Chemistry", designation: "Professor", publications: 45, projects: 11, hIndex: 29, experience: 14, rating: 4.7, specializations: ["Organic Chemistry"] },
  { name: "Dr. Gopal Mishra", aparId: "APAR2024019", email: "gopal.mishra@faculty.edu", department: "CSE", designation: "Professor", publications: 52, projects: 15, hIndex: 35, experience: 20, rating: 4.9, specializations: ["AI", "Cloud"] },
  { name: "Prof. Anita Raj", aparId: "APAR2024020", email: "anita.raj@faculty.edu", department: "Business", designation: "Associate Professor", publications: 18, projects: 4, hIndex: 12, experience: 6, rating: 4.3, specializations: ["Finance"] },

  { name: "Dr. Neha Kapoor", aparId: "APAR2024021", email: "neha.kapoor@faculty.edu", department: "AI", designation: "Assistant Professor", publications: 10, projects: 2, hIndex: 8, experience: 3, rating: 4.1, specializations: ["Data Science"] },
  { name: "Dr. Abhishek Kumar", aparId: "APAR2024022", email: "abhishek.kumar@faculty.edu", department: "CSE", designation: "Associate Professor", publications: 38, projects: 10, hIndex: 24, experience: 12, rating: 4.6, specializations: ["Distributed Systems"] },
  { name: "Prof. Radhika Yadav", aparId: "APAR2024023", email: "radhika.yadav@faculty.edu", department: "ECE", designation: "Assistant Professor", publications: 14, projects: 3, hIndex: 10, experience: 5, rating: 4.2, specializations: ["Signal Processing"] },
  { name: "Dr. Naveen Saxena", aparId: "APAR2024024", email: "naveen.saxena@faculty.edu", department: "Mechanical", designation: "Professor", publications: 57, projects: 17, hIndex: 33, experience: 19, rating: 4.8, specializations: ["Manufacturing"] },
  { name: "Dr. Zoya Qureshi", aparId: "APAR2024025", email: "zoya.qureshi@faculty.edu", department: "IT", designation: "Associate Professor", publications: 29, projects: 9, hIndex: 19, experience: 11, rating: 4.5, specializations: ["Software Engineering"] }
];
// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    // console.log('🗑️  Clearing existing data...');
    // await Student.deleteMany({});
    // await Institution.deleteMany({});
    // await Teacher.deleteMany({});
    // console.log('✅ Cleared existing data\n');

    // Insert institutions
    console.log('🏛️  Inserting institutions...');
    const createdInstitutions = await Institution.insertMany(institutions);
    console.log(`✅ Inserted ${createdInstitutions.length} institutions\n`);

    // Insert students (link to first institution)
    console.log('👨‍🎓 Inserting students...');
    const studentsWithInstitution = students.map(s => ({
      ...s,
      institutionId: createdInstitutions[0]._id
    }));
    const createdStudents = await Student.insertMany(studentsWithInstitution);
    console.log(`✅ Inserted ${createdStudents.length} students\n`);

    // Insert teachers (link to first institution)
    console.log('👨‍🏫 Inserting teachers...');
    const teachersWithInstitution = teachers.map(t => ({
      ...t,
      institutionId: createdInstitutions[0]._id
    }));
    const createdTeachers = await Teacher.insertMany(teachersWithInstitution);
    console.log(`✅ Inserted ${createdTeachers.length} teachers\n`);

    console.log('='.repeat(50));
    console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log(`📊 Summary:`);
    console.log(`   - Institutions: ${createdInstitutions.length}`);
    console.log(`   - Students: ${createdStudents.length}`);
    console.log(`   - Teachers: ${createdTeachers.length}`);
    console.log('='.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();