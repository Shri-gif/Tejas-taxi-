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
