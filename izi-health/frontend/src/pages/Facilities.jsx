import { useMemo, useState } from "react";
import { Search, MapPin, Shield, Phone, Mail, Globe2, Stethoscope, ChevronLeft, ChevronRight, X } from "lucide-react";
import { facilities, facilityPlaceholder } from "../data/facilities.js";
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

export default function Facilities(){
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
