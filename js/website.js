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
    .from('settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Settings error:', error);
    return;
  }

  if (!data) {
    console.warn('No settings row found.');
    return;
  }

  // Business name
  document.title =
    (data.business_name || 'Tejas Taxi') +
    ' | Safe. Simple. On Time.';

  document.querySelectorAll('[data-business]').forEach(el => {
    el.textContent = data.business_name || 'Tejas Taxi';
  });

  // Phone
  if (data.phone) {
    document.querySelectorAll('[data-phone]').forEach(el => {
      el.textContent = data.phone;
      el.href = 'tel:' + data.phone.replace(/\s/g, '');
    });
  }

  // Hero title
  const heroTitle = document.querySelector('#heroTitle');
  if (heroTitle && data.hero_title) {
    heroTitle.innerHTML = esc(data.hero_title).replace(/\n/g, '<br>');
  }

  // Hero description
  const heroDescription = document.querySelector('#heroDescription');
  if (heroDescription && data.hero_description) {
    heroDescription.textContent = data.hero_description;
  }

  // Hero image
  const heroImage = document.querySelector('#heroImage');
  if (heroImage && data.hero_image_url) {
    heroImage.src = data.hero_image_url;
  }

  // About text
  const aboutText = document.querySelector('#aboutText');
  if (aboutText && data.about_text) {
    aboutText.textContent = data.about_text;
  }

  // WhatsApp
  if (data.whatsapp && typeof TEJAS !== 'undefined') {
    TEJAS.whatsapp = data.whatsapp;
  }

  console.log('Settings loaded:', data);
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
async function loadServices() {
  const { data, error } = await supabaseClient
    .from('services')
    .select('*')
    .eq('status', true)
    .order('created_at', { ascending: true });

  const b = document.querySelector('#serviceGrid');
  if (!b) return;

  if (error) {
    console.error('Services error:', error);
    b.innerHTML = `<p>Unable to load services.</p>`;
    return;
  }

  b.innerHTML = (data || []).map((s, i) => `
    <article class="service-card">
      <div class="icon">${esc(s.icon || '✦')}</div>
      <small>0${i + 1}</small>
      <h3>${esc(s.title || '')}</h3>
      <p>${esc(s.description || '')}</p>
      <a href="#booking">Book this service →</a>
    </article>
  `).join('');
}
// =========================
// ROUTES
// =========================

async function loadRoutes() {
  const { data, error } = await supabaseClient
    .from('routes')
    .select('*')
    .eq('visible', true)
    .order('created_at', { ascending: true });

  const b = document.querySelector('#routesTable');
  if (!b) return;

  if (error) {
    console.error('Routes error:', error);
    b.innerHTML = `<p>Unable to load routes.</p>`;
    return;
  }

  b.innerHTML = `
    <div class="route header">
      <span>ROUTE</span>
      <span>DISTANCE / TIME</span>
      <span>ONE WAY</span>
      <span>ROUND TRIP</span>
      <span></span>
    </div>

    ${(data || []).map(r => `
      <div class="route">
        <span>
          ${esc(r.from_city || '')} → ${esc(r.to_city || '')}
        </span>

        <span>
          ${esc(r.distance || '')}<br>
          ${esc(r.duration || '')}
        </span>

        <b>
          ₹${Number(r.one_way_price || 0).toLocaleString('en-IN')}
        </b>

        <b>
          ₹${Number(r.round_price || 0).toLocaleString('en-IN')}
        </b>

        <a href="#booking">Book →</a>
      </div>
    `).join('')}
  `;
}


// =========================
// REVIEWS
// =========================
async function loadReviews() {
  const { data, error } = await supabaseClient
    .from('reviews')
    .select('*')
    .eq('visible', true)
    .order('created_at', { ascending: false })
    .limit(6);

  const b = document.querySelector('#reviewGrid');
  if (!b) return;

  if (error) {
    console.error('Reviews error:', error);
    b.innerHTML = `<p>Unable to load reviews.</p>`;
    return;
  }

  b.innerHTML = (data || []).map(r => `
    <article class="review-card">
      <div class="stars">
        ${'★'.repeat(Number(r.rating || 5))}
      </div>

      <p>“${esc(r.review || '')}”</p>

      <b>🟡 ${esc(r.name || '')}</b>

      <small>${esc(r.city || '')}</small>
    </article>
  `).join('');
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
