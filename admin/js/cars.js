let carCache = [];

window.loadCars = async () => {
  const { data, error } = await client
    .from('cars')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    alert(error.message);
    return;
  }

  carCache = data || [];

  carsBody.innerHTML = carCache.map(c => `
    <tr>
      <td>
        ${c.image_url
          ? `<img src="${esc(c.image_url)}">`
          : '—'}
      </td>

      <td>${esc(c.name || '')}</td>

      <td>${esc(c.category || '')}</td>

      <td>
        ${
          c.price_per_km != null
            ? `₹${c.price_per_km}/km`
            : 'Price on request'
        }
      </td>

      <td>${c.seats || ''}</td>

      <td>
        ${c.active ? 'Active' : 'Hidden'}
      </td>

      <td>
        <button
          class="small"
          onclick="editCar('${c.id}')">
          Edit
        </button>

        <button
          class="small danger"
          onclick="deleteCar('${c.id}')">
          Delete
        </button>
      </td>
    </tr>
  `).join('');

  statCars.textContent = carCache.length;
};


addCar.onclick = () => openCar();


function openCar(id) {

  const c = carCache.find(x => x.id === id) || {};

  openModal(
    id ? 'Edit Car' : 'Add Car',

    `
      <div class="grid2">

        <label>
          Name
          <input
            required
            name="name"
            value="${esc(c.name || '')}">
        </label>

        <label>
          Category
          <input
            name="category"
            value="${esc(c.category || '')}">
        </label>

        <label>
          Price / km
          <input
            type="number"
            name="price_per_km"
            value="${c.price_per_km != null ? c.price_per_km : ''}"
            placeholder="Leave blank">
        </label>

        <label>
          Seats
          <input
            type="number"
            name="seats"
            value="${c.seats || ''}">
        </label>

        <label>
          Photo URL
          <input
            name="image_url"
            value="${esc(c.image_url || '')}">
        </label>

        <label>
          Status
          <input
            name="status"
            value="${esc(c.status || 'Available')}">
        </label>

      </div>

      <label>
        <input
          type="checkbox"
          name="active"
          ${c.active !== false ? 'checked' : ''}>
        Visible
      </label>

      <button class="primary">
        Save Car
      </button>
    `,

    async f => {

      const priceValue = f.get('price_per_km');
      const seatsValue = f.get('seats');

      const p = {

        name: f.get('name'),

        category: f.get('category'),

        // Price blank = NULL
        price_per_km:
          priceValue === ''
            ? null
            : Number(priceValue),

        // Seats blank = 0
        seats:
          seatsValue === ''
            ? 0
            : Number(seatsValue),

        image_url:
          f.get('image_url'),

        status:
          f.get('status') || 'Available',

        active:
          f.get('active') === 'on'
      };


      const { error } = id
        ? await client
            .from('cars')
            .update(p)
            .eq('id', id)

        : await client
            .from('cars')
            .insert(p);


      if (error) {

        alert(error.message);

      } else {

        closeModal();

        loadCars();

      }

    }
  );
}


window.editCar = openCar;


window.deleteCar = async id => {

  if (confirm('Delete car?')) {

    const { error } = await client
      .from('cars')
      .delete()
      .eq('id', id);

    if (error) {

      alert(error.message);

    } else {

      loadCars();

    }
  }
};
