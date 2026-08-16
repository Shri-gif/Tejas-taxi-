// ============================================================
// TEJAS TAXI - ROUTES ADMIN
// Supabase table: public.routes
// ============================================================

(() => {
  "use strict";

  const db = window.supabaseClient;

  if (!db) {
    console.error("Supabase client not found.");
    return;
  }

  const $ = (id) => document.getElementById(id);

  let routeCache = [];

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

  // ------------------------------------------------------------
  // LOAD ROUTES
  // ------------------------------------------------------------

  async function loadRoutes() {
    const body = $("routesBody");

    if (!body) return;

    body.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:25px;">
          Loading routes...
        </td>
      </tr>
    `;

    const { data, error } = await db
      .from("routes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Routes load error:", error);

      body.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;padding:25px;color:#c00;">
            ${esc(error.message)}
          </td>
        </tr>
      `;

      return;
    }

    routeCache = data || [];

    if (routeCache.length === 0) {
      body.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;padding:25px;">
            No routes added yet.
          </td>
        </tr>
      `;
    } else {
      body.innerHTML = routeCache.map(route => `
        <tr>

          <td>
            <strong>
              ${esc(route.pickup)}
              →
              ${esc(route.destination)}
            </strong>
          </td>

          <td>
            ${esc(route.distance)}
          </td>

          <td>
            ${esc(route.travel_time)}
          </td>

          <td>
            ₹${Number(route.one_way_price || 0)}
          </td>

          <td>
            ₹${Number(route.round_trip_price || 0)}
          </td>

          <td>

            <button
              class="small-btn edit-route"
              data-id="${esc(route.id)}"
            >
              Edit
            </button>

            <button
              class="small-btn danger delete-route"
              data-id="${esc(route.id)}"
            >
              Delete
            </button>

          </td>

        </tr>
      `).join("");

      document.querySelectorAll(".edit-route").forEach(button => {
        button.addEventListener("click", () => {
          editRoute(button.dataset.id);
        });
      });

      document.querySelectorAll(".delete-route").forEach(button => {
        button.addEventListener("click", () => {
          deleteRoute(button.dataset.id);
        });
      });
    }

    // Dashboard counter
    const statRoutes = $("statRoutes");

    if (statRoutes) {
      statRoutes.textContent = routeCache.length;
    }
  }

  // ------------------------------------------------------------
  // OPEN ADD ROUTE
  // ------------------------------------------------------------

  function openAddRoute() {
    openRouteModal(null);
  }

  // ------------------------------------------------------------
  // EDIT ROUTE
  // ------------------------------------------------------------

  async function editRoute(id) {
    const route = routeCache.find(item => item.id === id);

    if (!route) {
      showError("Route not found.");
      return;
    }

    openRouteModal(route);
  }

  // ------------------------------------------------------------
  // ROUTE MODAL
  // ------------------------------------------------------------

  function openRouteModal(route) {
    const modal = $("modal");
    const title = $("modalTitle");
    const form = $("modalForm");

    if (!modal || !title || !form) {
      return;
    }

    const isEdit = !!route;

    title.textContent = isEdit
      ? "Edit Route"
      : "Add Route";

    form.innerHTML = `

      <div class="grid2">

        <label>
          Pickup
          <input
            name="pickup"
            type="text"
            value="${esc(route?.pickup)}"
            placeholder="e.g. Lucknow"
            required
          >
        </label>

        <label>
          Destination
          <input
            name="destination"
            type="text"
            value="${esc(route?.destination)}"
            placeholder="e.g. Ayodhya"
            required
          >
        </label>

        <label>
          Distance
          <input
            name="distance"
            type="text"
            value="${esc(route?.distance)}"
            placeholder="e.g. 135 km"
          >
        </label>

        <label>
          Travel Time
          <input
            name="travel_time"
            type="text"
            value="${esc(route?.travel_time)}"
            placeholder="e.g. 3 hr 30 min"
          >
        </label>

        <label>
          One Way Price
          <input
            name="one_way_price"
            type="number"
            min="0"
            step="1"
            value="${route?.one_way_price ?? ""}"
            placeholder="2500"
          >
        </label>

        <label>
          Round Trip Price
          <input
            name="round_trip_price"
            type="number"
            min="0"
            step="1"
            value="${route?.round_trip_price ?? ""}"
            placeholder="4500"
          >
        </label>

      </div>

      <label style="
        display:flex;
        align-items:center;
        gap:10px;
        margin-top:15px;
      ">

        <input
          type="checkbox"
          name="visible"
          ${route?.visible !== false ? "checked" : ""}
        >

        Visible

      </label>

      <div class="modal-actions">

        <button
          type="button"
          class="darkbtn"
          id="cancelRoute"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="primary"
        >
          ${isEdit ? "Update Route" : "Save Route"}
        </button>

      </div>
    `;

    modal.classList.add("show");

    const cancelButton = $("cancelRoute");

    if (cancelButton) {
      cancelButton.addEventListener("click", closeRouteModal);
    }

    form.onsubmit = async (event) => {
      event.preventDefault();

      await saveRoute(
        route?.id || null,
        new FormData(form)
      );
    };
  }

  // ------------------------------------------------------------
  // SAVE / UPDATE ROUTE
  // ------------------------------------------------------------

  async function saveRoute(id, formData) {
    const pickup = String(
      formData.get("pickup") || ""
    ).trim();

    const destination = String(
      formData.get("destination") || ""
    ).trim();

    const distance = String(
      formData.get("distance") || ""
    ).trim();

    const travelTime = String(
      formData.get("travel_time") || ""
    ).trim();

    const oneWayPrice = Number(
      formData.get("one_way_price") || 0
    );

    const roundTripPrice = Number(
      formData.get("round_trip_price") || 0
    );

    const visible =
      formData.get("visible") === "on";

    if (!pickup) {
      showError("Please enter pickup location.");
      return;
    }

    if (!destination) {
      showError("Please enter destination.");
      return;
    }

    const payload = {
      pickup: pickup,
      destination: destination,
      distance: distance,
      travel_time: travelTime,
      one_way_price: Number.isFinite(oneWayPrice)
        ? oneWayPrice
        : 0,
      round_trip_price: Number.isFinite(roundTripPrice)
        ? roundTripPrice
        : 0,

      // IMPORTANT:
      // New database uses "visible"
      // NOT "active"
      visible: visible
    };

    let result;

    if (id) {
      result = await db
        .from("routes")
        .update(payload)
        .eq("id", id);
    } else {
      result = await db
        .from("routes")
        .insert(payload);
    }

    if (result.error) {
      console.error("Route save error:", result.error);
      showError(result.error.message);
      return;
    }

    closeRouteModal();

    await loadRoutes();

    if (typeof window.loadDashboard === "function") {
      window.loadDashboard();
    }
  }

  // ------------------------------------------------------------
  // DELETE ROUTE
  // ------------------------------------------------------------

  async function deleteRoute(id) {
    const confirmed = confirm(
      "Are you sure you want to delete this route?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await db
      .from("routes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Route delete error:", error);
      showError(error.message);
      return;
    }

    await loadRoutes();

    if (typeof window.loadDashboard === "function") {
      window.loadDashboard();
    }
  }

  // ------------------------------------------------------------
  // CLOSE MODAL
  // ------------------------------------------------------------

  function closeRouteModal() {
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
  // GLOBAL FUNCTIONS
  // ------------------------------------------------------------

  window.loadRoutes = loadRoutes;
  window.editRoute = editRoute;
  window.deleteRoute = deleteRoute;

  // ------------------------------------------------------------
  // INITIALIZE
  // ------------------------------------------------------------

  function init() {
    const addButton = $("addRoute");

    if (addButton) {
      addButton.addEventListener(
        "click",
        openAddRoute
      );
    }

    const closeButton = $("closeModal");

    if (closeButton) {
      closeButton.addEventListener(
        "click",
        closeRouteModal
      );
    }

    loadRoutes();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }

})();
