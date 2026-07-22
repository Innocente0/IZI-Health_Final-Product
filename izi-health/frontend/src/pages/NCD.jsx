import { useMemo, useState } from "react";
import { Activity, AlertTriangle, BarChart3, Bell, BookOpen, Calendar, Clock, Droplet, HeartPulse, Home as HomeIcon, Pill, Plus, Settings, Trash2 } from "lucide-react";
import SafetyNotice from "../components/SafetyNotice.jsx";
import { API_URL, KEY, authHeaders, getStored, setStored } from "../config.js";

const get = getStored;
const set = setStored;
export default function NCD({user}) {
  const [tab, setTab] = useState('dashboard');

  return (
    <main className="ncdPage">
      <aside className="ncdSide">
        <h2><HeartPulse/> NCD Support</h2>
        <p>Diabetes care support</p>

        {[
          ['dashboard', HomeIcon, 'Dashboard'],
          ['glucose', Droplet, 'Blood Glucose Log'],
          ['meds', Pill, 'Medications'],
          ['reminders', Bell, 'Reminders'],
          ['warning', AlertTriangle, 'Warning Signs'],
          ['report', BarChart3, 'Weekly Report'],
          ['education', BookOpen, 'Education'],
          ['settings', Settings, 'Settings']
        ].map(([id, Icon, label]) => (
          <button
            className={tab === id ? 'sel' : ''}
            onClick={() => setTab(id)}
            key={id}
          >
            <Icon size={18}/>{label}
          </button>
        ))}

        <div className="guidance">
          <MessageCircle/>Need guidance?
          <button onClick={() => window.dispatchEvent(new Event('open-chat'))}>
            Ask Navigator
          </button>
        </div>
      </aside>

      <section className="ncdContent">
        <SafetyNotice />
        {tab === 'dashboard' && <NCDDashboard user={user} setTab={setTab}/>}
        {tab === 'glucose' && <Glucose user={user}/>}
        {tab === 'meds' && <Meds user={user}/>}
        {tab === 'reminders' && <Reminders user={user}/>}
        {tab === 'warning' && <Warning user={user}/>}
        {tab === 'report' && <WeeklyReport user={user}/>}
        {tab === 'education' && <Education/>}
        {tab === 'settings' && <UserSettings/>}
      </section>
    </main>
  );
}

function userKey(k, u) {
  return k + "_" + u.email;
}

function NCDDashboard({ user, setTab }) {
  const logs = get(userKey(KEY.logs, user), []);
  const meds = get(userKey(KEY.meds, user), []);
  const rems = get(userKey(KEY.reminders, user), []);
  const chats = get(KEY.chat, []);

  const glucoseValues = logs.map((log) => Number(log.glucose)).filter(Boolean);

  const totalLogs = logs.length;
  const totalMeds = meds.length;
  const totalReminders = rems.length;

  const averageGlucose = glucoseValues.length
    ? Math.round(glucoseValues.reduce((sum, value) => sum + value, 0) / glucoseValues.length)
    : 0;

  const highestGlucose = glucoseValues.length ? Math.max(...glucoseValues) : 0;
  const lowestGlucose = glucoseValues.length ? Math.min(...glucoseValues) : 0;

  const latestLog = logs[0];
  const latestMedication = meds[0];
  const nextReminder = rems[0];
  const lastChat = chats[chats.length - 1];

  const latestPrediction = latestLog?.prediction;

  const risk = latestPrediction
    ? {
        level: latestPrediction.riskLevel || "Unknown",
        msg: latestPrediction.recommendation || "Review latest reading",
      }
    : riskLevel(logs);

  return (
    <>
      <div className="between">
        <div>
          <h1>Welcome back, {user.name.split(" ")[0]} 👋</h1>
          <p>Here is your diabetes support summary for today.</p>
        </div>

        <button className="outline">
          <Calendar /> Today
        </button>
      </div>

      <div className="dashCards">
        <Metric icon={<Droplet />} title="Total Logs" value={totalLogs} sub="Saved glucose readings" />
        <Metric icon={<Activity />} title="Average Glucose" value={averageGlucose ? `${averageGlucose} mg/dL` : "No data"} sub="Based on saved logs" />
        <Metric icon={<Pill />} title="Medications" value={totalMeds} sub="Saved medications" />
        <Metric icon={<Bell />} title="Reminders" value={totalReminders} sub="Saved reminders" />
      </div>

      <div className="quickActions">
        <button onClick={() => setTab("glucose")}><Plus /> Add Log</button>
        <button onClick={() => setTab("meds")}><Pill /> Add Medication</button>
        <button onClick={() => setTab("reminders")}><Bell /> Add Reminder</button>
        <button onClick={() => window.dispatchEvent(new Event("open-chat"))}><MessageCircle /> Open Chatbot</button>
      </div>

      <div className="grid2">
        <div className="panel">
          <div className="between">
            <h2>Blood Glucose Trend</h2>
            <button onClick={() => setTab("glucose")}>View all logs</button>
          </div>

          <LineChart logs={logs} />

          <button onClick={() => setTab("glucose")} className="primary">
            <Plus /> Add Reading
          </button>
        </div>

        <div className="panel">
          <h2>Current Health Snapshot</h2>

          <div className="summaryBoxes">
            <div>
              <small>Highest</small>
              <b>{highestGlucose ? `${highestGlucose} mg/dL` : "No data"}</b>
            </div>

            <div>
              <small>Lowest</small>
              <b>{lowestGlucose ? `${lowestGlucose} mg/dL` : "No data"}</b>
            </div>

            <div>
              <small>Latest</small>
              <b>{latestLog ? `${latestLog.glucose} mg/dL` : "No data"}</b>
            </div>
          </div>

          <div className="riskBox">
            <h3>Latest ML Risk: {risk.level}</h3>
            <p>{risk.msg}</p>
          </div>

          <button onClick={() => setTab("warning")} className="outline full">
            Review Warning Signs
          </button>
        </div>
      </div>

      <div className="grid2">
        <div className="panel">
          <div className="between">
            <h2>Recent Logs</h2>
            <button onClick={() => setTab("glucose")}>Add New</button>
          </div>

          {logs.length === 0 && <p>No glucose logs yet.</p>}

          {logs.slice(0, 5).map((log) => (
            <div className="dashboardLogRow" key={log.id}>
              <div>
                <b>{log.glucose} mg/dL</b>
                <small>{log.date} {log.time} • {log.meal}</small>
              </div>

              <span>{log.prediction?.riskLevel || "No prediction"}</span>
            </div>
          ))}
        </div>

        <div className="panel">
          <h2>Care Activity</h2>

          <div className="dashboardLogRow">
            <div>
              <b>{latestMedication?.name || "No medication added"}</b>
              <small>{latestMedication ? `${latestMedication.dose} • ${latestMedication.time}` : "Add your medication"}</small>
            </div>
            <span>Medication</span>
          </div>

          <div className="dashboardLogRow">
            <div>
              <b>{nextReminder?.medication || "No reminder set"}</b>
              <small>{nextReminder ? `${nextReminder.date} ${nextReminder.time}` : "Add a reminder"}</small>
            </div>
            <span>Reminder</span>
          </div>

          <div className="dashboardLogRow">
            <div>
              <b>{lastChat?.sender ? "Last chatbot activity" : "No chatbot activity"}</b>
              <small>{lastChat?.message || "Ask the Health Navigator for guidance"}</small>
            </div>
            <span>Chatbot</span>
          </div>
        </div>
      </div>

      <div className="cta">
        <Shield />
        <div>
          <h3>Remember: IZI Health supports care navigation.</h3>
          <p>This platform does not diagnose or prescribe medication. Always consult a healthcare professional.</p>
        </div>
      </div>
    </>
  );
}

function Metric({icon,title,value,sub}){return <div className="metric"><div className="round">{icon}</div><p>{title}</p><h2>{value}</h2><small>{sub}</small></div>}

function LineChart({logs}) {
  const data = logs && logs.length
    ? logs.slice(-7).reverse().map((l, i) => ({
        date: l.date ? l.date.slice(5) : `Log ${i + 1}`,
        value: Number(l.glucose)
      }))
    : [
        { date: "May 14", value: 112 },
        { date: "May 15", value: 140 },
        { date: "May 16", value: 90 },
        { date: "May 17", value: 134 },
        { date: "May 18", value: 98 },
        { date: "May 19", value: 125 },
        { date: "May 20", value: 130 },
      ];

  const highest = Math.max(...data.map(d => d.value));
  const lowest = Math.min(...data.map(d => d.value));
  const average = Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length);

  return (
    <div className="glucoseChartBox">
      <div className="chartArea">
        <div className="yAxis">
          <span>200</span>
          <span>150</span>
          <span>100</span>
          <span>50</span>
          <span>0</span>
        </div>

        <div className="chartPlot">
          <div className="targetLine"></div>
          <span className="targetLabel">Target Range<br />80–130 mg/dL</span>

          {data.map((item, index) => {
            const height = Math.min(180, (item.value / 200) * 180);

            return (
              <div className="barGroup" key={index}>
                <div className="barValue">{item.value}</div>
                <div
                  className={
                    item.value > 180
                      ? "glucoseBar high"
                      : item.value > 140
                      ? "glucoseBar medium"
                      : "glucoseBar normal"
                  }
                  style={{ height: `${height}px` }}
                ></div>
                <span className="xDate">{item.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="logSummary uiStyle">
        <div>
          <small>Highest</small>
          <b>{highest} mg/dL</b>
        </div>
        <div>
          <small>Lowest</small>
          <b>{lowest} mg/dL</b>
        </div>
        <div>
          <small>Average</small>
          <b>{average} mg/dL</b>
        </div>
      </div>
    </div>
  );
}

function Glucose({ user }) {
  const [logs, setLogs] = useState(get(userKey(KEY.logs, user), []));
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    time: "08:00",
    glucose: "",
    readingType: "Fasting",
    meal: "Before meal",
    weight: "",
    height: "",
    bmi: "",
    temperature: "",
    activityLevel: "Moderate",
    dietTag: "Balanced",
    medicationTaken: "Yes",
    familyHistory: "No",
    symptoms: [],
    notes: "",
    gender: "Female",
    age: "",
    HbA1c_level: "",
    hypertension: "0",
    heart_disease: "0",
    smoking_history: "never",
  });

  const symptomOptions = [
    "Frequent urination",
    "Extreme thirst",
    "Fatigue",
    "Blurred vision",
    "Tingling feet",
    "Slow healing sores",
    "Chest pain",
    "Shortness of breath",
  ];

  function calculateBMI(weight, height) {
    const w = Number(weight);
    const h = Number(height) / 100;
    if (!w || !h) return "";
    return (w / (h * h)).toFixed(1);
  }

  function updateWeightHeight(field, value) {
    const updatedForm = { ...form, [field]: value };

    updatedForm.bmi = calculateBMI(
      field === "weight" ? value : updatedForm.weight,
      field === "height" ? value : updatedForm.height
    );

    setForm(updatedForm);
  }

  function toggleSymptom(symptom) {
    const updatedSymptoms = form.symptoms.includes(symptom)
      ? form.symptoms.filter((s) => s !== symptom)
      : [...form.symptoms, symptom];

    setForm({ ...form, symptoms: updatedSymptoms });
  }

  function buildEngineeredFeatures(existingLogs, savedLog) {
    const allLogs = [savedLog, ...existingLogs];

    const values = allLogs
      .slice(0, 7)
      .map((log) => Number(log.glucose))
      .filter(Boolean);

    const avg7 = values.length
      ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
      : Number(savedLog.glucose);

    const highSpikes = values.filter((value) => value >= 180).length;
    const lowEvents = values.filter((value) => value < 70).length;

    const fastingValues = allLogs
      .filter((log) => log.readingType === "Fasting")
      .slice(0, 7)
      .map((log) => Number(log.glucose))
      .filter(Boolean);

    const fastingAverage = fastingValues.length
      ? Math.round(fastingValues.reduce((sum, value) => sum + value, 0) / fastingValues.length)
      : null;

    return {
      sevenDayAverage: avg7,
      highSpikes,
      lowEvents,
      fastingAverage,
      logsUsed: values.length,
    };
  }

  function showRiskNotification(savedLog) {
    const risk = savedLog.prediction?.riskLevel;
    const glucose = Number(savedLog.glucose);

    if (risk === "High Risk" || glucose >= 200) {
      alert(
        "⚠️ High Diabetes Risk Alert\n\nYour glucose reading suggests high risk. Please consider visiting a healthcare professional as soon as possible."
      );
    } else if (risk === "Medium Risk" || glucose >= 140) {
      alert(
        "⚠️ Medium Diabetes Risk Alert\n\nYour reading needs attention. Continue monitoring and consider medical advice if readings remain high."
      );
    }
  }

  async function save(e) {
    e.preventDefault();

    if (!form.glucose) return alert("Please enter glucose reading.");
    if (!form.age) return alert("Please enter age.");
    if (!form.weight) return alert("Please enter weight.");
    if (!form.height) return alert("Please enter height.");

    setSaving(true);

    try {
      const logToSend = {
        ...form,
        bmi: form.bmi || calculateBMI(form.weight, form.height),
      };

      const response = await fetch(
  `${API_URL}/api/health-logs`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(logToSend),
  }
);  // Added new line for deployment

      const savedFromBackend = await response.json();
      const engineered = buildEngineeredFeatures(logs, savedFromBackend);

      const savedLog = {
        ...savedFromBackend,
        engineered,
      };

      const updatedLogs = [savedLog, ...logs];

      setLogs(updatedLogs);
      set(userKey(KEY.logs, user), updatedLogs);

      showRiskNotification(savedLog);

      setForm({
        date: new Date().toISOString().slice(0, 10),
        time: "08:00",
        glucose: "",
        readingType: "Fasting",
        meal: "Before meal",
        weight: "",
        height: "",
        bmi: "",
        temperature: "",
        activityLevel: "Moderate",
        dietTag: "Balanced",
        medicationTaken: "Yes",
        familyHistory: "No",
        symptoms: [],
        notes: "",
        gender: "Female",
        age: "",
        HbA1c_level: "",
        hypertension: "0",
        heart_disease: "0",
        smoking_history: "never",
      });
    } catch (error) {
      alert("Could not save log. Make sure backend and ML service are running.");
    }

    setSaving(false);
  }

  function deleteLog(id) {
    const updatedLogs = logs.filter((log) => log.id !== id);
    setLogs(updatedLogs);
    set(userKey(KEY.logs, user), updatedLogs);
  }

  function clearAllLogs() {
    if (!window.confirm("Are you sure you want to clear all saved logs?")) return;
    setLogs([]);
    set(userKey(KEY.logs, user), []);
  }

  return (
    <div>
      <h1>Blood Glucose Log</h1>
      <p className="lead">
        Record glucose readings and contextual health information for ML-based monitoring.
      </p>

      <div className="glucoseLayout">
        <form onSubmit={save} className="panel glucoseForm">
          <h2>New Glucose Reading</h2>

          <div className="formGrid2">
            <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <input className="input" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </div>

          <label>Blood Glucose Value</label>
          <input className="input" type="number" placeholder="e.g. 126 mg/dL" value={form.glucose} onChange={(e) => setForm({ ...form, glucose: e.target.value })} />

          <label>Glucose State</label>
          <select className="input" value={form.readingType} onChange={(e) => setForm({ ...form, readingType: e.target.value })}>
            <option>Fasting</option>
            <option>Before meal</option>
            <option>After meal</option>
            <option>Bedtime</option>
            <option>Random</option>
          </select>

          <div className="formGrid2">
            <div>
              <label>Weight</label>
              <input className="input" type="number" placeholder="kg" value={form.weight} onChange={(e) => updateWeightHeight("weight", e.target.value)} />
            </div>

            <div>
              <label>Height</label>
              <input className="input" type="number" placeholder="cm" value={form.height} onChange={(e) => updateWeightHeight("height", e.target.value)} />
            </div>
          </div>

          <label>BMI Auto-calculated</label>
          <input className="input" value={form.bmi} readOnly placeholder="BMI will appear here" />

          <div className="formGrid2">
            <div>
              <label>Age</label>
              <input className="input" type="number" placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            </div>

            <div>
              <label>Temperature Optional</label>
              <input className="input" type="number" step="0.1" placeholder="°C" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} />
            </div>
          </div>

          <label>Activity Level</label>
          <select className="input" value={form.activityLevel} onChange={(e) => setForm({ ...form, activityLevel: e.target.value })}>
            <option>Low</option>
            <option>Moderate</option>
            <option>High</option>
          </select>

          <label>Diet Tag</label>
          <select className="input" value={form.dietTag} onChange={(e) => setForm({ ...form, dietTag: e.target.value })}>
            <option>Balanced</option>
            <option>High carb</option>
            <option>Low carb</option>
            <option>Sugary drink</option>
            <option>Skipped meal</option>
          </select>

          <label>Medication Taken?</label>
          <select className="input" value={form.medicationTaken} onChange={(e) => setForm({ ...form, medicationTaken: e.target.value })}>
            <option>Yes</option>
            <option>No</option>
          </select>

          <label>Family History</label>
          <select className="input" value={form.familyHistory} onChange={(e) => setForm({ ...form, familyHistory: e.target.value })}>
            <option>No</option>
            <option>Yes</option>
          </select>

          <label>Symptoms Today</label>
          <div className="symptomGrid">
            {symptomOptions.map((symptom) => (
              <button
                type="button"
                key={symptom}
                className={form.symptoms.includes(symptom) ? "symptomChip active" : "symptomChip"}
                onClick={() => toggleSymptom(symptom)}
              >
                {symptom}
              </button>
            ))}
          </div>

          <textarea className="input" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

          <button className="primary full" disabled={saving}>
            {saving ? "Saving..." : "Save Reading"}
          </button>
        </form>

        <div className="panel glucoseSavedPanel">
          <div className="between">
            <h2>Saved Glucose Logs</h2>
            {logs.length > 0 && <button type="button" onClick={clearAllLogs} className="outline">Clear History</button>}
          </div>

          {logs.length === 0 && <p>No logs saved yet.</p>}

          {logs.map((log) => (
            <div className="glucoseLogCard" key={log.id}>
              <div>
                <h3>{log.glucose} mg/dL</h3>
                <p>{log.date} {log.time} • {log.readingType || log.meal}</p>
                <small>BMI: {log.bmi || "N/A"} • Activity: {log.activityLevel || "N/A"} • Diet: {log.dietTag || "N/A"}</small>
                {log.engineered && <small>7-day Avg: {log.engineered.sevenDayAverage} mg/dL • Spikes: {log.engineered.highSpikes}</small>}
              </div>

              <span className="riskPill">{log.prediction?.riskLevel || "No prediction"}</span>

              <button type="button" onClick={() => deleteLog(log.id)} className="deleteLogBtn" title="Delete this log">
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Meds({ user }) {
  const [meds, setMeds] = useState(get(userKey(KEY.meds, user), []));

  const [form, setForm] = useState({
    name: "Metformin",
    dose: "500mg",
    frequency: "Twice daily",
    time: "20:00",
    taken: false,
  });

  function formatTime(time) {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    const h = Number(hour);
    const suffix = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minute} ${suffix}`;
  }

  function save(e) {
    e.preventDefault();

    const newMedication = {
      ...form,
      id: Date.now(),
    };

    const updatedMeds = [newMedication, ...meds];

    setMeds(updatedMeds);
    set(userKey(KEY.meds, user), updatedMeds);

    setForm({
      name: "Metformin",
      dose: "500mg",
      frequency: "Twice daily",
      time: "20:00",
      taken: false,
    });
  }

  function toggle(id) {
    const updatedMeds = meds.map((med) =>
      med.id === id ? { ...med, taken: !med.taken } : med
    );

    setMeds(updatedMeds);
    set(userKey(KEY.meds, user), updatedMeds);
  }

  function deleteMedication(id) {
    const updatedMeds = meds.filter((med) => med.id !== id);
    setMeds(updatedMeds);
    set(userKey(KEY.meds, user), updatedMeds);
  }

  function clearAllMedications() {
    const confirmClear = window.confirm("Are you sure you want to clear all medications?");
    if (!confirmClear) return;

    setMeds([]);
    set(userKey(KEY.meds, user), []);
  }

  return (
    <div>
      <h1>Medications</h1>
      <p className="lead">Add and manage your diabetes medications.</p>

      <div className="medsLayout">
        <form onSubmit={save} className="panel medForm">
          <div className="between">
            <h2>Add Medication</h2>
            <div className="addSquare">
              <Plus />
            </div>
          </div>

          <label>Medication Name</label>
          <select
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          >
            <option>Metformin</option>
            <option>Insulin</option>
            <option>Glimepiride</option>
            <option>Gliclazide</option>
            <option>Sitagliptin</option>
            <option>Atorvastatin</option>
            <option>Other</option>
          </select>

          <label>Dose</label>
          <input
            className="input"
            placeholder="e.g. 500mg"
            value={form.dose}
            onChange={(e) => setForm({ ...form, dose: e.target.value })}
          />

          <label>Dose Frequency</label>
          <select
            className="input"
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
          >
            <option>Once daily</option>
            <option>Twice daily</option>
            <option>At night</option>
            <option>Before meals</option>
            <option>After meals</option>
            <option>Weekly</option>
          </select>

          <label>Time</label>
          <input
            className="input"
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />

          <button className="primary full">
            <Plus /> Add Medication
          </button>
        </form>

        <div className="medListPanel">
          <div className="between">
            <h2>Your Medications</h2>

            {meds.length > 0 && (
              <button
                type="button"
                onClick={clearAllMedications}
                className="outline"
              >
                <Trash2 size={16} /> Clear All
              </button>
            )}
          </div>

          {meds.length === 0 && (
            <div className="emptyMedState">
              <Pill />
              <p>No medications added yet.</p>
            </div>
          )}

          {meds.map((med) => (
            <div className="medCardClean" key={med.id}>
              <div className="medIconClean">
                <Pill />
              </div>

              <div className="medInfoClean">
                <h3>
                  {med.name} {med.dose}
                </h3>
                <p>
                  1 tablet, {med.frequency}
                </p>
              </div>

              <div className="medTimeClean">
                <b>{formatTime(med.time)}</b>

                <button
                  type="button"
                  onClick={() => toggle(med.id)}
                  className={med.taken ? "takenPill" : "pendingPill"}
                >
                  {med.taken ? "Taken" : "Pending"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => deleteMedication(med.id)}
                className="medMoreBtn"
                title="Delete medication"
              >
                ⋮
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function Reminders({ user }) {
  const [items, setItems] = useState(get(userKey(KEY.reminders, user), []));

  const [form, setForm] = useState({
    medication: "Metformin",
    date: new Date().toISOString().slice(0, 10),
    time: "20:00",
    frequency: "Every day",
  });

  function formatTime(time) {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    const h = Number(hour);
    const suffix = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minute} ${suffix}`;
  }

  function save(e) {
    e.preventDefault();

    const newReminder = {
      ...form,
      id: Date.now(),
    };

    const updatedItems = [newReminder, ...items];

    setItems(updatedItems);
    set(userKey(KEY.reminders, user), updatedItems);

    setForm({
      medication: "Metformin",
      date: new Date().toISOString().slice(0, 10),
      time: "20:00",
      frequency: "Every day",
    });
  }

  function deleteReminder(id) {
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
    set(userKey(KEY.reminders, user), updatedItems);
  }

  function clearAllReminders() {
    const confirmClear = window.confirm("Are you sure you want to clear all reminders?");
    if (!confirmClear) return;

    setItems([]);
    set(userKey(KEY.reminders, user), []);
  }

  return (
    <div>
      <h1>Medication Reminders</h1>
      <p className="lead">Create reminders for diabetes medications.</p>

      <div className="reminderLayout">
        <form onSubmit={save} className="panel reminderForm">
          <div className="between">
            <h2>Add Reminder</h2>
            <div className="addSquare">
              <Bell />
            </div>
          </div>

          <label>Medication</label>
          <input
            className="input"
            placeholder="Medication"
            value={form.medication}
            onChange={(e) => setForm({ ...form, medication: e.target.value })}
          />

          <label>Date</label>
          <input
            className="input"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <label>Time</label>
          <input
            className="input"
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />

          <label>Frequency</label>
          <select
            className="input"
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
          >
            <option>Every day</option>
            <option>Once</option>
            <option>Weekly</option>
            <option>Twice daily</option>
            <option>At night</option>
          </select>

          <button className="primary full">
            <Bell /> Save Reminder
          </button>
        </form>

        <div className="reminderListPanel">
          <div className="between">
            <h2>Your Reminders</h2>

            {items.length > 0 && (
              <button
                type="button"
                onClick={clearAllReminders}
                className="outline"
              >
                <Trash2 size={16} /> Clear All
              </button>
            )}
          </div>

          {items.length === 0 && (
            <div className="emptyMedState">
              <Bell />
              <p>No reminders added yet.</p>
            </div>
          )}

          {items.map((item) => (
            <div className="reminderCardClean" key={item.id}>
              <div className="medIconClean">
                <Bell />
              </div>

              <div>
                <h3>{item.medication}</h3>
                <p>{item.frequency}</p>
              </div>

              <div className="reminderTimeClean">
                <b>{formatTime(item.time)}</b>
                <small>{item.date}</small>
              </div>

              <button
                type="button"
                onClick={() => deleteReminder(item.id)}
                className="medMoreBtn"
                title="Delete reminder"
              >
                ⋮
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function riskLevel(logs){
  if(!logs.length) return {level:'Not enough data', msg:'Add logs'};

  const latest = logs[0];

  if(latest.prediction){
    return {
      level: latest.prediction.riskLevel || 'Unknown',
      msg: latest.prediction.recommendation || 'Review your latest reading'
    };
  }

  const avg = logs.reduce((a,b)=>a+Number(b.glucose),0)/logs.length;

  if(avg>=180) return {level:'High', msg:'Seek care'};
  if(avg>=140) return {level:'Medium', msg:'Monitor closely'};
  return {level:'Low', msg:'Within range'};
}
const signs={ 'Frequent urination':'May happen when blood glucose is high and the body tries to remove extra glucose.','Extreme thirst':'Can be linked to fluid loss from frequent urination.','Unexplained weight loss':'May occur when the body cannot use glucose properly for energy.','Blurred vision':'Can happen when high glucose affects fluid balance in the eyes.','Numbness or tingling':'Can be a sign of nerve irritation and should be discussed with a clinician.','Slow healing sores':'High glucose may affect healing and infection risk.','Chest pain':'Chest pain can be serious. Seek urgent medical care immediately.','Shortness of breath':'Can be serious, especially with chest pain or weakness. Seek urgent care.'};
function Warning({ compact, user }) {
  const [open, setOpen] = useState(null);

  const logs = user ? get(userKey(KEY.logs, user), []) : [];
  const latestLog = logs[0];
  const prediction = latestLog?.prediction;

  const riskLevelText = prediction?.riskLevel || "No ML prediction yet";
  const recommendation =
    prediction?.recommendation || "Add a glucose log to generate ML-based warning guidance.";

  return (
    <div className="panel">
      <div className="between">
        <h2>Warning Signs Checklist</h2>
        {!compact && <b>ML risk guidance</b>}
      </div>

      {!compact && (
        <div className="riskBox">
          <h3>Latest ML Status</h3>
          <p><b>Latest glucose:</b> {latestLog ? `${latestLog.glucose} mg/dL` : "No log yet"}</p>
          <p><b>Risk level:</b> {riskLevelText}</p>
          <p>{recommendation}</p>
        </div>
      )}

      {Object.keys(signs).map((s) => (
        <button className="warnItem" onClick={() => setOpen(s)} key={s}>
          {s}
          <ChevronRight size={16} />
        </button>
      ))}

      <div className="danger">
        <AlertTriangle /> If you have serious symptoms, seek medical attention immediately.
      </div>

      {open && (
        <div className="modal">
          <div className="modalBox">
            <button className="close" onClick={() => setOpen(null)}>
              <X />
            </button>
            <h2>{open}</h2>
            <p>{signs[open]}</p>
            <p>This is not a diagnosis. Please consult a healthcare professional.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Education() {
  const [open, setOpen] = useState(null);

  const lessons = {
    "What is Diabetes?":
      "Diabetes is a condition where blood glucose stays high because the body does not make enough insulin or cannot use insulin properly.",

    "Managing Blood Sugar":
      "Check your glucose regularly, record your readings, and share patterns with a healthcare professional during visits.",

    "Healthy Eating":
      "Choose balanced meals with vegetables, whole grains, lean protein, and limited sugary drinks or highly processed foods.",

    "Physical Activity":
      "Regular walking or light exercise can help improve blood sugar control. Start slowly and follow medical advice.",

    "Medication Adherence":
      "Take medication as prescribed. Use reminders to avoid missed doses and do not stop medication without medical advice.",

    "Warning Signs":
      "Seek care if you experience severe thirst, frequent urination, blurred vision, weakness, chest pain, or very high glucose readings.",

    "When to Visit a Facility":
      "Visit a facility if your glucose remains high, symptoms worsen, medication side effects occur, or you feel very unwell.",
  };

  return (
    <div>
      <h1>Diabetes Education</h1>
      <p className="lead">
        Learn simple diabetes self-management tips to support your daily care.
      </p>

      <div className="educationGrid">
        {Object.keys(lessons).map((title) => (
          <button
            key={title}
            className="educationCard"
            onClick={() => setOpen(title)}
          >
            <BookOpen />
            <h3>{title}</h3>
            <p>{lessons[title].slice(0, 90)}...</p>
            <span>Read more →</span>
          </button>
        ))}
      </div>

      {open && (
        <div className="modal">
          <div className="modalBox">
            <button className="close" onClick={() => setOpen(null)}>
              <X />
            </button>

            <h2>{open}</h2>
            <p>{lessons[open]}</p>
            <p>
              This information supports education only. It does not replace
              professional medical care.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// New features added
function WeeklyReport({ user }) {
  const logs = get(userKey(KEY.logs, user), []);
  const values = logs.map((l) => Number(l.glucose)).filter(Boolean);

  const average = values.length
    ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    : 0;

  const highest = values.length ? Math.max(...values) : 0;
  const lowest = values.length ? Math.min(...values) : 0;

  const latest = logs[0];
  const risk = latest?.prediction?.riskLevel || "No prediction yet";

  const trend =
    values.length < 2
      ? "Not enough data"
      : values[0] < values[values.length - 1]
      ? "Improving"
      : "Needs attention";

  const recommendation =
    risk.includes("High")
      ? "Please consider visiting a diabetes care facility and continue monitoring your glucose."
      : risk.includes("Medium")
      ? "Continue monitoring and review your readings with a healthcare professional."
      : "Continue healthy habits, medication adherence, and regular monitoring.";

  return (
    <div>
      <h1>Weekly Health Report</h1>
      <p className="lead">
        Summary of your saved diabetes logs and ML-based risk support.
      </p>

      <div className="dashCards">
        <Metric icon={<Droplet/>} title="Average Glucose" value={average ? `${average} mg/dL` : "No data"} sub="This week"/>
        <Metric icon={<AlertTriangle/>} title="Highest Reading" value={highest ? `${highest} mg/dL` : "No data"} sub="Peak glucose"/>
        <Metric icon={<Activity/>} title="Lowest Reading" value={lowest ? `${lowest} mg/dL` : "No data"} sub="Lowest glucose"/>
        <Metric icon={<BarChart3/>} title="Trend" value={trend} sub="Based on logs"/>
      </div>

      <div className="panel reportPanel">
        <h2>Report Summary</h2>
        <p><b>Total logs:</b> {logs.length}</p>
        <p><b>Latest ML Risk:</b> {risk}</p>
        <p><b>Recommendation:</b> {recommendation}</p>

        <button className="primary" onClick={() => window.print()}>
          Print / Save as PDF
        </button>
      </div>

      <div className="panel">
        <h2>Recent Readings</h2>
        {logs.slice(0, 7).map((log) => (
          <div className="dashboardLogRow" key={log.id}>
            <div>
              <b>{log.glucose} mg/dL</b>
              <small>{log.date} {log.time} • {log.meal}</small>
            </div>
            <span>{log.prediction?.riskLevel || "No prediction"}</span>
          </div>
        ))}

        {logs.length === 0 && <p>No readings available yet.</p>}
      </div>
    </div>
  );
}

function UserSettings(){const[s,setS]=useState(get(KEY.settings,{reminders:true,reports:true,chat:true,alerts:true,dark:false}));function tog(k){const n={...s,[k]:!s[k]};setS(n);set(KEY.settings,n)}return <div><h1>Settings</h1><div className="panel">{Object.keys(s).map(k=><label className="switch" key={k}>{k.replace(/\b\w/g,c=>c.toUpperCase())}<input type="checkbox" checked={s[k]} onChange={()=>tog(k)}/></label>)}</div></div>}
