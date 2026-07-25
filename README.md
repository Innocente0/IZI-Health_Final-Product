# IZI Health

IZI Health is a web-based healthcare navigation and NCD support platform for Kigali, Rwanda. It helps users search healthcare facilities, view facility profiles, ask a healthcare navigation chatbot, record diabetes-related health logs, receive ML-based risk feedback, manage medications, set reminders, and review weekly health summaries.

Live frontend:

```txt
https://izi-health.onrender.com
```

Backend API:

```txt
https://izi-health-backend.onrender.com
```

ML service:

```txt
https://izi-health-ml.onrender.com
```

Video demo:

```txt
https://drive.google.com/drive/folders/1IZGKCo4Z1agbVpTTtLIb0hZtmbrUd1_u?usp=sharing
```

## Features

- User registration and login
- JWT-based backend authentication
- Healthcare facility search and facility profile viewing
- Chatbot-based health navigation
- MedQuAD-based healthcare question answering
- Diabetes health log tracking
- ML-based diabetes risk prediction
- Medication management
- Medication reminders
- Warning signs checklist
- Weekly health report
- Diabetes education page
- Admin dashboard prototype

## Technology Stack

Frontend:

- React
- Vite
- JavaScript
- CSS
- Lucide React icons

Backend:

- Node.js
- Express.js
- Prisma
- PostgreSQL
- JWT
- bcryptjs
- CORS
- Axios

ML service:

- Python
- FastAPI
- Scikit-learn
- Pandas
- NumPy
- Joblib
- Sentence Transformers
- MedQuAD dataset
- Diabetes prediction dataset

## Project Structure

```txt
izi-health/
  frontend/
    src/
      assets/
      components/
      main.jsx
      styles.css
    package.json
  backend/
    prisma/
      migrations/
      schema.prisma
    src/
      lib/
      routes/
      seedFacilities.js
      server.js
    package.json
  ml-service/
    data/
    models/
    outputs/
    main.py
    requirements.txt
    train_diabetes.py
    train_chatbot_qa.py
  docs/
    API_SMOKE_TESTS.md
    DEPLOYMENT.md
```

## Local Development

Run the backend:

```bash
cd izi-health/backend
npm install
npm run dev
```

Run the frontend:

```bash
cd izi-health/frontend
npm install
npm run dev
```

Run the ML service:

```bash
cd izi-health/ml-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Environment Variables

Frontend:

```env
VITE_API_URL=http://localhost:4000
```

Backend:

```env
PORT=4000
DATABASE_URL=postgresql://...
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=http://localhost:5173
ML_SERVICE_URL=http://localhost:8000
CHATBOT_TIMEOUT_MS=15000
```

## Deployment

Deployment instructions are in:

```txt
izi-health/docs/DEPLOYMENT.md
```

Post-deployment API checks are in:

```txt
izi-health/docs/API_SMOKE_TESTS.md
```

## Medical Safety Boundary

IZI Health provides care navigation and health education support only. It does not diagnose conditions, prescribe medication, or replace care from a qualified healthcare professional. Users should seek emergency care immediately for urgent symptoms such as chest pain, difficulty breathing, fainting, stroke-like symptoms, or severe bleeding.

## Known Limitations

- The admin dashboard is still partly prototype-level.
- Some NCD views still use browser storage for display convenience and should be fully synchronized with backend APIs.
- The ML chatbot can be slow on Render free plans because Sentence-BERT is heavy and services cold-start.
- No automated test suite is fully wired yet; smoke-test instructions are provided.
- Password reset, email verification, and fine-grained role permissions are not implemented yet.
