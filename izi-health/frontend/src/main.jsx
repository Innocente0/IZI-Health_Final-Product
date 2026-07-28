import { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  Activity,
  Building2,
  HeartPulse,
  Home as HomeIcon,
  Info,
  LogOut,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";

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
        <Route path="/register" element={<Register />} />
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
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="nav">
      <Link to="/" className="brand" onClick={closeMenu}>
        <div className="logo">
          <HeartPulse size={28} />
        </div>
        <div>
          <b>IZI Health</b>
          <span>Smart Healthcare Navigation</span>
        </div>
      </Link>

      <button
        type="button"
        className="mobileMenuBtn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <div className={menuOpen ? "links open" : "links"}>
        <NavLink to="/" onClick={closeMenu}>
          <HomeIcon size={18} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/facilities" onClick={closeMenu}>
          <Building2 size={18} />
          <span>Facilities</span>
        </NavLink>
        <NavLink to="/ncd" onClick={closeMenu}>
          <Activity size={18} />
          <span>NCD</span>
        </NavLink>
        <NavLink to="/about" onClick={closeMenu}>
          <Info size={18} />
          <span>About</span>
        </NavLink>
        {user?.role === "ADMIN" && (
          <NavLink to="/admin" onClick={closeMenu}>
            <ShieldCheck size={18} />
            <span>Admin</span>
          </NavLink>
        )}
      </div>

      <div className="auth">
        {user ? (
          <>
            <span className="chip">Hi, {user.name.split(" ")[0]}</span>
            <button onClick={() => { logout(); closeMenu(); }} className="outline">
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) => `outline ${isActive ? "authActive" : ""}`}
              onClick={closeMenu}
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) => `primary ${isActive ? "authActive" : ""}`}
              onClick={closeMenu}
            >
              Register
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
