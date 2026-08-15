(() => {
  const db = window.supabaseClient;
  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const toast = (msg, bad=false) => {
    const el=$("toast"); el.textContent=msg; el.className="toast show"+(bad?" bad":"");
    setTimeout(()=>el.className="toast",2600);
  };

  const configs = {
    cars: {
      body:"carsBody", table:"cars",
      fields:[
        ["name","Name","text",true],["category","Category","text",false],
        ["price","Price","number",false],["seats","Seats","number",false],
        ["image_url","Photo URL","url",false],["status","Status","text",false]
      ],
      columns:r=>`<td>${r.image_url?`<img class="thumb" src="${esc(r.image_url)}" onerror="this.style.display='none'">`:"—"}</td><td>${esc(r.name)}</td><td>${esc(r.category)}</td><td>₹${esc(r.price)}</td><td>${esc(r.seats)}</td><td>${esc(r.status||"active")}</td>`
    },
    routes: {
      body:"routesBody", table:"routes",
      fields:[
        ["from_city","From","text",true],["to_city","To","text",true],
        ["distance","Distance","text",false],["duration","Time","text",false],
        ["one_way_price","One Way Price","number",false],["round_trip_price","Round Trip Price","number",false]
      ],
      columns:r=>`<td>${esc(r.from_city)} → ${esc(r.to_city)}</td><td>${esc(r.distance)}</td><td>${esc(r.duration)}</td><td>₹${esc(r.one_way_price)}</td><td>₹${esc(r.round_trip_price)}</td>`
    },
    services: {
      body:"servicesBody", table:"services",
      fields:[
        ["title","Title","text",true],["description","Description","textarea",false],
        ["icon","Icon","text",false],["status","Status","text",false]
      ],
      columns:r=>`<td>${esc(r.title)}</td><td>${esc(r.description)}</td><td>${esc(r.icon)}</td><td>${esc(r.status||"active")}</td>`
    },
    reviews: {
      body:"reviewsBody", table:"reviews",
      fields:[
        ["name","Name","text",true],["city","City","text",false],
        ["rating","Rating (1-5)","number",false],["review","Review","textarea",true]
      ],
      columns:r=>`<td>${esc(r.name)}</td><td>${esc(r.city)}</td><td>${"★".repeat(Math.max(0,Math.min(5,Number(r.rating)||0)))}</td><td>${esc(r.review)}</td>`
    }
  };

  async function load(table, bodyId) {
    const {data,error}=await db.from(table).select("*").order("created_at",{ascending:false});
    if(error){ $(bodyId).innerHTML=`<tr><td colspan="10" class="empty">Could not load ${esc(table)}: ${esc(error.message)}</td></tr>`; return []; }
    return data||[];
  }

  async function renderResource(type) {
    const c=configs[type], rows=await load(c.table,c.body);
    $(c.body).innerHTML=rows.length ? rows.map(r=>`<tr data-id="${esc(r.id)}">${c.columns(r)}<td class="actions"><button class="small edit" data-type="${type}" data-id="${esc(r.id)}">Edit</button><button class="small danger delete" data-table="${c.table}" data-id="${esc(r.id)}">Delete</button></td></tr>`).join("") :
      `<tr><td colspan="10" class="empty">No records yet. Click “Add ${type.slice(0,-1)}”.</td></tr>`;
  }

  async function dashboard() {
    for (const [table,id] of [["cars","statCars"],["routes","statRoutes"],["services","statServices"],["reviews","statReviews"],["bookings","statBookings"]]) {
      const {count,error}=await db.from(table).select("*",{count:"exact",head:true});
      $(id).textContent=error?"—":(count??0);
    }
  }

  function fieldsHTML(type,row={}) {
    return configs[type].fields.map(([key,label,kind,required])=>{
      const value=esc(row[key]);
      if(kind==="textarea") return `<label>${label}<textarea name="${key}" ${required?"required":""}>${value}</textarea></label>`;
      return `<label>${label}<input name="${key}" type="${kind}" value="${value}" ${required?"required":""}></label>`;
    }).join("") + `<div class="form-actions"><button type="button" class="secondary" id="cancelModal">Cancel</button><button class="primary">Save</button></div>`;
  }

  async function openEditor(type,id=null) {
    const c=configs[type]; let row={};
    if(id){ const {data,error}=await db.from(c.table).select("*").eq("id",id).single(); if(error){toast(error.message,true);return;} row=data; }
    $("modalTitle").textContent=(id?"Edit ":"Add ")+type.slice(0,-1);
    $("modalForm").innerHTML=fieldsHTML(type,row);
    $("modal").classList.remove("hidden");
    $("modalForm").onsubmit=async e=>{
      e.preventDefault();
      const obj=Object.fromEntries(new FormData(e.target).entries());
      for(const f of c.fields) if(f[2]==="number" && obj[f[0]]!=="") obj[f[0]]=Number(obj[f[0]]);
      let q=id?db.from(c.table).update(obj).eq("id",id):db.from(c.table).insert(obj);
      const {error}=await q;
      if(error){toast(error.message,true);return;}
      $("modal").classList.add("hidden"); toast("Saved successfully"); await renderResource(type); await dashboard();
    };
    $("cancelModal").onclick=()=> $("modal").classList.add("hidden");
  }

  async function remove(table,id,type) {
    if(!confirm("Delete this item?")) return;
    const {error}=await db.from(table).delete().eq("id",id);
    if(error) toast(error.message,true); else {toast("Deleted"); await renderResource(type); await dashboard();}
  }

  async function loadBookings() {
    const {data,error}=await db.from("bookings").select("*").order("created_at",{ascending:false});
    const body=$("bookingsBody");
    if(error){body.innerHTML=`<tr><td colspan="10" class="empty">${esc(error.message)}</td></tr>`;return;}
    body.innerHTML=(data||[]).map(r=>`<tr>
      <td>${esc(r.created_at||r.booking_date)}</td>
      <td>${esc(r.customer_name||r.name)}<br><small>${esc(r.phone)}</small></td>
      <td>${esc(r.from_city||r.pickup)} → ${esc(r.to_city||r.drop)}</td>
      <td>${esc(r.trip_type)}</td><td>${esc(r.passengers)}</td><td>${esc(r.status||"new")}</td>
      <td><button class="small" data-booking="${esc(r.id)}" data-status="confirmed">Confirm</button>
      <button class="small danger" data-booking="${esc(r.id)}" data-status="cancelled">Cancel</button></td>
    </tr>`).join("") || `<tr><td colspan="10" class="empty">No bookings.</td></tr>`;
  }

  async function loadSettings() {
    const {data,error}=await db.from("settings").select("*").limit(1).maybeSingle();
    if(error){toast("Settings: "+error.message,true);return;}
    if(!data)return;
    const form=$("settingsForm");
    Object.keys(data).forEach(k=>{if(form.elements[k]) form.elements[k].value=data[k]??"";});
  }

  $("loginForm").onsubmit=async e=>{
    e.preventDefault(); $("loginError").textContent="";
    const {error}=await db.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});
    if(error){$("loginError").textContent=error.message;return;}
    init();
  };
  $("logoutBtn").onclick=async()=>{await db.auth.signOut();location.reload();};

  document.querySelectorAll(".nav").forEach(btn=>btn.onclick=()=>{
    document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active"); $(btn.dataset.panel).classList.add("active");
    $("pageTitle").textContent=btn.textContent.replace(/^[^A-Za-z]+/,"");
    if(btn.dataset.panel==="bookings") loadBookings();
  });

  document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>openEditor(b.dataset.add));
  document.addEventListener("click",e=>{
    const edit=e.target.closest(".edit"); if(edit) openEditor(edit.dataset.type,edit.dataset.id);
    const del=e.target.closest(".delete"); if(del) remove(del.dataset.table,del.dataset.id,del.dataset.type);
    const booking=e.target.closest("[data-booking]"); if(booking) updateBooking(booking.dataset.booking,booking.dataset.status);
  });
  $("closeModal").onclick=()=> $("modal").classList.add("hidden");
  $("refreshBookings").onclick=loadBookings;
  $("menuBtn").onclick=()=>document.querySelector(".sidebar").classList.toggle("open");

  async function updateBooking(id,status){
    const {error}=await db.from("bookings").update({status}).eq("id",id);
    if(error) toast(error.message,true); else {toast("Booking updated");loadBookings();dashboard();}
  }

  $("settingsForm").onsubmit=async e=>{
    e.preventDefault();
    const obj=Object.fromEntries(new FormData(e.target).entries());
    const {data}=await db.from("settings").select("id").limit(1).maybeSingle();
    let result=data ? await db.from("settings").update(obj).eq("id",data.id) : await db.from("settings").insert(obj);
    $("settingsMsg").textContent=result.error?result.error.message:"Saved ✓";
    if(result.error) toast(result.error.message,true); else toast("Settings saved");
  };

  async function init(){
    const {data}=await db.auth.getSession();
    if(!data.session){$("loginScreen").classList.remove("hidden");$("app").classList.add("hidden");return;}
    $("loginScreen").classList.add("hidden");$("app").classList.remove("hidden");
    await Promise.all([dashboard(),renderResource("cars"),renderResource("routes"),renderResource("services"),renderResource("reviews"),loadSettings()]);
  }
  db.auth.onAuthStateChange((_event,session)=>{
    if(session){$("loginScreen").classList.add("hidden");$("app").classList.remove("hidden");}
  });
  init();
})();