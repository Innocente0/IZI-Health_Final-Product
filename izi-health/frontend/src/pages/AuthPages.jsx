import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, HeartPulse } from "lucide-react";
import { API_URL } from "../config.js";

function PasswordInput({ placeholder, value, onChange }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="passwordField">
      <input
        className="input"
        placeholder={placeholder}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
      />

      <button
        type="button"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>
    </div>
  );
}

export function Login({ onLogin }) {
  const nav = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const canSubmit = form.email.trim() && form.password.trim() && !loading;

  async function submit(e) {
    e.preventDefault();
    setErr("");

    if (!canSubmit) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      onLogin(data.user, data.token);
      nav(data.user.role === "ADMIN" ? "/admin" : "/");
    } catch (error) {
      console.error("Login error:", error);
      setErr(error.message || "Could not log in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Auth title="Welcome back" subtitle="Login to access facilities and NCD support">
      <form onSubmit={submit} className="form">
        <input
          className="input"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <PasswordInput
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {location.state?.message && <p className="success">{location.state.message}</p>}
        {err && <p className="error">{err}</p>}

        <button className="primary full" type="submit" disabled={!canSubmit}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="authSwitch">
          New user? <Link to="/register">Create account</Link>
        </p>
      </form>
    </Auth>
  );
}

export function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    acceptedPolicy: false,
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const canSubmit =
    form.name.trim() &&
    form.email.trim() &&
    form.password.trim().length >= 8 &&
    form.confirm.trim() &&
    form.acceptedPolicy &&
    !loading;

  async function submit(e) {
    e.preventDefault();
    setErr("");

    if (!canSubmit) return;
    if (form.password.trim().length < 8) {
      return setErr("Password must be at least 8 characters.");
    }

    if (form.password !== form.confirm) {
      return setErr("Passwords do not match.");
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      nav("/login", {
        state: {
          message: data.message || "Account created successfully. Please log in.",
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      setErr(error.message || "Could not register.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Auth title="Create your account" subtitle="Register to use facility search, health logs and reminders">
      <form onSubmit={submit} className="form">
        <input
          className="input"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="input"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <PasswordInput
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <small className="passwordHint">Password must be at least 8 characters.</small>

        <PasswordInput
          placeholder="Confirm password"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        />

        <label className="policyAccept">
          <input
            type="checkbox"
            checked={form.acceptedPolicy}
            onChange={(e) => setForm({ ...form, acceptedPolicy: e.target.checked })}
          />
          <span>
            I accept the Terms and Conditions and acknowledge the{" "}
            <button type="button" className="policyLink" onClick={() => setPolicyOpen(true)}>
              Privacy Policy
            </button>
          </span>
        </label>

        {err && <p className="error">{err}</p>}
        <button className="primary full" type="submit" disabled={!canSubmit}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="authSwitch">
          Already have account? <Link to="/login">Login</Link>
        </p>
      </form>

      {policyOpen && <PrivacyPolicy onClose={() => setPolicyOpen(false)} modal />}
    </Auth>
  );
}

function PrivacyPolicy({ onClose, modal = false }) {
  const content = (
    <>
      <h1>IZI Health Privacy and Policy</h1>
      <p className="lead">
        This policy explains how IZI Health handles personal and health-related information while supporting healthcare navigation and non-communicable disease self-management.
      </p>

      <section className="panel">
        <h2>Information We Collect</h2>
        <p>When you use IZI Health, we may collect account details such as your name and email address, login information, facility searches, chatbot messages, diabetes health logs, medication entries, reminders, and weekly report information.</p>
        <p>Health-related information may include glucose readings, age, BMI, HbA1c level, hypertension status, heart disease status, smoking history, symptoms, notes, and other details you choose to enter.</p>
      </section>

      <section className="panel">
        <h2>How We Use Your Data</h2>
        <p>Your data is used to provide app features such as facility search, health navigation, diabetes risk support, medication tracking, reminders, reports, and chatbot guidance.</p>
        <p>Diabetes-related inputs may be processed by the ML service to provide risk support. This is for awareness and self-management support only. It is not a medical diagnosis.</p>
      </section>

      <section className="panel">
        <h2>Medical Safety</h2>
        <p>IZI Health does not replace doctors, nurses, pharmacists, emergency services, or professional clinical assessment. The chatbot and diabetes model provide support information only.</p>
        <p>If you have urgent symptoms such as chest pain, difficulty breathing, severe weakness, confusion, fainting, stroke-like symptoms, very high glucose readings, or severe bleeding, seek urgent medical care immediately.</p>
      </section>

      <section className="panel">
        <h2>Data Sharing</h2>
        <p>We do not sell your personal health information. Your information should only be shared when needed to provide the service, maintain the platform, comply with legal requirements, or when you choose to share your health summary with a healthcare professional.</p>
      </section>

      <section className="panel">
        <h2>Security and Account Protection</h2>
        <p>Passwords are stored in hashed form. You are responsible for keeping your login details private and using a strong password. IZI Health aims to protect your information, but no digital system can guarantee perfect security.</p>
      </section>

      <section className="panel">
        <h2>Your Choices</h2>
        <p>You can choose what information to enter, review your saved information inside the app, and stop using optional features such as reminders, reports, chatbot guidance, and ML-supported diabetes risk guidance.</p>
        <p>You may request correction or removal of information where supported by the platform and applicable law.</p>
      </section>

      <section className="panel">
        <h2>Consent</h2>
        <p>By registering, you confirm that you understand this policy and agree to use IZI Health as a healthcare navigation and self-management support tool, not as a replacement for professional medical care.</p>
      </section>
    </>
  );

  if (modal) {
    return (
      <div className="policyModal" role="dialog" aria-modal="true" aria-label="IZI Health privacy and policy">
        <div className="policyModalBox">
          <button type="button" className="policyClose" onClick={onClose} aria-label="Close privacy and policy">
            ×
          </button>
          {content}
        </div>
      </div>
    );
  }

  return (
    <main className="page policyPage">
      {content}
    </main>
  );
}

function Auth({ title, subtitle, children }) {
  return (
    <main className="authPage">
      <div className="authCard">
        <div className="logo bigLogo">
          <HeartPulse />
        </div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </div>
    </main>
  );
}
