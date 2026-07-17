const express = require("express");
const cors = require("cors");
const http = require("http");
const axios = require("axios");
require("dotenv").config();

const chatRoutes = require("./routes/chatRoutes");
const facilities = require("./seedFacilities");

const app = express();

const PORT = process.env.PORT || 4000;

const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || "http://localhost:8000";

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
  res.json({
    message: "IZI Health API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    mlServiceUrl: ML_SERVICE_URL,
  });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (
    users.find(
      (user) => user.email.toLowerCase() === normalizedEmail
    )
  ) {
    return res.status(409).json({
      message: "Email already exists.",
    });
  }

  const user = {
    id: Date.now(),
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: "USER",
  };

  users.push(user);

  return res.status(201).json({
    token: "demo-token",
    user,
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = users.find(
    (existingUser) =>
      existingUser.email.toLowerCase() === normalizedEmail &&
      existingUser.password === password
  );

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password.",
    });
  }

  return res.json({
    token: "demo-token",
    user,
  });
});

app.get("/api/facilities", (req, res) => {
  const q = String(req.query.q || "").toLowerCase();

  const results = facilities.filter((facility) => {
    const searchable = [
      facility.name,
      facility.type,
      facility.district,
      ...(facility.services || []),
      ...(facility.specialists || []),
      ...(facility.insurance || []),
    ]
      .join(" ")
      .toLowerCase();

    return searchable.includes(q);
  });

  res.json(results);
});

app.get("/api/facilities/:id", (req, res) => {
  const facility = facilities.find(
    (item) => String(item.id) === String(req.params.id)
  );

  if (!facility) {
    return res.status(404).json({
      message: "Facility not found.",
    });
  }

  return res.json(facility);
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

    let prediction;

    try {
      const mlResponse = await axios.post(
        `${ML_SERVICE_URL}/predict-diabetes`,
        {
          gender: req.body.gender || "Female",
          age: Number(req.body.age || 35),
          hypertension: Number(req.body.hypertension || 0),
          heart_disease: Number(req.body.heart_disease || 0),
          smoking_history:
            req.body.smoking_history || "never",
          bmi: Number(req.body.bmi || 25),
          HbA1c_level: Number(req.body.HbA1c_level || 5.5),
          blood_glucose_level: Number(
            req.body.glucose ||
              req.body.blood_glucose_level ||
              100
          ),
        },
        {
          timeout: 60000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      prediction = mlResponse.data;
    } catch (mlError) {
      console.error(
        "Diabetes prediction failed:",
        mlError.response?.data || mlError.message
      );

      prediction = {
        prediction: null,
        probability: null,
        riskLevel: "Prediction unavailable",
        recommendation:
          "The ML service is temporarily unavailable. Your health log was still saved.",
      };
    }

    const savedLog = {
      ...log,
      prediction,
    };

    logs.unshift(savedLog);

    return res.status(201).json(savedLog);
  } catch (error) {
    console.error("Health log error:", error);

    return res.status(500).json({
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

  res.status(201).json(medication);
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

  res.status(201).json(reminder);
});

app.get("/api/reminders", (req, res) => {
  res.json(reminders);
});

app.use("/api/chat", chatRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "API route not found.",
  });
});

const server = http.createServer(app);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`IZI Health backend running on port ${PORT}`);
  console.log(`ML service URL: ${ML_SERVICE_URL}`);
});