// ============================================================
// TEJAS TAXI - SERVICES ADMIN
// Supabase table: public.services
// ============================================================

(() => {
  "use strict";

  const db = window.supabaseClient;

  if (!db) {
    console.error("Supabase client not found.");
    return;
  }

  const $ = (id) => document.getElementById(id);

  let serviceCache = [];

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
  // LOAD SERVICES
  // ------------------------------------------------------------

  async function loadServices() {
    const body = $("servicesBody");

    if (!body) return;

    body.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;padding:25px;">
          Loading services...
        </td>
      </tr>
    `;

    const { data, error } = await db
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Services load error:", error);

      body.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;padding:25px;color:#c00;">
            ${esc(error.message)}
          </td>
        </tr>
      `;

      return;
    }

    serviceCache = data || [];

    if (serviceCache.length === 0) {
      body.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;padding:25px;">
            No services added yet.
          </td>
        </tr>
      `;
    } else {
      body.innerHTML = serviceCache.map(service => `
        <tr>

          <td>
            <strong>
              ${esc(service.title)}
            </strong>
          </td>

          <td>
            ${esc(service.description)}
          </td>

          <td style="font-size:22px;">
            ${esc(service.icon || "✦")}
          </td>

          <td>
            ${
              service.visible
                ? "Active"
                : "Hidden"
            }
          </td>

          <td>

            <button
              class="small-btn edit-service"
              data-id="${esc(service.id)}"
            >
              Edit
            </button>

            <button
              class="small-btn danger delete-service"
              data-id="${esc(service.id)}"
            >
              Delete
            </button>

          </td>

        </tr>
      `).join("");

      document.querySelectorAll(".edit-service").forEach(button => {
        button.addEventListener("click", () => {
          editService(button.dataset.id);
        });
      });

      document.querySelectorAll(".delete-service").forEach(button => {
        button.addEventListener("click", () => {
          deleteService(button.dataset.id);
        });
      });
    }
  }

  // ------------------------------------------------------------
  // ADD SERVICE
  // ------------------------------------------------------------

  function openAddService() {
    openServiceModal(null);
  }

  // ------------------------------------------------------------
  // EDIT SERVICE
  // ------------------------------------------------------------

  function editService(id) {
    const service = serviceCache.find(
      item => item.id === id
    );

    if (!service) {
      showError("Service not found.");
      return;
    }

    openServiceModal(service);
  }

  // ------------------------------------------------------------
  // SERVICE MODAL
  // ------------------------------------------------------------

  function openServiceModal(service) {

    const modal = $("modal");
    const title = $("modalTitle");
    const form = $("modalForm");

    if (!modal || !title || !form) {
      return;
    }

    const isEdit = !!service;

    title.textContent = isEdit
      ? "Edit Service"
      : "Add Service";

    form.innerHTML = `

      <label>
        Title
        <input
          name="title"
          type="text"
          value="${esc(service?.title)}"
          placeholder="e.g. One Way Taxi"
          required
        >
      </label>

      <label>
        Description
        <textarea
          name="description"
          rows="4"
          placeholder="Describe this service..."
        >${esc(service?.description)}</textarea>
      </label>

      <label>
        Icon
        <input
          name="icon"
          type="text"
          value="${esc(service?.icon || "✦")}"
          placeholder="🚕"
        >
      </label>

      <label style="
        display:flex;
        align-items:center;
        gap:10px;
        margin-top:15px;
      ">

        <input
          type="checkbox"
          name="visible"
          ${service?.visible !== false ? "checked" : ""}
        >

        Visible

      </label>

      <div class="modal-actions">

        <button
          type="button"
          class="darkbtn"
          id="cancelService"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="primary"
        >
          ${isEdit ? "Update Service" : "Save Service"}
        </button>

      </div>
    `;

    modal.classList.add("show");

    const cancelButton = $("cancelService");

    if (cancelButton) {
      cancelButton.addEventListener(
        "click",
        closeServiceModal
      );
    }

    form.onsubmit = async (event) => {
      event.preventDefault();

      await saveService(
        service?.id || null,
        new FormData(form)
      );
    };
  }

  // ------------------------------------------------------------
  // SAVE / UPDATE SERVICE
  // ------------------------------------------------------------

  async function saveService(id, formData) {

    const title = String(
      formData.get("title") || ""
    ).trim();

    const description = String(
      formData.get("description") || ""
    ).trim();

    const icon = String(
      formData.get("icon") || "✦"
    ).trim();

    const visible =
      formData.get("visible") === "on";

    if (!title) {
      showError("Please enter service title.");
      return;
    }

    const payload = {
      title: title,
      description: description,
      icon: icon || "✦",

      // IMPORTANT:
      // New database uses "visible"
      // NOT "active"
      visible: visible
    };

    let result;

    if (id) {

      result = await db
        .from("services")
        .update(payload)
        .eq("id", id);

    } else {

      result = await db
        .from("services")
        .insert(payload);

    }

    if (result.error) {
      console.error(
        "Service save error:",
        result.error
      );

      showError(result.error.message);
      return;
    }

    closeServiceModal();

    await loadServices();

    // Update dashboard if dashboard function exists
    if (typeof window.loadDashboard === "function") {
      window.loadDashboard();
    }
  }

  // ------------------------------------------------------------
  // DELETE SERVICE
  // ------------------------------------------------------------

  async function deleteService(id) {

    const confirmed = confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await db
      .from("services")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "Service delete error:",
        error
      );

      showError(error.message);
      return;
    }

    await loadServices();

    if (typeof window.loadDashboard === "function") {
      window.loadDashboard();
    }
  }

  // ------------------------------------------------------------
  // CLOSE MODAL
  // ------------------------------------------------------------

  function closeServiceModal() {

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

  window.loadServices = loadServices;
  window.editService = editService;
  window.deleteService = deleteService;

  // ------------------------------------------------------------
  // INITIALIZE
  // ------------------------------------------------------------

  function init() {

    const addButton = $("addService");

    if (addButton) {
      addButton.addEventListener(
        "click",
        openAddService
      );
    }

    const closeButton = $("closeModal");

    if (closeButton) {
      closeButton.addEventListener(
        "click",
        closeServiceModal
      );
    }

    loadServices();
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
