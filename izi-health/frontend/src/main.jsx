import React,{useEffect,useMemo,useState} from 'react';import{createRoot}from'react-dom/client';import{BrowserRouter,Routes,Route,Navigate,Link,useNavigate,useLocation}from'react-router-dom';import{Search,MessageCircle,HeartPulse,Shield,Building2,User,Lock,LogOut,Calendar,Clock,Droplet,Pill,Bell,AlertTriangle,BookOpen,Settings,Home as HomeIcon,Users,Activity,Plus,Trash2,X,Send,ChevronRight,ChevronLeft,Stethoscope,MapPin,Phone,Mail,Globe2,BarChart3}from'lucide-react';import'./styles.css';

import kingFaisal from "./assets/king-faisal.jpg";
import chukImage from "./assets/chuk.jpg";
import kigaliDiabetesImage from "./assets/kigali-diabetes.jpg";
import nderaImage from "./assets/ndera.jpg";
import kicukiroHealthCenterImage from "./assets/kicukiro-health-center.jpg";
import rwandaMilitaryImage from "./assets/rwanda-military.jpg";
import bahoImage from "./assets/baho.jpg";
import kibagabagaImage from "./assets/kibagabaga.jpg";
import kacyiruImage from "./assets/kacyiru.jpg";
import masakaImage from "./assets/masaka.jpg";
import muhimaImage from "./assets/muhima.jpg";
import kigaliEyeImage from "./assets/kigali-eye.jpg";
import gasaboMedicalImage from "./assets/gasabo-medical.jpg";
import remeraHealthCenterImage from "./assets/remera-health-center.jpg";
import nyarugengeClinicImage from "./assets/nyarugenge-clinic.jpg";

const facilityPlaceholder =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560">
      <rect width="900" height="560" fill="#f3efff"/>
      <rect x="285" y="150" width="330" height="260" rx="24" fill="#ffffff" stroke="#8b6fcf" stroke-width="8"/>
      <rect x="410" y="210" width="80" height="140" rx="10" fill="#d8cff2"/>
      <rect x="430" y="170" width="40" height="120" fill="#8b6fcf"/>
      <rect x="390" y="210" width="120" height="40" fill="#8b6fcf"/>
      <rect x="330" y="220" width="45" height="45" rx="6" fill="#d8cff2"/>
      <rect x="525" y="220" width="45" height="45" rx="6" fill="#d8cff2"/>
      <rect x="330" y="290" width="45" height="45" rx="6" fill="#d8cff2"/>
      <rect x="525" y="290" width="45" height="45" rx="6" fill="#d8cff2"/>
      <text x="450" y="470" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" fill="#4b347f">
        Facility Image
      </text>
    </svg>
  `);

const KEY={user:'izi_user',users:'izi_users',logs:'izi_logs',meds:'izi_meds',reminders:'izi_reminders',chat:'izi_chat',settings:'izi_settings'};
const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

const facilities = [
  {
    id: 1,
    name: "King Faisal Hospital",
    image: kingFaisal,
    type: "Hospital",
    district: "Nyarugenge",
    distance: "1.2 km",
    services: ["General Medicine", "Diabetes Care", "Surgery", "Cardiology", "Internal Medicine", "Laboratory", "Pharmacy"],
    specialists: ["Cardiologist", "Internal Medicine", "Surgeon", "Endocrinologist"],
    insurance: ["RSSB", "RAMA", "Mutuelle", "Jubilee", "AAR", "Radiant"],
    hours: "24/7 Open",
    rating: 4.6,
    reviews: 128,
    phone: "+250 252 588 888",
    email: "info@kingfaisal.rw",
    website: "www.kingfaisal.rw",
    description: "A leading hospital in Kigali providing specialized medical care with modern equipment and experienced professionals.",
    location: "KN 3 Ave, Nyarugenge District, Kigali",
    emergency: true,
  },
  {
    id: 2,
    name: "CHUK Medical Center",
    image: chukImage,
    type: "Hospital",
    district: "Nyarugenge",
    distance: "2.1 km",
    services: ["General Medicine", "Diabetes Care", "Maternity", "Pediatrics", "Laboratory"],
    specialists: ["General Practitioner", "Pediatrician", "Internal Medicine"],
    insurance: ["RSSB", "RAMA", "Mutuelle", "Jubilee"],
    hours: "24/7 Open",
    rating: 4.3,
    reviews: 96,
    phone: "+250 788 304 005",
    email: "info@chuk.rw",
    website: "www.chuk.rw",
    description: "Referral hospital offering broad healthcare services and specialist care in Kigali.",
    location: "Nyarugenge District, Kigali",
    emergency: true,
  },
  {
    id: 3,
    name: "Kigali Diabetes Center",
    image: kigaliDiabetesImage,
    type: "Clinic",
    district: "Gasabo",
    distance: "3.4 km",
    services: ["Diabetes Care", "Internal Medicine", "Nutrition", "Health Education"],
    specialists: ["Endocrinologist", "Nutritionist", "Internal Medicine"],
    insurance: ["RSSB", "RAMA", "Mutuelle"],
    hours: "Mon - Fri: 7:00 AM - 5:00 PM",
    rating: 4.7,
    reviews: 74,
    phone: "+250 788 000 123",
    email: "care@kigalidiabetes.rw",
    website: "www.kigalidiabetes.rw",
    description: "Focused diabetes care, glucose monitoring support, nutrition guidance, and patient education.",
    location: "Gasabo District, Kigali",
    emergency: false,
  },
  {
    id: 4,
    name: "Ndera Polyclinic",
    image: nderaImage,
    type: "Clinic",
    district: "Gasabo",
    distance: "4.2 km",
    services: ["General Medicine", "Laboratory", "Pharmacy", "Diabetes Care"],
    specialists: ["General Practitioner", "Internal Medicine"],
    insurance: ["RSSB", "RAMA", "AAR"],
    hours: "Mon - Sat: 8:00 AM - 6:00 PM",
    rating: 4.2,
    reviews: 45,
    phone: "+250 788 111 456",
    email: "info@ndera.rw",
    website: "www.ndera.rw",
    description: "Community clinic providing general care, laboratory services, and diabetes follow-up.",
    location: "Gasabo District, Kigali",
    emergency: false,
  },
  {
    id: 5,
    name: "Kicukiro Health Center",
    image: kicukiroHealthCenterImage,
    type: "Health Center",
    district: "Kicukiro",
    distance: "5.6 km",
    services: ["General Medicine", "Maternity", "Pediatrics", "Diabetes Care"],
    specialists: ["General Practitioner", "Nurse"],
    insurance: ["RSSB", "Mutuelle"],
    hours: "Mon - Fri: 8:00 AM - 4:00 PM",
    rating: 4.1,
    reviews: 32,
    phone: "+250 788 222 789",
    email: "kicukiro@health.rw",
    website: "www.healthcenter.rw",
    description: "Primary healthcare center serving Kicukiro with general consultation and NCD follow-up support.",
    location: "Kicukiro District, Kigali",
    emergency: false,
  },
  {
    id: 6,
    name: "Rwanda Military Hospital",
    image: rwandaMilitaryImage,
    type: "Hospital",
    district: "Kicukiro",
    distance: "6.0 km",
    services: ["Emergency", "Surgery", "Cardiology", "Diabetes Care", "Laboratory"],
    specialists: ["Cardiologist", "Surgeon", "Internal Medicine"],
    insurance: ["RSSB", "RAMA", "Mutuelle", "AAR"],
    hours: "24/7 Open",
    rating: 4.4,
    reviews: 101,
    phone: "+250 252 586 420",
    email: "info@rmh.rw",
    website: "www.rmh.rw",
    description: "Referral hospital with emergency care, specialist services, and chronic disease support.",
    location: "Kanombe, Kigali",
    emergency: true,
  },
  {
    id: 7,
    name: "Baho International Hospital",
    image: bahoImage,
    type: "Hospital",
    district: "Gasabo",
    distance: "4.8 km",
    services: ["General Medicine", "Diabetes Care", "Cardiology", "Pharmacy"],
    specialists: ["Cardiologist", "Internal Medicine"],
    insurance: ["RAMA", "Jubilee", "AAR"],
    hours: "Mon - Sun: 7:00 AM - 8:00 PM",
    rating: 4.0,
    reviews: 67,
    phone: "+250 788 333 444",
    email: "contact@baho.rw",
    website: "www.baho.rw",
    description: "Private hospital offering general and specialist outpatient services.",
    location: "Gasabo District, Kigali",
    emergency: false,
  },
  {
    id: 8,
    name: "Kibagabaga Hospital",
    image: kibagabagaImage,
    type: "Hospital",
    district: "Gasabo",
    distance: "5.1 km",
    services: ["General Medicine", "Emergency", "Maternity", "Pediatrics", "Laboratory"],
    specialists: ["General Practitioner", "Pediatrician", "Gynecologist"],
    insurance: ["RSSB", "Mutuelle", "RAMA"],
    hours: "24/7 Open",
    rating: 4.2,
    reviews: 84,
    phone: "+250 788 444 555",
    email: "info@kibagabaga.rw",
    website: "www.kibagabaga.rw",
    description: "Public hospital providing emergency, maternity, pediatric, and general healthcare services.",
    location: "Kibagabaga, Gasabo District, Kigali",
    emergency: true,
  },
  {
    id: 9,
    name: "Kacyiru Hospital",
    image: kacyiruImage,
    type: "Hospital",
    district: "Gasabo",
    distance: "3.9 km",
    services: ["General Medicine", "Emergency", "Internal Medicine", "Laboratory", "Pharmacy"],
    specialists: ["General Practitioner", "Internal Medicine"],
    insurance: ["RSSB", "Mutuelle", "RAMA"],
    hours: "24/7 Open",
    rating: 4.1,
    reviews: 59,
    phone: "+250 788 555 666",
    email: "info@kacyiru.rw",
    website: "www.kacyiru.rw",
    description: "Hospital offering general consultation, internal medicine, emergency care, and laboratory services.",
    location: "Kacyiru, Gasabo District, Kigali",
    emergency: true,
  },
  {
    id: 10,
    name: "Masaka Hospital",
    image: masakaImage,
    type: "Hospital",
    district: "Kicukiro",
    distance: "8.4 km",
    services: ["General Medicine", "Maternity", "Pediatrics", "Laboratory", "Pharmacy"],
    specialists: ["General Practitioner", "Pediatrician", "Gynecologist"],
    insurance: ["RSSB", "Mutuelle"],
    hours: "Mon - Sun: 7:00 AM - 7:00 PM",
    rating: 4.0,
    reviews: 41,
    phone: "+250 788 666 777",
    email: "info@masaka.rw",
    website: "www.masakahospital.rw",
    description: "Hospital supporting general care, maternal health, pediatric care, and diagnostic services.",
    location: "Masaka, Kicukiro District, Kigali",
    emergency: false,
  },
  {
    id: 11,
    name: "Muhima Hospital",
    image: muhimaImage,
    type: "Hospital",
    district: "Nyarugenge",
    distance: "2.7 km",
    services: ["Maternity", "Pediatrics", "General Medicine", "Laboratory"],
    specialists: ["Gynecologist", "Pediatrician", "General Practitioner"],
    insurance: ["RSSB", "Mutuelle", "RAMA"],
    hours: "24/7 Open",
    rating: 4.2,
    reviews: 73,
    phone: "+250 788 777 888",
    email: "info@muhima.rw",
    website: "www.muhima.rw",
    description: "Hospital known for maternity, pediatric, and general healthcare support.",
    location: "Muhima, Nyarugenge District, Kigali",
    emergency: true,
  },
  {
    id: 12,
    name: "Kigali Eye Clinic",
    image: kigaliEyeImage,
    type: "Clinic",
    district: "Nyarugenge",
    distance: "1.9 km",
    services: ["Eye Care", "General Consultation", "Pharmacy"],
    specialists: ["Ophthalmologist", "General Practitioner"],
    insurance: ["RAMA", "AAR", "Jubilee"],
    hours: "Mon - Fri: 8:00 AM - 5:00 PM",
    rating: 4.5,
    reviews: 38,
    phone: "+250 788 888 999",
    email: "info@kigalieye.rw",
    website: "www.kigalieye.rw",
    description: "Clinic providing eye consultation, vision screening, and basic eye care support.",
    location: "Nyarugenge District, Kigali",
    emergency: false,
  },
  {
    id: 13,
    name: "Gasabo Medical Clinic",
    image: gasaboMedicalImage,
    type: "Clinic",
    district: "Gasabo",
    distance: "4.5 km",
    services: ["General Medicine", "Laboratory", "Pharmacy", "Diabetes Care"],
    specialists: ["General Practitioner", "Internal Medicine"],
    insurance: ["Mutuelle", "RAMA", "RSSB"],
    hours: "Mon - Sat: 8:00 AM - 6:00 PM",
    rating: 4.1,
    reviews: 29,
    phone: "+250 788 123 321",
    email: "info@gasabomedical.rw",
    website: "www.gasabomedical.rw",
    description: "Community medical clinic offering general care, laboratory testing, and NCD follow-up.",
    location: "Gasabo District, Kigali",
    emergency: false,
  },
  {
    id: 14,
    name: "Remera Health Center",
    image: remeraHealthCenterImage,
    type: "Health Center",
    district: "Gasabo",
    distance: "3.8 km",
    services: ["General Medicine", "Maternity", "Pediatrics", "Pharmacy"],
    specialists: ["General Practitioner", "Nurse"],
    insurance: ["Mutuelle", "RSSB"],
    hours: "Mon - Fri: 8:00 AM - 5:00 PM",
    rating: 4.0,
    reviews: 26,
    phone: "+250 788 456 654",
    email: "info@remerahealth.rw",
    website: "www.remerahealth.rw",
    description: "Primary health center offering general consultation, maternity support, pediatric care, and pharmacy services.",
    location: "Remera, Gasabo District, Kigali",
    emergency: false,
  },
  {
    id: 15,
    name: "Nyarugenge District Clinic",
    image: nyarugengeClinicImage,
    type: "Clinic",
    district: "Nyarugenge",
    distance: "2.3 km",
    services: ["General Medicine", "Laboratory", "Pharmacy", "Internal Medicine"],
    specialists: ["General Practitioner", "Internal Medicine"],
    insurance: ["RAMA", "Mutuelle", "RSSB"],
    hours: "Mon - Sat: 8:00 AM - 5:00 PM",
    rating: 4.0,
    reviews: 35,
    phone: "+250 788 987 111",
    email: "info@nyarugengeclinic.rw",
    website: "www.nyarugengeclinic.rw",
    description: "Clinic offering general medical consultation, internal medicine, laboratory, and pharmacy services.",
    location: "Nyarugenge District, Kigali",
    emergency: false,
  },
];

const qs=[{q:['diabetes','blood sugar','glucose'],a:'For diabetes care, you may need an internal medicine doctor or endocrinologist. I can also show facilities offering Diabetes Care.'},{q:['rama','rssb','mutuelle','insurance'],a:'I can search facilities by accepted insurance. Try typing RAMA, RSSB, or Mutuelle in the facility search page.'},{q:['chest pain','emergency'],a:'Chest pain can be serious. Please seek urgent care immediately or visit a facility with emergency services. IZI Health does not diagnose.'},{q:['blurred vision'],a:'Blurred vision may happen when blood glucose is high. Please log your reading and consult a healthcare professional if it continues.'}];
function get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}}function set(k,v){localStorage.setItem(k,JSON.stringify(v))}function current(){return get(KEY.user,null)}
function App(){const[user,setUser]=useState(current());const login=u=>{set(KEY.user,u);setUser(u)};const logout=()=>{localStorage.removeItem(KEY.user);setUser(null)};return <BrowserRouter><Navbar user={user} logout={logout}/><Routes><Route path="/" element={<Home/>}/><Route path="/about" element={<About/>}/><Route path="/login" element={<Login onLogin={login}/>}/><Route path="/register" element={<Register onLogin={login}/>}/><Route path="/facilities" element={<Protected user={user}><Facilities/></Protected>}/><Route path="/ncd" element={<Protected user={user}><NCD user={user}/></Protected>}/><Route path="/admin" element={<Protected user={user}><Admin/></Protected>}/><Route path="*" element={<Navigate to="/"/>}/></Routes><Chatbot user={user}/></BrowserRouter>}
function Protected({user,children}){const loc=useLocation();return user?children:<Navigate to="/login" state={{from:loc.pathname}}/>}
function Navbar({user,logout}){return <div className="nav"><Link to="/" className="brand"><div className="logo"><HeartPulse size={28}/></div><div><b>IZI Health</b><span>Smart Healthcare Navigation</span></div></Link><div className="links"><Link to="/">Home</Link><Link to="/facilities">Facilities</Link><Link to="/ncd">NCD Support</Link><Link to="/about">About Us</Link>{user?.role==='ADMIN'&&<Link to="/admin">Admin</Link>}</div><div className="auth">{user?<><span className="chip">Hi, {user.name.split(' ')[0]}</span><button onClick={logout} className="outline"><LogOut size={16}/>Logout</button></>:<><Link to="/login" className="outline">Login</Link><Link to="/register" className="primary">Register</Link></>}</div></div>}

function Home() {
  const nav = useNavigate();

  return (
    <>
      <section className="hero">
        <div className="heroText">
          <h1>
            Find the right healthcare facility in <span>Kigali ♡</span>
          </h1>

          <p>
            Search, connect and get the healthcare you need with ease.
          </p>

          <div className="heroActions">
            <button onClick={() => nav("/facilities")} className="primary big">
              <Search size={18} /> Find a Facility
            </button>

            <button
              onClick={() =>
                document.getElementById("services")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="soft big"
            >
              Our Services ↓
            </button>
          </div>

          <span className="safe">
            <Shield /> Free guidance. Always here for you.
          </span>
        </div>
      </section>

      <section className="section" id="services">
        <h2>How IZI Health helps you</h2>

        <div className="cards4">
          <Info
            icon={<Building2 />}
            title="Facility Search"
            text="Find healthcare facilities near you based on services, specialists and insurance."
            action="Search Now"
            to="/facilities"
          />

          <Info
            icon={<MessageCircle />}
            title="Health Navigator"
            text="Chat with our assistant to get healthcare navigation guidance."
            action="Chat Now"
            chat
          />

          <Info
            icon={<HeartPulse />}
            title="NCD Support"
            text="Manage diabetes with logs, reminders, medications and risk alerts."
            action="Go to NCD Support"
            to="/ncd"
          />

          <Info
            icon={<Shield />}
            title="Safe Support"
            text="Simple, safe guidance that does not replace professional medical care."
            action="Learn More"
            to="/about"
          />
        </div>

        <div className="quality">
          <div className="hospitalArt">+</div>

          <div>
            <h2>Quality care, closer to you.</h2>

            <p>
              IZI Health connects you to trusted healthcare facilities across
              Kigali so you can get the right care at the right time.
            </p>

            <div className="stats">
              <b>
                15+
                <span>Health Facilities</span>
              </b>

              <b>
                100+
                <span>Specialists</span>
              </b>

              <b>
                10+
                <span>Insurance Partners</span>
              </b>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SearchInput({label}){return <div className="sinput"><small>{label}</small><span>Select {label.toLowerCase()}</span></div>}
function Info({icon,title,text,action,to,chat}){const nav=useNavigate();return <div className="info"><div className="round">{icon}</div><h3>{title}</h3><p>{text}</p><button onClick={()=>chat?window.dispatchEvent(new Event('open-chat')):nav(to)}>{action} →</button></div>}
function About(){return <main className="page"><h1>About IZI Health</h1><p className="lead">IZI Health is a patient-facing digital platform for healthcare navigation, AI-assisted symptom guidance, and basic diabetes self-management support in Rwanda.</p><div className="grid2"><div className="panel"><h2>Our Mission</h2><p>To help patients and caregivers find appropriate facilities, understand available services, identify accepted insurance, and manage basic NCD-related care tasks safely.</p></div><div className="panel"><h2>Safety Boundary</h2><p>The chatbot does not diagnose, prescribe medication, or replace clinical assessment. It provides navigation guidance and encourages professional care.</p></div></div><div className="panel"><h2>Contact Us</h2><p><Mail/> support@izihealth.rw</p><p><Phone/> +250 788 000 000</p><p><MapPin/> Kigali, Rwanda</p></div></main>}

function Login({ onLogin }) {
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

      onLogin(data.user);

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

function Register({onLogin}){const nav=useNavigate();const[form,setForm]=useState({name:'',email:'',password:'',confirm:''});const[err,setErr]=useState('');const[loading,setLoading]=useState(false);async function submit(e){e.preventDefault();setErr('');if(!form.name||!form.email||!form.password)return setErr('All fields are required.');if(form.password!==form.confirm)return setErr('Passwords do not match.');setLoading(true);try{const response=await fetch(`${API_URL}/api/auth/register`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:form.name,email:form.email,password:form.password})});const data=await response.json();if(!response.ok)throw new Error(data.message||'Registration failed.');onLogin(data.user);nav('/ncd')}catch(error){console.error('Registration error:',error);setErr(error.message||'Could not register.')}finally{setLoading(false)}}return <Auth title="Create your account" subtitle="Register to use facility search, health logs and reminders"><form onSubmit={submit} className="form"><input className="input" placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input className="input" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input className="input" placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><input className="input" placeholder="Confirm password" type="password" value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})}/>{err&&<p className="error">{err}</p>}<button className="primary full" disabled={loading}>{loading?'Registering...':'Register'}</button><p>Already have account? <Link to="/login">Login</Link></p></form></Auth>}
function Auth({title,subtitle,children}){return <main className="authPage"><div className="authCard"><div className="logo bigLogo"><HeartPulse/></div><h1>{title}</h1><p>{subtitle}</p>{children}</div></main>}

const searchTypos = {
  diabets: "diabetes",
  diabtes: "diabetes",
  diabetis: "diabetes",
  mutuel: "mutuelle",
  mutuele: "mutuelle",
  ramaa: "rama",
  cardiolgist: "cardiologist",
  cardilogist: "cardiologist",
  pediatrcs: "pediatrics",
  headach: "headache",
  hedache: "headache",
  suger: "sugar",
  glocose: "glucose",
};

function normalizeSearch(text) {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((word) => searchTypos[word] || word)
    .join(" ");
}

function expandSearch(text) {
  let query = normalizeSearch(text);

  const map = {
    headache: "general medicine",
    migraine: "general medicine",
    fever: "general medicine",
    cough: "general medicine",
    flu: "general medicine",
    diabetes: "diabetes care",
    glucose: "diabetes care",
    sugar: "diabetes care",
    insulin: "diabetes care",
    heart: "cardiology",
    chest: "emergency cardiology",
    pregnancy: "maternity",
    pregnant: "maternity",
    baby: "pediatrics",
    child: "pediatrics",
    children: "pediatrics",
  };

  Object.keys(map).forEach((word) => {
    if (query.includes(word)) {
      query += " " + map[word];
    }
  });

  return query;
}

function Facilities(){
  const params = new URLSearchParams(window.location.search);
  const initialSearch = params.get("q") || "";

  const [q,setQ]=useState(initialSearch);
  const [page,setPage]=useState(1);
  const [selected,setSelected]=useState(
    facilities.find(f => f.name.toLowerCase().includes(initialSearch.toLowerCase())) || facilities[0]
  );

  const per=4;

  const filtered = useMemo(() => {
  const expandedQuery = expandSearch(q);

  return facilities.filter((f) => {
    const searchable = (
      f.name +
      " " +
      f.type +
      " " +
      f.district +
      " " +
      f.services.join(" ") +
      " " +
      f.specialists.join(" ") +
      " " +
      f.insurance.join(" ")
    ).toLowerCase();

    return expandedQuery
      .split(/\s+/)
      .some((word) => word && searchable.includes(word));
  });
}, [q]);

  const pages=Math.max(1,Math.ceil(filtered.length/per));
  const list=filtered.slice((page-1)*per,page*per);

  return <main className="facilityPage">
    <div className="facilityHero">
      <h1>Find a Healthcare Facility</h1>
      <p>Search by facility, service, specialist, district, or insurance like RAMA and Mutuelle.</p>

      <div className="wideSearch">
        <Search/>
        <input
          value={q}
          onChange={e=>{setQ(e.target.value);setPage(1)}}
          placeholder="Type anything: RAMA, Mutuelle, diabetes, cardiologist, King Faisal..."
        />
        <button className="primary">Search</button>
        <button onClick={()=>setQ('')} className="outline">Reset</button>
      </div>
    </div>

    <div className="facilityLayout">
      <aside className="filters">
        <h3>Filter Results</h3>
        {[
  //'All Districts', 
  'Nyarugenge',
  'Gasabo',
  'Kicukiro',
  'All Services',
  'General Medicine',
  'Diabetes Care',
  'Cardiology',
  'Pediatrics',
  'Maternity',
  'Laboratory',
  'Pharmacy',
  'All Insurance',
  'RSSB',
  'RAMA',
  'Mutuelle',
  'Jubilee',
  'AAR'
].map(x=>
          
          <label key={x}>
            <input type="checkbox" onChange={e=>setQ(e.target.checked&&x!=='All Districts'?x:'')}/> {x}
          </label>
        )}
      </aside>

      <section className="facilityList">
        <div className="between">
          <b>{filtered.length} facilities found</b>
          <select><option>Nearest</option><option>Highest rated</option></select>
        </div>

        {list.map(f=><FacilityCard key={f.id} f={f} onView={()=>setSelected(f)}/>)}

        <div className="pagers">
          <button onClick={()=>setPage(Math.max(1,page-1))}><ChevronLeft size={16}/></button>
          {[...Array(pages)].map((_,i)=>
            <button className={page===i+1?'active':''} onClick={()=>setPage(i+1)} key={i}>{i+1}</button>
          )}
          <button onClick={()=>setPage(Math.min(pages,page+1))}><ChevronRight size={16}/></button>
        </div>
      </section>

      <Profile f={selected}/>
    </div>
  </main>
}
function FacilityCard({f,onView}){
  return (
    <article className="facilityCard">
      <div className="facilityCardImageWrap">
        <img
          className="facilityCardImage"
          src={f.image || facilityPlaceholder}
          alt={f.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = facilityPlaceholder;
          }}
        />
      </div>

      <div className="facilityCardContent">
        <div className="facilityCardTitleRow">
          <h3>{f.name}</h3>
          <span className="facilityTypeBadge">{f.type}</span>
        </div>

        <p className="facilityLocationLine">
          <MapPin size={17}/>
          <strong>{f.district} District</strong>
          <span>•</span>
          <span>{f.distance}</span>
        </p>

        <div className="facilityServiceTags">
          {f.services.slice(0,3).map((service)=>(
            <span key={service}>{service}</span>
          ))}
          {f.services.length > 3 && <span>+{f.services.length-3}</span>}
        </div>

        <p className="facilityInsuranceLine">
          <Shield size={17}/>
          <span>{f.insurance.join(', ')}</span>
        </p>

        <div className="facilityCardBottom">
          <p className={f.emergency ? 'facilityHours openNow' : 'facilityHours'}>
            <Clock size={17}/>
            <span>{f.hours}</span>
          </p>

          <p className="facilityRating">
            <span className="facilityStar">★</span>
            <strong>{f.rating}</strong>
            <span>({f.reviews} reviews)</span>
          </p>
        </div>
      </div>

      <button onClick={onView} className="facilityProfileButton">
        View Profile
      </button>
    </article>
  );
}
function Profile({f}){
  if(!f) return null;

  return (
    <aside className="profile">
      <button className="close"><X/></button>

      <img
        src={f.image || facilityPlaceholder}
        alt={f.name}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = facilityPlaceholder;
        }}
        style={{
          width: "100%",
          height: "210px",
          objectFit: "cover",
          borderRadius: "16px",
          marginBottom: "16px",
        }}
      />

      <h2>{f.name}<span>{f.type}</span></h2>
      <p>⭐ {f.rating} ({f.reviews} reviews) • {f.distance}</p>
      <p><MapPin/> {f.location}</p>

      <div className="iconRow">
        <button><Phone/>Call</button>
        <button><MapPin/>Directions</button>
        <button><Globe2/>Website</button>
      </div>

      <h3>About</h3>
      <p>{f.description}</p>

      <h3>Services</h3>
      <div className="twoCols">
        {f.services.map(s=><span key={s}>✓ {s}</span>)}
      </div>

      <h3>Specialists</h3>
      {f.specialists.map(s=><p key={s} className="doc"><User/> Dr. Demo - {s}</p>)}

      <h3>Insurance Accepted</h3>
      <div className="tags">{f.insurance.map(i=><small key={i}>{i}</small>)}</div>

      <h3>Contact</h3>
      <p><Phone/> {f.phone}</p>
      <p><Mail/> {f.email}</p>

      <button className="primary full">Get Directions</button>
    </aside>
  );
}
function NCD({user}) {
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
function Admin() {
  const [tab, setTab] = useState("Dashboard");
  const [query, setQuery] = useState("");
  const [adminFacilities, setAdminFacilities] = useState(
    get("izi_admin_facilities", facilities)
  );

  const [form, setForm] = useState({
    name: "",
    type: "Clinic",
    district: "Gasabo",
    services: "",
    specialists: "",
    insurance: "",
    phone: "",
  });

  const users = get(KEY.users, []);
  const logs = Object.keys(localStorage)
    .filter((k) => k.startsWith(KEY.logs))
    .flatMap((k) => get(k, []));

  const filteredFacilities = adminFacilities.filter((f) =>
    (f.name + " " + f.district + " " + f.services.join(" "))
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  function addFacility(e) {
    e.preventDefault();

    const newFacility = {
      id: Date.now(),
      name: form.name,
      image: facilityPlaceholder,
      type: form.type,
      district: form.district,
      services: form.services.split(",").map((x) => x.trim()),
      specialists: form.specialists.split(",").map((x) => x.trim()),
      insurance: form.insurance.split(",").map((x) => x.trim()),
      phone: form.phone,
      rating: 4.0,
      reviews: 0,
      hours: "Mon - Fri: 8:00 AM - 5:00 PM",
      distance: "New",
      email: "info@facility.rw",
      website: "www.facility.rw",
      description: "New facility added by administrator.",
      location: `${form.district}, Kigali`,
      emergency: false,
    };

    const updated = [newFacility, ...adminFacilities];
    setAdminFacilities(updated);
    set("izi_admin_facilities", updated);

    setForm({
      name: "",
      type: "Clinic",
      district: "Gasabo",
      services: "",
      specialists: "",
      insurance: "",
      phone: "",
    });
  }

  function deleteFacility(id) {
    const updated = adminFacilities.filter((f) => f.id !== id);
    setAdminFacilities(updated);
    set("izi_admin_facilities", updated);
  }

  return (
    <main className="adminPage">
      <aside className="adminSide">
        <div className="brand">
          <div className="logo"><HeartPulse /></div>
          <div>
            <b>IZI Health</b>
            <span>Admin Dashboard</span>
          </div>
        </div>

        {["Dashboard", "Facilities", "Users", "Health Logs", "Chatbot Logs"].map((x) => (
          <button
            className={tab === x ? "sel" : ""}
            key={x}
            onClick={() => setTab(x)}
          >
            {x}
          </button>
        ))}
      </aside>

      <section className="adminMain">
        <div className="adminTop">
          <h1>Welcome back, Admin! 👋</h1>
          <input
            placeholder="Search facilities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="dashCards">
          <Metric icon={<Building2 />} title="Total Facilities" value={adminFacilities.length} sub="Managed facilities" />
          <Metric icon={<Users />} title="Registered Users" value={users.length} sub="Local accounts" />
          <Metric icon={<Droplet />} title="NCD Logs Recorded" value={logs.length} sub="Saved glucose logs" />
          <Metric icon={<MessageCircle />} title="Chatbot Messages" value={get(KEY.chat, []).length} sub="Saved messages" />
        </div>

        {tab === "Dashboard" && (
          <>
            <div className="grid2">
              <div className="panel">
                <h2>Facilities by District</h2>
                {["Nyarugenge", "Gasabo", "Kicukiro"].map((d) => (
                  <p className="medrow" key={d}>
                    <Building2 />
                    <b>{d}</b>
                    <span>{adminFacilities.filter((f) => f.district === d).length}</span>
                  </p>
                ))}
              </div>

              <div className="panel">
                <h2>System Summary</h2>
                <p>Total users: {users.length}</p>
                <p>Total glucose logs: {logs.length}</p>
                <p>Total chatbot messages: {get(KEY.chat, []).length}</p>
              </div>
            </div>
          </>
        )}

        {tab === "Facilities" && (
          <div className="grid2">
            <form onSubmit={addFacility} className="panel form">
              <h2>Add Facility</h2>

              <input className="input" placeholder="Facility name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />

              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option>Hospital</option>
                <option>Clinic</option>
                <option>Health Center</option>
              </select>

              <select className="input" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
                <option>Gasabo</option>
                <option>Kicukiro</option>
                <option>Nyarugenge</option>
              </select>

              <input className="input" placeholder="Services e.g. Diabetes Care, Laboratory" value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} />
              <input className="input" placeholder="Specialists e.g. Endocrinologist" value={form.specialists} onChange={(e) => setForm({ ...form, specialists: e.target.value })} />
              <input className="input" placeholder="Insurance e.g. RAMA, Mutuelle" value={form.insurance} onChange={(e) => setForm({ ...form, insurance: e.target.value })} />
              <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

              <button className="primary full"><Plus /> Add Facility</button>
            </form>

            <div className="panel">
              <h2>Manage Facilities</h2>

              {filteredFacilities.map((f) => (
                <div className="adminFacilityCard" key={f.id}>
                  <div>
                    <b>{f.name}</b>
                    <small>{f.type} • {f.district}</small>
                    <small>{f.services.join(", ")}</small>
                  </div>

                  <button
                    className="deleteLogBtn"
                    onClick={() => deleteFacility(f.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Users" && (
          <div className="panel">
            <h2>Registered Users</h2>
            {users.map((u, i) => (
              <p className="medrow" key={i}>
                <User />
                <b>{u.name}</b>
                <span>{u.email}</span>
                <span>{u.role}</span>
              </p>
            ))}
          </div>
        )}

        {tab === "Health Logs" && (
          <div className="panel">
            <h2>Health Logs</h2>
            {logs.map((l) => (
              <p className="medrow" key={l.id}>
                <Droplet />
                <b>{l.glucose} mg/dL</b>
                <span>{l.date}</span>
                <span>{l.prediction?.riskLevel || "No prediction"}</span>
              </p>
            ))}
          </div>
        )}

        {tab === "Chatbot Logs" && (
          <div className="panel">
            <h2>Chatbot Logs</h2>
            {get(KEY.chat, []).map((c, i) => (
              <p className="medrow" key={i}>
                <MessageCircle />
                <b>{c.sender}</b>
                <span>{c.message}</span>
              </p>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Chatbot({ user }) {
  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState(
    get(KEY.chat, [
      {
        sender: "bot",
        message:
          "Hello! 👋 I am your Health Navigator. How can I help you today?",
      },
    ])
  );

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleOpenChat = () => setOpen(true);

    window.addEventListener("open-chat", handleOpenChat);

    return () => {
      window.removeEventListener("open-chat", handleOpenChat);
    };
  }, []);

  async function send() {
    if (!text.trim()) return;

    const userText = text;

    const updatedMessages = [
      ...messages,
      {
        sender: "user",
        message: userText,
      },
    ];

    setMessages(updatedMessages);
    set(KEY.chat, updatedMessages);
    setText("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: userText,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Chat request failed.");
      }

      const data = await response.json();

      const finalMessages = [
        ...updatedMessages,
        {
          sender: "bot",
          message:
            data.answer || "Sorry, I could not find a good answer.",
          facilities: data.facilities || [],
        },
      ];

      setMessages(finalMessages);
      set(KEY.chat, finalMessages);
    } catch (error) {
      console.error("Chatbot error:", error);

      const errorMessages = [
        ...updatedMessages,
        {
          sender: "bot",
          message:
            "Sorry, the chatbot service is not available. Make sure the backend and ML service are running.",
        },
      ];

      setMessages(errorMessages);
      set(KEY.chat, errorMessages);
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    const newMessages = [
      {
        sender: "bot",
        message: "New conversation started. How can I help?",
      },
    ];

    setMessages(newMessages);
    set(KEY.chat, newMessages);
  }

  return (
    <>
      {open && (
        <div className="chat">
          <div className="chatHead">
            <HeartPulse />
            <b>Health Navigator</b>
            <span>AI</span>

            <button
              type="button"
              onClick={() => setOpen(false)}
            >
              <X />
            </button>
          </div>

          <div className="chatBody">
            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.sender === "user"
                    ? "bubble user"
                    : "bubble"
                }
              >
                <div>{message.message}</div>

                {message.facilities &&
                  message.facilities.length > 0 && (
                    <div style={{ marginTop: "10px" }}>
                      {message.facilities.map((facility) => (
                        <a
                          key={facility.id}
                          href={`/facilities?q=${encodeURIComponent(
                            facility.name
                          )}`}
                          style={{
                            display: "block",
                            marginTop: "8px",
                            padding: "8px",
                            borderRadius: "10px",
                            background: "#f1ecff",
                            color: "#3b1978",
                            textDecoration: "none",
                            fontWeight: "600",
                          }}
                        >
                          View {facility.name}
                        </a>
                      ))}
                    </div>
                  )}
              </div>
            ))}

            {loading && (
              <div className="bubble">Thinking...</div>
            )}
          </div>

          <div className="chatActions">
            <button
              type="button"
              onClick={clear}
            >
              Clear history
            </button>
          </div>

          <div className="chatInput">
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !loading) {
                  send();
                }
              }}
              placeholder="Type your message..."
              disabled={loading}
            />

            <button
              type="button"
              onClick={send}
              disabled={loading}
            >
              <Send />
            </button>
          </div>

          <small className="disclaimer">
            This chatbot does not diagnose or prescribe medication.
          </small>
        </div>
      )}

      <button
        type="button"
        className="chatBtn"
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <MessageCircle />}
      </button>
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <App />
);
