import { useEffect, useState } from "react";
import { Building2, Droplet, HeartPulse, MessageCircle, Plus, User, Users } from "lucide-react";
import { API_URL, KEY, authHeaders, getStored, setStored } from "../config.js";
import { facilities, facilityPlaceholder } from "../data/facilities.js";

const get = getStored;
const set = setStored;
function Metric({ icon, title, value, sub }) {
  return (
    <div className="metric">
      <div className="round">{icon}</div>
      <p>{title}</p>
      <h2>{value}</h2>
      <small>{sub}</small>
    </div>
  );
}
export default function Admin() {
  const [tab, setTab] = useState("Dashboard");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
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

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await fetch(`${API_URL}/api/users`, {
          headers: authHeaders(),
        });

        if (response.ok) {
          setUsers(await response.json());
        }
      } catch (error) {
        console.error("Could not load users:", error);
      }
    }

    loadUsers();
  }, []);

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

