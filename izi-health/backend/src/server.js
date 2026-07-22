require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = require("./lib/prisma");
const chatRoutes = require("./routes/chatRoutes");
const facilities = require("./seedFacilities");

const app = express();

const PORT = process.env.PORT || 4000;

const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || "http://localhost:8000";
const JWT_SECRET = process.env.JWT_SECRET || "izi_health_secret";

const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
  })
);
app.use(express.json());

function toSafeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({
      message: "Admin access required.",
    });
  }

  return next();
}

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

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = String(password).trim();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists.",
      });
    }

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: await bcrypt.hash(normalizedPassword, 10),
        role: "USER",
      },
    });

    return res.status(201).json({
      token: signToken(user),
      user: toSafeUser(user),
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Could not register user.",
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = String(password).trim();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    const passwordMatches =
      user &&
      (user.password === normalizedPassword ||
        (user.password.startsWith("$2") &&
          (await bcrypt.compare(normalizedPassword, user.password))));

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    return res.json({
      token: signToken(user),
      user: toSafeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Could not log in.",
    });
  }
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

app.get("/api/users", authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(users);
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      message: "Could not retrieve users.",
    });
  }
});

app.post("/api/health-logs", authenticate, async (req, res) => {
  try {

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

    const savedLog = await prisma.healthLog.create({
  data: {
    gender: req.body.gender || null,
    age: req.body.age ? Number(req.body.age) : null,
    hypertension:
      req.body.hypertension !== undefined
        ? Number(req.body.hypertension)
        : null,
    heartDisease:
      req.body.heart_disease !== undefined
        ? Number(req.body.heart_disease)
        : null,
    smokingHistory: req.body.smoking_history || null,
    bmi: req.body.bmi ? Number(req.body.bmi) : null,
    hba1cLevel: req.body.HbA1c_level
      ? Number(req.body.HbA1c_level)
      : null,
    bloodGlucoseLevel:
      req.body.glucose || req.body.blood_glucose_level
        ? Number(
            req.body.glucose ||
              req.body.blood_glucose_level
          )
        : null,

    prediction:
      prediction?.prediction !== undefined &&
      prediction?.prediction !== null
        ? Number(prediction.prediction)
        : null,

    probability:
      prediction?.probability !== undefined &&
      prediction?.probability !== null
        ? Number(prediction.probability)
        : null,

    riskLevel:
      prediction?.riskLevel ||
      prediction?.risk_level ||
      null,

    recommendation:
      prediction?.recommendation || null,

    userId: req.user.id,
  },
});

return res.status(201).json(savedLog);    //Added this line to return the saved log with prediction details
  } catch (error) {
    console.error("Health log error:", error);

    return res.status(500).json({
      message: "Could not save health log.",
    });
  }
});

app.get("/api/health-logs", authenticate, async (req, res) => {
  try {
    const where =
      req.user.role === "ADMIN"
        ? req.query.userId
          ? {
              userId: Number(req.query.userId),
            }
          : {}
        : {
            userId: req.user.id,
          };

    const logs = await prisma.healthLog.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(logs);
  } catch (error) {
    console.error("Get health logs error:", error);

    return res.status(500).json({
      message: "Could not retrieve health logs.",
    });
  }
});

app.post("/api/medications", authenticate, async (req, res) => {
  try {
    const {
      name,
      dosage,
      frequency,
      startDate,
      endDate,
      notes,
      userId,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Medication name is required.",
      });
    }

    const medication = await prisma.medication.create({
      data: {
        name: name.trim(),
        dosage: dosage || null,
        frequency: frequency || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        notes: notes || null,
        userId: req.user.id,
      },
    });

    return res.status(201).json(medication);
  } catch (error) {
    console.error("Create medication error:", error);

    return res.status(500).json({
      message: "Could not save medication.",
      error: error.message,
    });
  }
});

app.get("/api/medications", authenticate, async (req, res) => {
  try {
    const where =
      req.user.role === "ADMIN" && req.query.userId
        ? {
            userId: Number(req.query.userId),
          }
        : {
            userId: req.user.id,
          };

    const medications = await prisma.medication.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(medications);
  } catch (error) {
    console.error("Get medications error:", error);

    return res.status(500).json({
      message: "Could not retrieve medications.",
      error: error.message,
    });
  }
});

app.post("/api/reminders", authenticate, async (req, res) => {
  try {
    const {
      title,
      description,
      reminderDate,
      completed,
      userId,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Reminder title is required.",
      });
    }

    if (!reminderDate) {
      return res.status(400).json({
        message: "Reminder date is required.",
      });
    }

    const reminder = await prisma.reminder.create({
      data: {
        title: title.trim(),
        description: description || null,
        reminderAt: new Date(reminderDate),
        completed:
          completed !== undefined ? Boolean(completed) : false,
        userId: req.user.id,
      },
    });

    return res.status(201).json(reminder);
  } catch (error) {
    console.error("Create reminder error:", error);

    return res.status(500).json({
      message: "Could not save reminder.",
      error: error.message,
    });
  }
});

app.get("/api/reminders", authenticate, async (req, res) => {
  try {
    const where =
      req.user.role === "ADMIN" && req.query.userId
        ? {
            userId: Number(req.query.userId),
          }
        : {
            userId: req.user.id,
          };

    const reminders = await prisma.reminder.findMany({
      where,
      orderBy: {
        reminderAt: "asc",
      },
    });

    return res.json(reminders);
  } catch (error) {
    console.error("Get reminders error:", error);

    return res.status(500).json({
      message: "Could not retrieve reminders.",
      error: error.message,
    });
  }
});

app.use("/api/chat", chatRoutes);

app.get("/api/db-health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      status: "healthy",
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    return res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
    });
  }
});

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
