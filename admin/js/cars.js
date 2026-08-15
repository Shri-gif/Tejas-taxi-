let carCache = [];


/* =========================
   LOAD CARS
========================= */

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


  carsBody.innerHTML = carCache.map(c => {

    const price =
      c.price_per_km !== null &&
      c.price_per_km !== undefined &&
      c.price_per_km !== ''
        ? `₹${c.price_per_km}/km`
        : 'Price on request';


    return `
      <tr>

        <td>
          ${
            c.image_url
              ? `<img src="${esc(c.image_url)}" alt="${esc(c.name || '')}">`
              : '—'
          }
        </td>

        <td>
          ${esc(c.name || '')}
        </td>

        <td>
          ${esc(c.category || '')}
        </td>

        <td>
          ${price}
        </td>

        <td>
          ${c.seats || ''}
        </td>

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
    `;

  }).join('');


  statCars.textContent = carCache.length;

};


/* =========================
   ADD CAR BUTTON
========================= */

addCar.onclick = () => openCar();


/* =========================
   OPEN CAR MODAL
========================= */

function openCar(id) {

  const c =
    carCache.find(x => x.id === id) || {};


  openModal(

    id ? 'Edit Car' : 'Add Car',

    `

      <div class="grid2">

        <label>

          Name

          <input
            required
            name="name"
            value="${esc(c.name || '')}"
            placeholder="Toyota Innova">

        </label>


        <label>

          Category

          <input
            name="category"
            value="${esc(c.category || '')}"
            placeholder="Crysta">

        </label>


        <label>

          Price / km

          <input
            type="number"
            name="price_per_km"
            min="0"
            step="0.01"
            value="${
              c.price_per_km !== null &&
              c.price_per_km !== undefined
                ? c.price_per_km
                : ''
            }"
            placeholder="18">

        </label>


        <label>

          Seats

          <input
            type="number"
            name="seats"
            min="0"
            step="1"
            value="${c.seats || ''}"
            placeholder="7">

        </label>


        <label>

          Luggage

          <input
            name="luggage"
            value="${esc(c.luggage || '')}"
            placeholder="3 Bags">

        </label>


        <label>

          Photo URL

          <input
            name="image_url"
            value="${esc(c.image_url || '')}"
            placeholder="https://...">

        </label>

      </div>


      <label>

        Features

        <input
          name="features"
          value="${
            Array.isArray(c.features)
              ? esc(c.features.join(', '))
              : ''
          }"
          placeholder="AC, Comfortable, GPS">

      </label>


      <label>

        <input
          type="checkbox"
          name="active"
          ${c.active !== false ? 'checked' : ''}>

        Visible

      </label>


      <button
        type="submit"
        class="primary">

        Save Car

      </button>

    `,


    async f => {


      /* =========================
         BASIC VALUES
      ========================= */

      const name =
        (f.get('name') || '').trim();


      const category =
        (f.get('category') || '').trim();


      const luggage =
        (f.get('luggage') || '').trim();


      const image_url =
        (f.get('image_url') || '').trim();


      /* =========================
         PRICE
      ========================= */

      const priceText =
        (f.get('price_per_km') || '').trim();


      let price_per_km = null;


      if (priceText !== '') {

        const number =
          Number(priceText);


        if (!Number.isFinite(number)) {

          alert('Please enter a valid price.');

          return;

        }


        price_per_km = number;

      }


      /* =========================
         SEATS
      ========================= */

      const seatsText =
        (f.get('seats') || '').trim();


      let seats = 0;


      if (seatsText !== '') {

        const number =
          Number(seatsText);


        if (!Number.isFinite(number)) {

          alert('Please enter a valid number of seats.');

          return;

        }


        seats = number;

      }


      /* =========================
         FEATURES
         
         IMPORTANT:
         Always send a real array.
      ========================= */

      const featuresText =
        (f.get('features') || '').trim();


      const features =
        featuresText === ''
          ? []
          : featuresText
              .split(',')
              .map(x => x.trim())
              .filter(x => x.length > 0);


      /* =========================
         ACTIVE
      ========================= */

      const active =
        f.get('active') === 'on';


      /* =========================
         FINAL DATA
      ========================= */

      const p = {

        name,

        category,

        price_per_km,

        seats,

        luggage,

        image_url,

        features,

        active

      };


      /* =========================
         VALIDATION
      ========================= */

      if (!name) {

        alert('Car name is required.');

        return;

      }


      /* =========================
         SAVE
      ========================= */

      let result;


      if (id) {

        result = await client
          .from('cars')
          .update(p)
          .eq('id', id);

      } else {

        result = await client
          .from('cars')
          .insert([p]);

      }


      /* =========================
         ERROR
      ========================= */

      if (result.error) {

        console.error(
          'CAR SAVE ERROR:',
          result.error
        );


        alert(
          'Car save failed:\n\n' +
          result.error.message
        );


        return;

      }


      /* =========================
         SUCCESS
      ========================= */

      closeModal();

      await loadCars();

    }

  );

}


/* =========================
   EDIT CAR
========================= */

window.editCar = openCar;


/* =========================
   DELETE CAR
========================= */

window.deleteCar = async id => {


  if (!confirm('Delete car?')) {

    return;

  }


  const { error } = await client
    .from('cars')
    .delete()
    .eq('id', id);


  if (error) {

    alert(error.message);

    return;

  }


  await loadCars();

};
