import { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { HeartPulse, LogOut } from "lucide-react";

import "./styles.css";
import Chatbot from "./components/Chatbot.jsx";
import { KEY, currentUser, setStored } from "./config.js";
import Admin from "./pages/Admin.jsx";
import { Login, Register } from "./pages/AuthPages.jsx";
import Facilities from "./pages/Facilities.jsx";
import NCD from "./pages/NCD.jsx";
import { About, Home } from "./pages/PublicPages.jsx";

function App() {
  const [user, setUser] = useState(currentUser());

  function login(userData, token) {
    setStored(KEY.user, userData);

    if (token) {
      localStorage.setItem(KEY.token, token);
    }

    setUser(userData);
  }

  function logout() {
    localStorage.removeItem(KEY.user);
    localStorage.removeItem(KEY.token);
    setUser(null);
  }

  return (
    <BrowserRouter>
      <Navbar user={user} logout={logout} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login onLogin={login} />} />
        <Route path="/register" element={<Register onLogin={login} />} />
        <Route
          path="/facilities"
          element={
            <Protected user={user}>
              <Facilities />
            </Protected>
          }
        />
        <Route
          path="/ncd"
          element={
            <Protected user={user}>
              <NCD user={user} />
            </Protected>
          }
        />
        <Route
          path="/admin"
          element={
            <Protected user={user} adminOnly>
              <Admin />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <Chatbot />
    </BrowserRouter>
  );
}

function Protected({ user, children, adminOnly = false }) {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  if (adminOnly && user.role !== "ADMIN") {
    return <Navigate to="/" />;
  }

  return children;
}

function Navbar({ user, logout }) {
  return (
    <div className="nav">
      <Link to="/" className="brand">
        <div className="logo">
          <HeartPulse size={28} />
        </div>
        <div>
          <b>IZI Health</b>
          <span>Smart Healthcare Navigation</span>
        </div>
      </Link>

      <div className="links">
        <Link to="/">Home</Link>
        <Link to="/facilities">Facilities</Link>
        <Link to="/ncd">NCD Support</Link>
        <Link to="/about">About Us</Link>
        {user?.role === "ADMIN" && <Link to="/admin">Admin</Link>}
      </div>

      <div className="auth">
        {user ? (
          <>
            <span className="chip">Hi, {user.name.split(" ")[0]}</span>
            <button onClick={logout} className="outline">
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="outline">
              Login
            </Link>
            <Link to="/register" className="primary">
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);