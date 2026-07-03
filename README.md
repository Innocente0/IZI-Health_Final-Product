# IZI Health

IZI Health is a web-based healthcare navigation and NCD support platform designed for Kigali, Rwanda. The system helps users search healthcare facilities, view facility profiles, chat with a healthcare navigation assistant, record diabetes-related health logs, receive ML-based risk feedback, manage medications, set reminders, and generate weekly health reports.

Video Demo: https://drive.google.com/drive/folders/1IZGKCo4Z1agbVpTTtLIb0hZtmbrUd1_u?usp=sharing

## Main Features

- User registration and login
- Healthcare facility search
- Facility profile viewing
- Chatbot-based health navigation
- MedQuAD-based healthcare question answering
- Diabetes health log tracking
- ML-based diabetes risk prediction
- Medication management
- Medication reminders
- Warning signs checklist
- Weekly health report
- Diabetes education page
- Admin dashboard

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- CSS
- Lucide React icons

### Backend
- Node.js
- Express.js
- CORS
- Axios

### ML Service
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

```text
izi-health-final/
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── package.json
|   ├── index.html
│   └── package.json
│    
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── seedFacilities.js
│   │   └── routes/
│   │       └── chatRoutes.js
│   ├── package.json
|   ├── package-lock.json
│   └── .env. example
│
├── ml-service/
│   ├── main.py
│   ├── train_diabetes.py
│   ├── train_chatbot.py
│   ├── chatbot_analysis.py
│   ├── chatbot_model_comparison.py
│   ├── data/
│   │   ├── medquad.csv
|       ├── diabetes_prediction_dataset.csv
|       ├── disease_specialist_dataset.csv
|       ├── disease_symptom_and_patient_profile_dataset.csv
|       └── heart_disease.csv
│   ├── models/
│   │   ├── diabetes_model.pkl
│   │   └── chatbot_qa_model.pkl
│   └── outputs/
│
└── README.md
```
## Project Structure

You need to run three terminal at the same time: 
1. Backend

cd backend
npm install
npm run dev
Open at: http://localhost:4000

2. Frontend

cd frontend
npm install
npm run dev
Open at: http://localhost:5173 

3. ML service

cd ml-service
venv\Scripts\activate
uvicorn main:app --reload --port 8000
Open at: http://localhost:8000 or http://localhost:8000/docs

## Admin Page

Email: admin@izihealth.rw
Password: admin123

Open at: http://localhost:5173/admin
