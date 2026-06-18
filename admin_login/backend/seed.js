const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Admin = require("./models/Admin");
const Employee = require("./models/Employee");
const Bus = require("./models/Bus");

dotenv.config();

const employees = [
  {
    employeeId: "EMP001",
    fullName: "Rajesh Kumar",
    officialEmail: "rajesh.kumar@transport.gov",
    department: "Transport Department",
  },
  {
    employeeId: "EMP002",
    fullName: "Priya Sharma",
    officialEmail: "priya.sharma@transport.gov",
    department: "Transport Department",
  },
  {
    employeeId: "EMP003",
    fullName: "Amit Patel",
    officialEmail: "amit.patel@transport.gov",
    department: "Route Planning",
  },
  {
    employeeId: "EMP004",
    fullName: "Sunita Reddy",
    officialEmail: "sunita.reddy@transport.gov",
    department: "Fleet Management",
  },
  {
    employeeId: "EMP005",
    fullName: "Vikram Singh",
    officialEmail: "vikram.singh@transport.gov",
    department: "Operations",
  },
];

const buses = [
  {
    busNumber: "AP39AB1234",
    busName: "Vijayawada Express",
    busType: "Express",
    source: "Vijayawada",
    destination: "Hyderabad",
    departureTime: "06:00",
    arrivalTime: "11:30",
    driverName: "Suresh Rao",
    status: "Active",
  },
  {
    busNumber: "AP39CD5678",
    busName: "Guntur AC Comfort",
    busType: "AC",
    source: "Guntur",
    destination: "Chennai",
    departureTime: "07:30",
    arrivalTime: "15:00",
    driverName: "Manoj Reddy",
    status: "Active",
  },
  {
    busNumber: "AP39EF9012",
    busName: "Vizag Night Rider",
    busType: "Sleeper",
    source: "Visakhapatnam",
    destination: "Banglore",
    departureTime: "21:00",
    arrivalTime: "06:30",
    driverName: "Venkat Ramana",
    status: "Active",
  },
  {
    busNumber: "AP39GH3456",
    busName: "Tirupati AC Service",
    busType: "AC",
    source: "Tirupati",
    destination: "Hyderabad",
    departureTime: "05:00",
    arrivalTime: "11:00",
    driverName: "Nagarjuna",
    status: "Delayed",
  },
  {
    busNumber: "AP39IJ7890",
    busName: "Kurnool Express",
    busType: "Express",
    source: "Kurnool",
    destination: "Banglore",
    departureTime: "08:00",
    arrivalTime: "16:30",
    driverName: "Ravi Teja",
    status: "Active",
  },
  {
    busNumber: "AP39KL1234",
    busName: "Nellore Comfort",
    busType: "Sleeper",
    source: "Nellore",
    destination: "Chennai",
    departureTime: "22:00",
    arrivalTime: "04:30",
    driverName: "Srinivas",
    status: "Maintenance",
  },
  {
    busNumber: "AP39MN5678",
    busName: "Kadapa Express",
    busType: "Express",
    source: "Kadapa",
    destination: "Hyderabad",
    departureTime: "09:30",
    arrivalTime: "15:00",
    driverName: "Prakash",
    status: "Active",
  },
  {
    busNumber: "AP39OP9012",
    busName: "Rajahmundry AC",
    busType: "AC",
    source: "Rajahmundry",
    destination: "Vijayawada",
    departureTime: "10:00",
    arrivalTime: "12:30",
    driverName: "Murali",
    status: "Active",
  },
];

const admins = [
  {
    employeeId: "EMP001",
    fullName: "Rajesh Kumar",
    officialEmail: "admin@smarttransit.com",
    password: "admin123",
    department: "Transport Department",
    role: "admin",
  },
  {
    employeeId: "EMP002",
    fullName: "Priya Sharma",
    officialEmail: "priya@smarttransit.com",
    password: "priya123",
    department: "Transport Department",
    role: "admin",
  },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await Admin.deleteMany();
    await Employee.deleteMany();
    await Bus.deleteMany();

    await Employee.insertMany(employees);
    console.log("Employee records seeded");

    await Bus.insertMany(buses);
    console.log("Bus records seeded");

    for (const adminData of admins) {
      await Admin.create(adminData);
    }
    console.log("Admin accounts seeded");

    console.log("Data seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
