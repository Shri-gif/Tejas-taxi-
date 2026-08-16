(() => {
  const db = window.supabaseClient;

  if (!db) {
    console.error("Supabase client not found.");
    return;
  }

  const $ = id => document.getElementById(id);

  // --------------------------------------------------
  // Small helpers
  // --------------------------------------------------

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
  }

  function showToast(message, error = false) {
    let toast = $("adminToast");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "adminToast";

      Object.assign(toast.style, {
        position: "fixed",
        left: "50%",
        bottom: "25px",
        transform: "translateX(-50%)",
        zIndex: "99999",
        padding: "14px 22px",
        borderRadius: "12px",
        color: "#fff",
        fontSize: "15px",
        fontWeight: "600",
        maxWidth: "90%",
        textAlign: "center",
        boxShadow: "0 10px 30px rgba(0,0,0,.25)"
      });

      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.background = error ? "#c62828" : "#15803d";
    toast.style.display = "block";

    clearTimeout(window.__adminToastTimer);

    window.__adminToastTimer = setTimeout(() => {
      toast.style.display = "none";
    }, 3000);
  }

  function closeModal() {
    const modal = $("modal");
    if (modal) modal.classList.add("hidden");
  }

  function openModal() {
    const modal = $("modal");

    if (!modal) {
      showToast("Modal element not found.", true);
      return;
    }

    modal.classList.remove("hidden");
  }

  // --------------------------------------------------
  // Features JSON handling
  // --------------------------------------------------

  function parseFeatures(value) {
    if (Array.isArray(value)) {
      return value;
    }

    if (value === null || value === undefined || value === "") {
      return [];
    }

    const text = String(value).trim();

    // First try proper JSON
    try {
      const parsed = JSON.parse(text);

      if (Array.isArray(parsed)) {
        return parsed;
      }

      // If JSON is valid but not an array,
      // convert it to one item.
      return [String(parsed)];
    } catch (error) {
      // Also support simple input:
      // Fully AC, Music System, GPS
      return text
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);
    }
  }

  function featuresToText(features) {
    if (!Array.isArray(features)) {
      return "";
    }

    return features.join(", ");
  }

  // --------------------------------------------------
  // Load Cars
  // --------------------------------------------------

  async function loadCars() {
    const body = $("carsBody");

    if (!body) {
      console.error("carsBody not found.");
      return;
    }

    body.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;">
          Loading cars...
        </td>
      </tr>
    `;

    const { data, error } = await db
      .from("cars")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Cars load error:", error);

      body.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;color:#c62828;">
            ${escapeHTML(error.message)}
          </td>
        </tr>
      `;

      return;
    }

    if (!data || data.length === 0) {
      body.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;">
            No cars added yet.
          </td>
        </tr>
      `;

      return;
    }

    body.innerHTML = data.map(car => {
      const image = car.image_url
        ? `
          <img
            src="${escapeHTML(car.image_url)}"
            alt="${escapeHTML(car.name)}"
            style="
              width:70px;
              height:45px;
              object-fit:cover;
              border-radius:8px;
            "
            onerror="this.style.display='none'"
          >
        `
        : "—";

      const visibleText = car.visible ? "Visible" : "Hidden";

      return `
        <tr data-id="${escapeHTML(car.id)}">

          <td>${image}</td>

          <td>
            <strong>${escapeHTML(car.name)}</strong>
          </td>

          <td>
            ${escapeHTML(car.category || "—")}
          </td>

          <td>
            ₹${escapeHTML(car.price ?? 0)}
          </td>

          <td>
            ${escapeHTML(car.seats ?? 0)}
          </td>

          <td>
            ${visibleText}
          </td>

          <td class="actions">

            <button
              type="button"
              class="small"
              data-car-edit="${escapeHTML(car.id)}"
            >
              Edit
            </button>

            <button
              type="button"
              class="small danger"
              data-car-delete="${escapeHTML(car.id)}"
            >
              Delete
            </button>

          </td>

        </tr>
      `;
    }).join("");
  }

  // --------------------------------------------------
  // Car Form
  // --------------------------------------------------

  function carFormHTML(car = {}) {
    const features = featuresToText(car.features);

    return `
      <label>
        Name
        <input
          name="name"
          type="text"
          value="${escapeHTML(car.name)}"
          placeholder="e.g. INNOVA"
          required
        >
      </label>

      <label>
        Category
        <input
          name="category"
          type="text"
          value="${escapeHTML(car.category)}"
          placeholder="e.g. Crysta"
        >
      </label>

      <label>
        Price / km
        <input
          name="price"
          type="number"
          min="0"
          step="0.01"
          value="${escapeHTML(car.price ?? 0)}"
          placeholder="18"
        >
      </label>

      <label>
        Seats
        <input
          name="seats"
          type="number"
          min="1"
          step="1"
          value="${escapeHTML(car.seats ?? 4)}"
          placeholder="7"
        >
      </label>

      <label>
        Luggage
        <input
          name="luggage"
          type="text"
          value="${escapeHTML(car.luggage)}"
          placeholder="As per need"
        >
      </label>

      <label>
        Photo URL
        <input
          name="image_url"
          type="url"
          value="${escapeHTML(car.image_url)}"
          placeholder="https://..."
        >
      </label>

      <label>
        Features
        <input
          name="features"
          type="text"
          value="${escapeHTML(features)}"
          placeholder="Fully AC, Music System, GPS"
        >
        <small style="display:block;margin-top:5px;opacity:.7;">
          Separate multiple features with commas.
        </small>
      </label>

      <label
        style="
          display:flex;
          align-items:center;
          gap:10px;
          margin-top:10px;
        "
      >
        <input
          name="visible"
          type="checkbox"
          ${car.visible !== false ? "checked" : ""}
          style="width:auto;"
        >
        <span>Visible</span>
      </label>

      <div
        class="form-actions"
        style="
          display:flex;
          gap:10px;
          margin-top:20px;
        "
      >
        <button
          type="button"
          class="secondary"
          id="cancelCar"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="primary"
        >
          Save Car
        </button>
      </div>
    `;
  }

  // --------------------------------------------------
  // Add / Edit Car
  // --------------------------------------------------

  async function openCarEditor(id = null) {
    let car = {};

    if (id) {
      const { data, error } = await db
        .from("cars")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Car fetch error:", error);
        showToast(error.message, true);
        return;
      }

      car = data;
    }

    const title = $("modalTitle");
    const form = $("modalForm");

    if (!form) {
      showToast("Modal form not found.", true);
      return;
    }

    if (title) {
      title.textContent = id ? "Edit Car" : "Add Car";
    }

    form.innerHTML = carFormHTML(car);

    openModal();

    const cancelButton = $("cancelCar");

    if (cancelButton) {
      cancelButton.onclick = closeModal;
    }

    form.onsubmit = async event => {
      event.preventDefault();

      const formData = new FormData(form);

      const name = String(formData.get("name") || "").trim();
      const category = String(formData.get("category") || "").trim();
      const luggage = String(formData.get("luggage") || "").trim();
      const image_url = String(formData.get("image_url") || "").trim();
      const featuresInput = String(formData.get("features") || "").trim();

      if (!name) {
        showToast("Car name is required.", true);
        return;
      }

      const priceRaw = String(formData.get("price") || "").trim();
      const seatsRaw = String(formData.get("seats") || "").trim();

      const price = priceRaw === "" ? 0 : Number(priceRaw);
      const seats = seatsRaw === "" ? 4 : Number(seatsRaw);

      if (!Number.isFinite(price) || price < 0) {
        showToast("Please enter a valid price.", true);
        return;
      }

      if (!Number.isInteger(seats) || seats < 1) {
        showToast("Please enter valid seats.", true);
        return;
      }

      /*
       * IMPORTANT:
       * Supabase column "features" is JSONB.
       *
       * We send an actual JavaScript array here,
       * NOT a plain string.
       *
       * Example:
       * "Fully AC, GPS, Music System"
       *
       * becomes:
       * ["Fully AC", "GPS", "Music System"]
       */
      const features = parseFeatures(featuresInput);

      const carData = {
        name,
        category,
        price,
        seats,
        luggage,
        image_url,
        features,
        visible: form.elements.visible.checked
      };

      console.log("Saving car:", carData);

      let result;

      if (id) {
        result = await db
          .from("cars")
          .update(carData)
          .eq("id", id)
          .select()
          .single();
      } else {
        result = await db
          .from("cars")
          .insert(carData)
          .select()
          .single();
      }

      if (result.error) {
        console.error("Car save error:", result.error);
        showToast(result.error.message, true);
        return;
      }

      console.log("Car saved:", result.data);

      closeModal();

      showToast(
        id
          ? "Car updated successfully."
          : "Car added successfully."
      );

      await loadCars();

      window.dispatchEvent(
        new CustomEvent("cars-updated")
      );
    };
  }

  // --------------------------------------------------
  // Delete Car
  // --------------------------------------------------

  async function deleteCar(id) {
    if (!id) return;

    const confirmed = confirm(
      "Are you sure you want to delete this car?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await db
      .from("cars")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Car delete error:", error);
      showToast(error.message, true);
      return;
    }

    showToast("Car deleted successfully.");

    await loadCars();

    window.dispatchEvent(
      new CustomEvent("cars-updated")
    );
  }

  // --------------------------------------------------
  // Event delegation
  // --------------------------------------------------

  document.addEventListener("click", event => {

    const editButton =
      event.target.closest("[data-car-edit]");

    if (editButton) {
      const id = editButton.dataset.carEdit;
      openCarEditor(id);
      return;
    }

    const deleteButton =
      event.target.closest("[data-car-delete]");

    if (deleteButton) {
      const id = deleteButton.dataset.carDelete;
      deleteCar(id);
      return;
    }

    const addButton =
      event.target.closest("#addCar");

    if (addButton) {
      openCarEditor();
      return;
    }

    const closeButton =
      event.target.closest("#closeModal");

    if (closeButton) {
      closeModal();
    }
  });

  // --------------------------------------------------
  // Load cars after authentication
  // --------------------------------------------------

  window.addEventListener(
    "admin-auth-ready",
    async () => {
      console.log("Cars module: auth ready.");
      await loadCars();
    }
  );

  // --------------------------------------------------
  // Also load when Cars panel is opened
  // --------------------------------------------------

  window.addEventListener(
    "panel-change",
    async event => {
      if (event.detail === "cars") {
        await loadCars();
      }
    }
  );

})();
