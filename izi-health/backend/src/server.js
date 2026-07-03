const express = require("express");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

const chatRoutes = require("./routes/chatRoutes");
const facilities = require("./seedFacilities");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

let users = [
  {
    id: 1,
    name: "Admin",
    email: "admin@izihealth.rw",
    password: "admin123",
    role: "ADMIN",
  },
];

let logs = [];
let reminders = [];
let medications = [];

app.get("/", (req, res) => {
  res.json({ message: "IZI Health API is running" });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (users.find((u) => u.email === email)) {
    return res.status(409).json({ message: "Email already exists." });
  }

  const user = {
    id: users.length + 1,
    name,
    email,
    password,
    role: "USER",
  };

  users.push(user);

  res.json({
    token: "demo-token",
    user,
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  res.json({
    token: "demo-token",
    user,
  });
});

app.get("/api/facilities", (req, res) => {
  const q = (req.query.q || "").toLowerCase();

  const results = facilities.filter((f) => {
    const searchable = (
      f.name +
      " " +
      f.type +
      " " +
      f.district +
      " " +
      f.services.join(" ") +
      " " +
      f.specialists.join(" ") +
      " " +
      f.insurance.join(" ")
    ).toLowerCase();

    return searchable.includes(q);
  });

  res.json(results);
});

app.get("/api/facilities/:id", (req, res) => {
  const facility = facilities.find((f) => f.id == req.params.id);
  res.json(facility);
});

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/health-logs", async (req, res) => {
  try {
    const log = {
      id: Date.now(),
      ...req.body,
    };

    let prediction = null;

    try {
      const axios = require("axios");

      const mlResponse = await axios.post("http://localhost:8000/predict-diabetes", {
        gender: req.body.gender || "Female",
        age: Number(req.body.age || 35),
        hypertension: Number(req.body.hypertension || 0),
        heart_disease: Number(req.body.heart_disease || 0),
        smoking_history: req.body.smoking_history || "never",
        bmi: Number(req.body.bmi || 25),
        HbA1c_level: Number(req.body.HbA1c_level || 5.5),
        blood_glucose_level: Number(req.body.glucose || req.body.blood_glucose_level || 100),
      });

      prediction = mlResponse.data;
    } catch (mlError) {
      prediction = {
        riskLevel: "Prediction unavailable",
        recommendation: "ML service is not available right now.",
      };
    }

    const savedLog = {
      ...log,
      prediction,
    };

    logs.unshift(savedLog);

    res.json(savedLog);
  } catch (error) {
    res.status(500).json({
      message: "Could not save health log.",
    });
  }
});

app.get("/api/health-logs", (req, res) => {
  res.json(logs);
});

app.post("/api/medications", (req, res) => {
  const medication = {
    id: Date.now(),
    ...req.body,
  };

  medications.unshift(medication);
  res.json(medication);
});

app.get("/api/medications", (req, res) => {
  res.json(medications);
});

app.post("/api/reminders", (req, res) => {
  const reminder = {
    id: Date.now(),
    ...req.body,
  };

  reminders.unshift(reminder);
  res.json(reminder);
});

app.get("/api/reminders", (req, res) => {
  res.json(reminders);
});

app.use("/api/chat", chatRoutes);

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

// Keeps backend process alive for nodemon on your setup
setInterval(() => {}, 1000);