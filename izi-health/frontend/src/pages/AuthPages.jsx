import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeartPulse } from "lucide-react";
import { API_URL } from "../config.js";
export function Login({ onLogin }) {
  const nav = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");

    if (!form.email || !form.password) {
      return setErr("Email and password are required.");
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
    <Auth
      title="Welcome back"
      subtitle="Login to access facilities and NCD support"
    >
      <form onSubmit={submit} className="form">
        <input
          className="input"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        <input
          className="input"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        {err && <p className="error">{err}</p>}

        <button
          className="primary full"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p>
          New user? <Link to="/register">Create account</Link>
        </p>
      </form>
    </Auth>
  );
}

export function Register({onLogin}){const nav=useNavigate();const[form,setForm]=useState({name:'',email:'',password:'',confirm:''});const[err,setErr]=useState('');const[loading,setLoading]=useState(false);async function submit(e){e.preventDefault();setErr('');if(!form.name||!form.email||!form.password)return setErr('All fields are required.');if(form.password!==form.confirm)return setErr('Passwords do not match.');setLoading(true);try{const response=await fetch(`${API_URL}/api/auth/register`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:form.name,email:form.email,password:form.password})});const data=await response.json();if(!response.ok)throw new Error(data.message||'Registration failed.');onLogin(data.user,data.token);nav('/ncd')}catch(error){console.error('Registration error:',error);setErr(error.message||'Could not register.')}finally{setLoading(false)}}return <Auth title="Create your account" subtitle="Register to use facility search, health logs and reminders"><form onSubmit={submit} className="form"><input className="input" placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input className="input" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input className="input" placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><input className="input" placeholder="Confirm password" type="password" value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})}/>{err&&<p className="error">{err}</p>}<button className="primary full" disabled={loading}>{loading?'Registering...':'Register'}</button><p>Already have account? <Link to="/login">Login</Link></p></form></Auth>}
function Auth({title,subtitle,children}){return <main className="authPage"><div className="authCard"><div className="logo bigLogo"><HeartPulse/></div><h1>{title}</h1><p>{subtitle}</p>{children}</div></main>}

