const CONFIG = {
  businessName: "Tejas Taxi",
  phone: "+91 98765 43210",
  whatsapp: "919876543210",
  email: "booking@tejastaxi.in",
  address: "Your City, India"
};

document.querySelectorAll("[data-business-name]").forEach(el => el.textContent = CONFIG.businessName.toUpperCase());
const phoneLinks = ["topPhone","callBtn1","footerPhone"];
phoneLinks.forEach(id => {
  const el=document.getElementById(id);
  if(!el)return;
  el.textContent = id==="callBtn1" ? "⌕  Call now" : CONFIG.phone;
  el.href = "tel:" + CONFIG.phone.replace(/\s+/g,"");
});
document.getElementById("phoneText").textContent=CONFIG.phone;
document.getElementById("emailText").textContent=CONFIG.email;
document.getElementById("footerEmail").textContent=CONFIG.email;
document.getElementById("footerEmail").href="mailto:"+CONFIG.email;
document.querySelectorAll(".footer-grid span").forEach(el=>{if(el.textContent.includes("[ADDRESS]"))el.textContent=CONFIG.address});

const menu=document.querySelector(".menu-btn"), nav=document.querySelector("#nav");
menu.addEventListener("click",()=>nav.classList.toggle("open"));
nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));

const dateInput=document.querySelector('input[name="date"]');
const today=new Date();
today.setMinutes(today.getMinutes()-today.getTimezoneOffset());
dateInput.min=today.toISOString().slice(0,10);

document.getElementById("bookingForm").addEventListener("submit", function(e){
  e.preventDefault();
  const data=new FormData(this);
  const msg =
`*New Taxi Booking Request*
Name: ${data.get("name")}
Mobile: ${data.get("mobile")}
Pickup: ${data.get("pickup")}
Drop: ${data.get("drop")}
Date: ${data.get("date")}
Time: ${data.get("time")}
Trip: ${data.get("trip")}
Passengers: ${data.get("passengers")}
Notes: ${data.get("notes") || "None"}`;
  const url="https://wa.me/"+CONFIG.whatsapp+"?text="+encodeURIComponent(msg);
  document.getElementById("formMsg").innerHTML="Opening WhatsApp for your booking…";
  window.open(url,"_blank");
});
\n\n// Load cars managed from the Supabase admin panel.\nasync function loadCarsFromSupabase() {\n  const grid = document.getElementById("fleetGrid");\n  if (!grid || typeof supabaseClient === "undefined") return;\n  const { data, error } = await supabaseClient.from("cars").select("*").eq("active", true).order("created_at", { ascending: false });\n  if (error) { console.error(error); return; }\n  if (!data || data.length === 0) {\n    grid.innerHTML = '<div class="loading-cars">Our fleet will be updated soon.</div>';\n    return;\n  }\n  grid.innerHTML = data.map(car => {\n    const features = Array.isArray(car.features) ? car.features : [];\n    const img = car.image_url || "images/hero-car.svg";\n    return `<article class="car-card"><img src="${escapeHtml(img)}" alt="${escapeHtml(car.name)}"><div class="tag">${escapeHtml(car.category || "TAXI")}</div><div class="card-body"><h3>${escapeHtml(car.name)} <a href="#booking">→</a></h3><p>${car.price_per_km ? `From ₹${Number(car.price_per_km).toLocaleString("en-IN")}/km` : "Get a quote"}</p><div class="car-meta">✓ ${escapeHtml(String(car.seats || "—"))} seats &nbsp; ✓ ${escapeHtml(car.luggage || "Luggage")} &nbsp; ✓ AC</div><div class="car-meta">${features.length ? features.map(f => "✓ "+escapeHtml(f)).join(" &nbsp; ") : "✓ One way &nbsp; ✓ Round trip"}</div></div></article>`;\n  }).join("");\n}\nfunction escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }\ndocument.addEventListener("DOMContentLoaded", loadCarsFromSupabase);\n