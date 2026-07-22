CREATE TABLE "User" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "HealthLog" (
  "id" SERIAL NOT NULL,
  "gender" TEXT,
  "age" INTEGER,
  "hypertension" INTEGER,
  "heartDisease" INTEGER,
  "smokingHistory" TEXT,
  "bmi" DOUBLE PRECISION,
  "hba1cLevel" DOUBLE PRECISION,
  "bloodGlucoseLevel" DOUBLE PRECISION,
  "prediction" INTEGER,
  "probability" DOUBLE PRECISION,
  "riskLevel" TEXT,
  "recommendation" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" INTEGER,

  CONSTRAINT "HealthLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Medication" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "dosage" TEXT,
  "frequency" TEXT,
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" INTEGER,

  CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Reminder" (
  "id" SERIAL NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "reminderAt" TIMESTAMP(3),
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" INTEGER,

  CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "HealthLog"
  ADD CONSTRAINT "HealthLog_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Medication"
  ADD CONSTRAINT "Medication_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Reminder"
  ADD CONSTRAINT "Reminder_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
