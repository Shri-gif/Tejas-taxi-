const esc = v =>
  String(v ?? '').replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[m]));

// =========================
// SETTINGS
// =========================
async function loadSettings() {
  const { data, error } = await supabaseClient
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    console.error('SETTINGS ERROR:', error);
    return;
  }

  if (!data) {
    console.warn('No site settings found.');
    return;
  }

  console.log('SETTINGS LOADED:', data);

  document.title =
    (data.business_name || 'Tejas Taxi') +
    ' | Safe. Simple. On Time.';

  document.querySelectorAll('[data-business]').forEach(x => {
    x.textContent = data.business_name || 'Tejas Taxi';
  });

  if (data.phone) {
    document.querySelectorAll('[data-phone]').forEach(x => {
      x.textContent = data.phone;
      x.href = 'tel:' + data.phone.replace(/\s/g, '');
    });
  }

  const heroTitle = document.querySelector('#heroTitle');
  if (heroTitle && data.hero_title) {
    heroTitle.innerHTML = esc(data.hero_title).replace(/\n/g, '<br>');
  }

  const heroDescription = document.querySelector('#heroDescription');
  if (heroDescription && data.hero_description) {
    heroDescription.textContent = data.hero_description;
  }

  const heroImage = document.querySelector('#heroImage');
  if (heroImage && data.hero_image_url) {
    heroImage.src = data.hero_image_url;
  }

  const aboutText = document.querySelector('#aboutText');
  if (aboutText && data.about_text) {
    aboutText.textContent = data.about_text;
  }

  if (data.whatsapp && typeof TEJAS !== 'undefined') {
    TEJAS.whatsapp = data.whatsapp;
  }
}


// =========================
// CARS
// =========================
async function loadCars() {
  const box = document.querySelector('#fleetGrid');
  if (!box) return;

  const { data, error } = await supabaseClient
    .from('cars')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('CARS ERROR:', error);
    return;
  }

  box.innerHTML = (data || []).map(c => `
    <article class="car-card">
      <img
        src="${esc(c.image_url || 'images/hero-car.svg')}"
        alt="${esc(c.name)}"
      >

      <span class="tag">
        ${esc(c.category || 'TAXI')}
      </span>

      <div class="car-body">
        <h3>${esc(c.name)}</h3>

        <p>
          From ₹${Number(c.price_per_km || 0)}/km
        </p>

        <div class="meta">
          ✓ ${esc(c.seats || '')} seats
          &nbsp; ✓ ${esc(c.luggage || '')}
          &nbsp; ✓ AC
        </div>

        <div class="meta">
          ${(c.features || [])
            .map(x => '✓ ' + esc(x))
            .join(' &nbsp; ')}
        </div>
      </div>
    </article>
  `).join('');
}


// =========================
// SERVICES
// =========================
async function loadServices(){
  const {data,error}=await supabaseClient
    .from('services')
    .select('*')
    .eq('active',true)
    .order('created_at');

  const b=document.querySelector('#serviceGrid');
  if(!b)return;

  if(error){
    console.error('Services error:',error);
    b.innerHTML='<p>Unable to load services: '+esc(error.message)+'</p>';
    return;
  }

  b.innerHTML=(data||[]).map((s,i)=>`
    <article class="service-card">
      <div class="icon">${esc(s.icon||'✦')}</div>
      <small>0${i+1}</small>
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.description||'')}</p>
      <a href="#booking">Book this service →</a>
    </article>
  `).join('');
}

  if (!data || data.length === 0) {
    box.innerHTML = '<p>No services available right now.</p>';
  }
}


// =========================
// ROUTES
// =========================
async function loadRoutes(){
  const {data,error}=await supabaseClient
    .from('routes')
    .select('*')
    .eq('active',true)
    .order('created_at');

  const b=document.querySelector('#routesTable');
  if(!b)return;

  if(error){
    console.error('Routes error:',error);
    b.innerHTML='<p>Unable to load routes: '+esc(error.message)+'</p>';
    return;
  }

  b.innerHTML=
    '<div class="route header"><span>ROUTE</span><span>DISTANCE/TIME</span><span>ONE WAY</span><span>ROUND TRIP</span><span></span></div>'+
    (data||[]).map(r=>`
      <div class="route">
        <span>${esc(r.pickup)} → ${esc(r.destination)}</span>
        <span>${esc(r.distance||'')}<br>${esc(r.travel_time||'')}</span>
        <b>₹${Number(r.one_way_price||0).toLocaleString('en-IN')}</b>
        <b>₹${Number(r.round_trip_price||0).toLocaleString('en-IN')}</b>
        <a href="#booking">Book →</a>
      </div>
    `).join('');
}

  if (!data || data.length === 0) {
    box.innerHTML += '<p>No routes available right now.</p>';
  }
}


// =========================
// REVIEWS
// =========================
async function loadReviews(){
  const {data,error}=await supabaseClient
    .from('reviews')
    .select('*')
    .eq('active',true)
    .order('created_at',{ascending:false})
    .limit(6);

  const b=document.querySelector('#reviewGrid');
  if(!b)return;

  if(error){
    console.error('Reviews error:',error);
    b.innerHTML='<p>Unable to load reviews: '+esc(error.message)+'</p>';
    return;
  }

  b.innerHTML=(data||[]).map(r=>`
    <article class="review-card">
      ★★★★★
      <p>“${esc(r.review)}”</p>
      <b>🟡 ${esc(r.customer_name)}</b>
      <small>${esc(r.city||'')}</small>
    </article>
  `).join('');
}

  if (!data || data.length === 0) {
    box.innerHTML = '<p>No reviews available yet.</p>';
  }
}


// =========================
// START WEBSITE
// =========================
document.addEventListener('DOMContentLoaded', async () => {

  document
    .querySelector('.menu-btn')
    ?.addEventListener('click', () => {
      document
        .querySelector('#nav')
        .classList.toggle('open');
    });

  await loadSettings();

  await Promise.all([
    loadCars(),
    loadServices(),
    loadRoutes(),
    loadReviews()
  ]);

});
