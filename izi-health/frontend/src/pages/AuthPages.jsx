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
      nav(data.user.role === "ADMIN" ? "/admin" : "/ncd");
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
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const canSubmit =
    form.name.trim() &&
    form.email.trim() &&
    form.password.trim().length >= 8 &&
    form.confirm.trim() &&
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

        {err && <p className="error">{err}</p>}
        <button className="primary full" type="submit" disabled={!canSubmit}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="authSwitch">
          Already have account? <Link to="/login">Login</Link>
        </p>
      </form>
    </Auth>
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
