import { useNavigate } from "react-router-dom";
import { Search, Building2, MessageCircle, HeartPulse, Shield, Mail, Phone, MapPin } from "lucide-react";
import SafetyNotice from "../components/SafetyNotice.jsx";
export function Home() {
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

      <SafetyNotice />

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
export function About(){return <main className="page"><h1>About IZI Health</h1><p className="lead">IZI Health is a patient-facing digital platform for healthcare navigation, AI-assisted symptom guidance, and basic diabetes self-management support in Rwanda.</p><SafetyNotice/><div className="grid2"><div className="panel"><h2>Our Mission</h2><p>To help patients and caregivers find appropriate facilities, understand available services, identify accepted insurance, and manage basic NCD-related care tasks safely.</p></div><div className="panel"><h2>Safety Boundary</h2><p>The chatbot does not diagnose, prescribe medication, or replace clinical assessment. It provides navigation guidance and encourages professional care.</p></div></div><div className="panel"><h2>Contact Us</h2><p><Mail/> support@izihealth.rw</p><p><Phone/> +250 788 000 000</p><p><MapPin/> Kigali, Rwanda</p></div></main>}

