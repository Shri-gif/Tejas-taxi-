// ============================================================
// TEJAS TAXI - CARS ADMIN
// Supabase table: public.cars
//
// Columns:
// id
// name
// category
// price
// seats
// luggage
// image_url
// features       -> JSONB ARRAY
// visible        -> BOOLEAN
// created_at
// ============================================================

(() => {
  "use strict";

  const db = window.supabaseClient;

  if (!db) {
    console.error("Supabase client not found.");
    return;
  }

  const $ = (id) => document.getElementById(id);

  // ------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
  }

  function showError(message) {
    console.error(message);
    alert(message);
  }

  function parseFeatures(value) {
    if (Array.isArray(value)) {
      return value
        .map(v => String(v).trim())
        .filter(Boolean);
    }

    const text = String(value ?? "").trim();

    if (!text) {
      return [];
    }

    // If user enters JSON array:
    // ["Fully AC","Music System"]
    if (text.startsWith("[")) {
      try {
        const parsed = JSON.parse(text);

        if (!Array.isArray(parsed)) {
          throw new Error("Features must be a JSON array.");
        }

        return parsed
          .map(v => String(v).trim())
          .filter(Boolean);

      } catch (error) {
        throw new Error(
          'Features JSON is invalid. Use ["Fully AC","Music System"] or write features separated by commas.'
        );
      }
    }

    // Normal input:
    // Fully AC, Music System, Push Back Seats
    return text
      .split(/[,|\n]/)
      .map(v => v.trim())
      .filter(Boolean);
  }

  function formatFeatures(value) {
    if (Array.isArray(value)) {
      return value.join(", ");
    }

    return String(value ?? "");
  }

  function money(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "₹0";
    }

    return `₹${number}`;
  }

  // ------------------------------------------------------------
  // Load Cars
  // ------------------------------------------------------------

  async function loadCars() {
    const body = $("carsBody");

    if (!body) {
      return;
    }

    body.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:25px;">
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
          <td colspan="7" style="text-align:center;padding:25px;color:#c00;">
            ${esc(error.message)}
          </td>
        </tr>
      `;

      return;
    }

    if (!data || data.length === 0) {
      body.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;padding:25px;">
            No cars added yet.
          </td>
        </tr>
      `;
      return;
    }

    body.innerHTML = data.map(car => `
      <tr>

        <td>
          ${
            car.image_url
              ? `
                <img
                  src="${esc(car.image_url)}"
                  alt="${esc(car.name)}"
                  style="
                    width:70px;
                    height:45px;
                    object-fit:cover;
                    border-radius:8px;
                  "
                  onerror="this.style.display='none'"
                >
              `
              : `<span>No photo</span>`
          }
        </td>

        <td>
          <strong>${esc(car.name)}</strong>
        </td>

        <td>
          ${esc(car.category)}
        </td>

        <td>
          ${money(car.price)}/km
        </td>

        <td>
          ${esc(car.seats)}
        </td>

        <td>
          ${
            car.visible
              ? `<span class="status active">Visible</span>`
              : `<span class="status inactive">Hidden</span>`
          }
        </td>

        <td>
          <button
            class="small-btn edit-car"
            data-id="${esc(car.id)}"
          >
            Edit
          </button>

          <button
            class="small-btn danger delete-car"
            data-id="${esc(car.id)}"
          >
            Delete
          </button>
        </td>

      </tr>
    `).join("");

    // Edit buttons
    document.querySelectorAll(".edit-car").forEach(button => {
      button.addEventListener("click", () => {
        const id = button.dataset.id;
        editCar(id);
      });
    });

    // Delete buttons
    document.querySelectorAll(".delete-car").forEach(button => {
      button.addEventListener("click", () => {
        const id = button.dataset.id;
        deleteCar(id);
      });
    });
  }

  // ------------------------------------------------------------
  // Open Add Car
  // ------------------------------------------------------------

  function openAddCar() {
    const modal = $("modal");
    const modalTitle = $("modalTitle");
    const form = $("modalForm");

    if (!modal || !modalTitle || !form) {
      return;
    }

    modalTitle.textContent = "Add Car";

    form.innerHTML = `
      <div class="grid2">

        <label>
          Name
          <input
            name="name"
            type="text"
            placeholder="e.g. Innova"
            required
          >
        </label>

        <label>
          Category
          <input
            name="category"
            type="text"
            placeholder="e.g. Crysta"
            required
          >
        </label>

        <label>
          Price / km
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="18"
            required
          >
        </label>

        <label>
          Seats
          <input
            name="seats"
            type="number"
            min="1"
            placeholder="7"
            required
          >
        </label>

        <label>
          Luggage
          <input
            name="luggage"
            type="text"
            placeholder="As per need"
          >
        </label>

        <label>
          Photo URL
          <input
            name="image_url"
            type="url"
            placeholder="https://..."
          >
        </label>

        <label>
          Features
          <textarea
            name="features"
            rows="3"
            placeholder="Fully AC, Music System, Comfortable Seats"
          ></textarea>
          <small class="muted">
            Separate features with commas.
          </small>
        </label>

        <label style="display:flex;align-items:center;gap:10px;">
          <input
            name="visible"
            type="checkbox"
            checked
          >
          Visible
        </label>

      </div>

      <div class="modal-actions">
        <button
          type="button"
          class="darkbtn"
          id="cancelCar"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="primary"
        >
          Save
        </button>
      </div>
    `;

    modal.classList.add("show");

    const cancelButton = $("cancelCar");

    if (cancelButton) {
      cancelButton.addEventListener("click", closeModal);
    }

    form.onsubmit = async (event) => {
      event.preventDefault();

      await saveCar(null, new FormData(form));
    };
  }

  // ------------------------------------------------------------
  // Edit Car
  // ------------------------------------------------------------

  async function editCar(id) {
    const { data: car, error } = await db
      .from("cars")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Car fetch error:", error);
      showError(error.message);
      return;
    }

    const modal = $("modal");
    const modalTitle = $("modalTitle");
    const form = $("modalForm");

    if (!modal || !modalTitle || !form) {
      return;
    }

    modalTitle.textContent = "Edit Car";

    form.innerHTML = `
      <div class="grid2">

        <label>
          Name
          <input
            name="name"
            type="text"
            value="${esc(car.name)}"
            required
          >
        </label>

        <label>
          Category
          <input
            name="category"
            type="text"
            value="${esc(car.category)}"
            required
          >
        </label>

        <label>
          Price / km
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            value="${esc(car.price)}"
            required
          >
        </label>

        <label>
          Seats
          <input
            name="seats"
            type="number"
            min="1"
            value="${esc(car.seats)}"
            required
          >
        </label>

        <label>
          Luggage
          <input
            name="luggage"
            type="text"
            value="${esc(car.luggage)}"
          >
        </label>

        <label>
          Photo URL
          <input
            name="image_url"
            type="url"
            value="${esc(car.image_url)}"
          >
        </label>

        <label>
          Features
          <textarea
            name="features"
            rows="3"
          >${esc(formatFeatures(car.features))}</textarea>
          <small class="muted">
            Separate features with commas.
          </small>
        </label>

        <label style="display:flex;align-items:center;gap:10px;">
          <input
            name="visible"
            type="checkbox"
            ${car.visible ? "checked" : ""}
          >
          Visible
        </label>

      </div>

      <div class="modal-actions">

        <button
          type="button"
          class="darkbtn"
          id="cancelCar"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="primary"
        >
          Update
        </button>

      </div>
    `;

    modal.classList.add("show");

    const cancelButton = $("cancelCar");

    if (cancelButton) {
      cancelButton.addEventListener("click", closeModal);
    }

    form.onsubmit = async (event) => {
      event.preventDefault();

      await saveCar(car.id, new FormData(form));
    };
  }

  // ------------------------------------------------------------
  // Save / Update Car
  // ------------------------------------------------------------

  async function saveCar(id, formData) {
    try {
      const features = parseFeatures(
        formData.get("features")
      );

      const payload = {
        name: String(formData.get("name") || "").trim(),

        category: String(
          formData.get("category") || ""
        ).trim(),

        price: Number(
          formData.get("price") || 0
        ),

        seats: Number(
          formData.get("seats") || 4
        ),

        luggage: String(
          formData.get("luggage") || ""
        ).trim(),

        image_url: String(
          formData.get("image_url") || ""
        ).trim(),

        // IMPORTANT:
        // Database expects JSONB ARRAY
        features: features,

        // IMPORTANT:
        // Database column is "visible", NOT "active"
        visible: formData.get("visible") === "on"
      };

      if (!payload.name) {
        showError("Please enter car name.");
        return;
      }

      if (!payload.category) {
        showError("Please enter car category.");
        return;
      }

      if (!Number.isFinite(payload.price)) {
        showError("Please enter a valid price.");
        return;
      }

      if (!Number.isFinite(payload.seats)) {
        showError("Please enter valid seats.");
        return;
      }

      let result;

      if (id) {
        result = await db
          .from("cars")
          .update(payload)
          .eq("id", id);
      } else {
        result = await db
          .from("cars")
          .insert(payload);
      }

      if (result.error) {
        console.error("Car save error:", result.error);
        showError(result.error.message);
        return;
      }

      closeModal();

      await loadCars();

      // Update dashboard counters if available
      if (typeof window.loadDashboard === "function") {
        window.loadDashboard();
      }

    } catch (error) {
      console.error("Car save exception:", error);
      showError(error.message || "Could not save car.");
    }
  }

  // ------------------------------------------------------------
  // Delete Car
  // ------------------------------------------------------------

  async function deleteCar(id) {
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
      showError(error.message);
      return;
    }

    await loadCars();

    if (typeof window.loadDashboard === "function") {
      window.loadDashboard();
    }
  }

  // ------------------------------------------------------------
  // Close Modal
  // ------------------------------------------------------------

  function closeModal() {
    const modal = $("modal");
    const form = $("modalForm");

    if (form) {
      form.innerHTML = "";
      form.onsubmit = null;
    }

    if (modal) {
      modal.classList.remove("show");
    }
  }

  // ------------------------------------------------------------
  // Initialize
  // ------------------------------------------------------------

  function init() {
    const addButton = $("addCar");

    if (addButton) {
      addButton.addEventListener("click", openAddCar);
    }

    const closeButton = $("closeModal");

    if (closeButton) {
      closeButton.addEventListener("click", closeModal);
    }

    const modal = $("modal");

    if (modal) {
      modal.addEventListener("click", (event) => {
        if (event.target === modal) {
          closeModal();
        }
      });
    }

    loadCars();
  }

  // Make available globally
  window.loadCars = loadCars;

  // Start after DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
