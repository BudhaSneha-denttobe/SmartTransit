const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/bustrack");

const busSchema = new mongoose.Schema({
  busNumber: String,
  route: String,
  stops: [String],
  timings: [String],
  from: String,
  to: String,
  operator: String,
  type: String,
});

const Bus = mongoose.model("Bus", busSchema);

const buses = [
  {
    busNumber: "48R",
    route: "Singh Nagar - Benz Circle - Patamata",
    from: "Singh Nagar",
    to: "Patamata",
    operator: "APSRTC",
    type: "City Ordinary",
    stops: ["Singh Nagar", "Pipula Road", "Gurunanak Colony", "ITI Junction", "Benz Circle", "Patamata"],
    timings: ["05:45", "06:15", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00"],
  },
  {
    busNumber: "48K",
    route: "Singh Nagar - Railway Station - KR Market",
    from: "Singh Nagar",
    to: "KR Market",
    operator: "APSRTC",
    type: "City Ordinary",
    stops: ["Singh Nagar", "Pipula Road", "Autonagar", "Railway Station", "Governorpet", "KR Market"],
    timings: ["06:00", "06:45", "07:20", "08:00", "08:40", "09:15", "10:00"],
  },
  {
    busNumber: "12C",
    route: "Singh Nagar - Budameru - City Center",
    from: "Singh Nagar",
    to: "City Center",
    operator: "APSRTC",
    type: "City Ordinary",
    stops: ["Singh Nagar", "Pipula Road", "Metro Junction", "Food Junction", "Budameru", "City Center"],
    timings: ["07:20", "07:50", "08:10", "08:45", "09:20", "10:05"],
  },
  {
    busNumber: "300",
    route: "Singh Nagar - Autonagar - Nunna",
    from: "Singh Nagar",
    to: "Nunna",
    operator: "APSRTC",
    type: "City Ordinary",
    stops: ["Singh Nagar", "Pipula Road", "Autonagar", "Velagaleru", "Nunna"],
    timings: ["07:00", "08:00", "09:00", "10:00", "11:00"],
  },
  {
    busNumber: "66",
    route: "Benz Circle - Autonagar - Singh Nagar",
    from: "Benz Circle",
    to: "Singh Nagar",
    operator: "APSRTC",
    type: "City Ordinary",
    stops: ["Benz Circle", "ITI Junction", "Autonagar", "Pipula Road", "Singh Nagar"],
    timings: ["06:30", "07:10", "07:50", "08:20", "09:00"],
  },
  {
    busNumber: "10A",
    route: "Patamata - Benz Circle - Singh Nagar - Railway Station",
    from: "Patamata",
    to: "Railway Station",
    operator: "APSRTC",
    type: "City Ordinary",
    stops: ["Patamata", "Benz Circle", "Gurunanak Colony", "Singh Nagar", "Pipula Road", "Autonagar", "Railway Station"],
    timings: ["06:00", "07:30", "08:00", "08:30", "09:00", "09:30"],
  },
];

async function seed() {
  await Bus.deleteMany({});
  await Bus.insertMany(buses);
  console.log("✅ Database seeded with", buses.length, "buses");
  console.log("Routes include: Singh Nagar, Benz Circle, Patamata, Railway Station, KR Market, Autonagar, Budameru");
  mongoose.disconnect();
}

seed().catch(console.error);