const Admin = require("../models/Admin");
const Employee = require("../models/Employee");
const generateToken = require("../utils/generateToken");

const registerAdmin = async (req, res) => {
  try {
    const { employeeId, fullName, officialEmail, password, department } =
      req.body;

    if (!employeeId || !fullName || !officialEmail || !password || !department) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const employeeExists = await Employee.findOne({
      employeeId,
      officialEmail,
    });

    if (!employeeExists) {
      return res.status(400).json({
        message:
          "Employee ID or Official Email not found in authorized employee records",
      });
    }

    const adminExists = await Admin.findOne({
      $or: [{ officialEmail }, { employeeId }],
    });

    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = await Admin.create({
      employeeId,
      fullName,
      officialEmail,
      password,
      department,
    });

    if (admin) {
      res.status(201).json({
        _id: admin._id,
        employeeId: admin.employeeId,
        fullName: admin.fullName,
        officialEmail: admin.officialEmail,
        department: admin.department,
        role: admin.role,
        token: generateToken(admin._id),
      });
    } else {
      res.status(400).json({ message: "Invalid admin data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { officialEmail, password } = req.body;

    if (!officialEmail || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ officialEmail });

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        employeeId: admin.employeeId,
        fullName: admin.fullName,
        officialEmail: admin.officialEmail,
        department: admin.department,
        role: admin.role,
        token: generateToken(admin._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-password");

    if (admin) {
      res.json(admin);
    } else {
      res.status(404).json({ message: "Admin not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerAdmin, loginAdmin, getAdminProfile };
