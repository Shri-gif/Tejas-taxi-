(() => {
  "use strict";

  /*
   * ============================================================
   * TEJAS TAXI ADMIN PANEL
   * Single admin controller for:
   * Cars, Routes, Services, Reviews, Bookings, Settings
   * ============================================================
   */

  const db = window.supabaseClient;

  if (!db) {
    console.error("Supabase client not found.");
    alert("Supabase connection is not initialized.");
    return;
  }

  /* ============================================================
     HELPERS
  ============================================================ */

  const $ = id => document.getElementById(id);

  const esc = value =>
    String(value ?? "").replace(
      /[&<>"']/g,
      char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char])
    );

  const toast = (message, bad = false) => {
    const el = $("toast");

    if (!el) {
      alert(message);
      return;
    }

    el.textContent = message;
    el.className = "toast show" + (bad ? " bad" : "");

    setTimeout(() => {
      el.className = "toast";
    }, 3000);
  };

  const nullableNumber = value => {
    const text = String(value ?? "").trim();

    if (text === "") {
      return null;
    }

    const number = Number(text);

    return Number.isFinite(number) ? number : null;
  };

  const numberOrZero = value => {
    const text = String(value ?? "").trim();

    if (text === "") {
      return 0;
    }

    const number = Number(text);

    return Number.isFinite(number) ? number : 0;
  };

  /*
   * Converts:
   *
   * "AC, GPS, Comfortable"
   *
   * into:
   *
   * ["AC", "GPS", "Comfortable"]
   *
   * This prevents malformed JSON-array errors.
   */
  const parseFeatures = value => {
    if (Array.isArray(value)) {
      return value;
    }

    const text = String(value ?? "").trim();

    if (!text) {
      return [];
    }

    try {
      const parsed = JSON.parse(text);

      if (Array.isArray(parsed)) {
        return parsed
          .map(x => String(x).trim())
          .filter(Boolean);
      }
    } catch (_) {
      // Not JSON. Treat as comma-separated text.
    }

    return text
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);
  };

  const displayFeatures = value => {
    return parseFeatures(value).join(", ");
  };

  const closeModal = () => {
    const modal = $("modal");

    if (modal) {
      modal.classList.add("hidden");
    }
  };


  /* ============================================================
     TABLE CONFIGURATION
  ============================================================ */

  const configs = {

    /* ==========================================================
       CARS
    ========================================================== */

    cars: {

      body: "carsBody",
      table: "cars",

      fields: [
        ["name", "Name", "text", true],
        ["category", "Category", "text", false],
        ["price_per_km", "Price / km", "number", false],
        ["seats", "Seats", "number", false],
        ["luggage", "Luggage", "text", false],
        ["image_url", "Photo URL", "url", false],
        ["features", "Features", "text", false],
        ["active", "Visible", "checkbox", false]
      ],

      columns: row => `
        <td>
          ${
            row.image_url
              ? `
                <img
                  class="thumb"
                  src="${esc(row.image_url)}"
                  alt="${esc(row.name || "Car")}"
                  onerror="this.style.display='none'"
                >
              `
              : "—"
          }
        </td>

        <td>${esc(row.name)}</td>

        <td>${esc(row.category || "")}</td>

        <td>
          ${
            row.price_per_km !== null &&
            row.price_per_km !== undefined &&
            row.price_per_km !== ""
              ? `₹${esc(row.price_per_km)}/km`
              : "Price on request"
          }
        </td>

        <td>${esc(row.seats || "")}</td>

        <td>
          ${row.active ? "Active" : "Hidden"}
        </td>
      `
    },


    /* ==========================================================
       ROUTES
    ========================================================== */

    routes: {

      body: "routesBody",
      table: "routes",

      fields: [
        ["from_city", "From", "text", true],
        ["to_city", "To", "text", true],
        ["distance", "Distance", "text", false],
        ["duration", "Time", "text", false],
        ["one_way_price", "One Way Price", "number", false],
        ["round_trip_price", "Round Trip Price", "number", false]
      ],

      columns: row => `
        <td>
          ${esc(row.from_city || "")}
          →
          ${esc(row.to_city || "")}
        </td>

        <td>${esc(row.distance || "")}</td>

        <td>${esc(row.duration || "")}</td>

        <td>
          ${
            row.one_way_price != null
              ? `₹${esc(row.one_way_price)}`
              : "On request"
          }
        </td>

        <td>
          ${
            row.round_trip_price != null
              ? `₹${esc(row.round_trip_price)}`
              : "On request"
          }
        </td>
      `
    },


    /* ==========================================================
       SERVICES
    ========================================================== */

    services: {

      body: "servicesBody",
      table: "services",

      fields: [
        ["title", "Title", "text", true],
        ["description", "Description", "textarea", false],
        ["icon", "Icon", "text", false],
        ["status", "Status", "text", false]
      ],

      columns: row => `
        <td>${esc(row.title || "")}</td>

        <td>${esc(row.description || "")}</td>

        <td>${esc(row.icon || "")}</td>

        <td>
          ${esc(row.status || "active")}
        </td>
      `
    },


    /* ==========================================================
       REVIEWS
    ========================================================== */

    reviews: {

      body: "reviewsBody",
      table: "reviews",

      fields: [
        ["name", "Name", "text", true],
        ["city", "City", "text", false],
        ["rating", "Rating (1-5)", "number", false],
        ["review", "Review", "textarea", true]
      ],

      columns: row => {

        const rating = Math.max(
          0,
          Math.min(
            5,
            Number(row.rating) || 0
          )
        );

        return `
          <td>${esc(row.name || "")}</td>

          <td>${esc(row.city || "")}</td>

          <td>
            ${"★".repeat(rating)}
          </td>

          <td>
            ${esc(row.review || "")}
          </td>
        `;
      }
    }

  };


  /* ============================================================
     LOAD TABLE
  ============================================================ */

  async function load(table) {

    const config = configs[table];

    if (!config) {
      return [];
    }

    const {
      data,
      error
    } = await db
      .from(config.table)
      .select("*")
      .order("created_at", {
        ascending: false
      });

    if (error) {

      const body = $(config.body);

      if (body) {
        body.innerHTML = `
          <tr>
            <td
              colspan="10"
              class="empty"
            >
              Could not load ${esc(config.table)}:
              ${esc(error.message)}
            </td>
          </tr>
        `;
      }

      console.error(
        `Error loading ${config.table}:`,
        error
      );

      return [];
    }

    return data || [];
  }


  /* ============================================================
     RENDER RESOURCE
  ============================================================ */

  async function renderResource(type) {

    const config = configs[type];

    if (!config) {
      return;
    }

    const body = $(config.body);

    if (!body) {
      return;
    }

    const rows = await load(type);

    if (!rows.length) {

      body.innerHTML = `
        <tr>
          <td
            colspan="10"
            class="empty"
          >
            No records yet.
          </td>
        </tr>
      `;

      return;
    }

    body.innerHTML = rows
      .map(row => `
        <tr data-id="${esc(row.id)}">

          ${config.columns(row)}

          <td class="actions">

            <button
              class="small edit"
              data-type="${type}"
              data-id="${esc(row.id)}"
            >
              Edit
            </button>

            <button
              class="small danger delete"
              data-table="${config.table}"
              data-type="${type}"
              data-id="${esc(row.id)}"
            >
              Delete
            </button>

          </td>

        </tr>
      `)
      .join("");
  }


  /* ============================================================
     DASHBOARD COUNTS
  ============================================================ */

  async function dashboard() {

    const counters = [
      ["cars", "statCars"],
      ["routes", "statRoutes"],
      ["services", "statServices"],
      ["reviews", "statReviews"],
      ["bookings", "statBookings"]
    ];

    for (const [table, elementId] of counters) {

      const element = $(elementId);

      if (!element) {
        continue;
      }

      const {
        count,
        error
      } = await db
        .from(table)
        .select("*", {
          count: "exact",
          head: true
        });

      element.textContent =
        error
          ? "—"
          : (count ?? 0);
    }
  }


  /* ============================================================
     FORM HTML
  ============================================================ */

  function fieldsHTML(type, row = {}) {

    const config = configs[type];

    return config.fields
      .map(([key, label, kind, required]) => {

        const rawValue = row[key];

        /* ------------------------------
           CHECKBOX
        ------------------------------ */

        if (kind === "checkbox") {

          const checked =
            rawValue !== false;

          return `
            <label class="checkbox-label">

              <input
                name="${key}"
                type="checkbox"
                ${checked ? "checked" : ""}
              >

              ${label}

            </label>
          `;
        }


        /* ------------------------------
           TEXTAREA
        ------------------------------ */

        if (kind === "textarea") {

          return `
            <label>

              ${label}

              <textarea
                name="${key}"
                ${required ? "required" : ""}
              >${esc(rawValue || "")}</textarea>

            </label>
          `;
        }


        /* ------------------------------
           FEATURES
        ------------------------------ */

        let value = rawValue ?? "";

        if (key === "features") {
          value = displayFeatures(rawValue);
        }


        /* ------------------------------
           NORMAL INPUT
        ------------------------------ */

        return `
          <label>

            ${label}

            <input
              name="${key}"
              type="${kind}"
              value="${esc(value)}"
              ${required ? "required" : ""}
            >

          </label>
        `;

      })
      .join("")
      +
      `
        <div class="form-actions">

          <button
            type="button"
            class="secondary"
            id="cancelModal"
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
  }


  /* ============================================================
     PREPARE DATA BEFORE SUPABASE
  ============================================================ */

  function prepareData(type, form) {

    const raw =
      Object.fromEntries(
        new FormData(form).entries()
      );


    /* ==========================================================
       CARS
    ========================================================== */

    if (type === "cars") {

      const obj = {

        name:
          String(raw.name || "").trim(),

        category:
          String(raw.category || "").trim(),

        /*
         * Empty price = NULL
         */
        price_per_km:
          nullableNumber(raw.price_per_km),

        seats:
          numberOrZero(raw.seats),

        luggage:
          String(raw.luggage || "").trim(),

        image_url:
          String(raw.image_url || "").trim(),

        /*
         * Always JSON array
         */
        features:
          parseFeatures(raw.features),

        /*
         * Checkbox returns "on" when checked.
         */
        active:
          form.elements.active
            ? form.elements.active.checked
            : true

      };

      return obj;
    }


    /* ==========================================================
       ROUTES
    ========================================================== */

    if (type === "routes") {

      return {

        from_city:
          String(raw.from_city || "").trim(),

        to_city:
          String(raw.to_city || "").trim(),

        distance:
          String(raw.distance || "").trim(),

        duration:
          String(raw.duration || "").trim(),

        /*
         * Prices optional
         */
        one_way_price:
          nullableNumber(raw.one_way_price),

        round_trip_price:
          nullableNumber(raw.round_trip_price)

      };
    }


    /* ==========================================================
       SERVICES
    ========================================================== */

    if (type === "services") {

      return {

        title:
          String(raw.title || "").trim(),

        description:
          String(raw.description || "").trim(),

        icon:
          String(raw.icon || "").trim(),

        status:
          String(raw.status || "active").trim()

      };
    }


    /* ==========================================================
       REVIEWS
    ========================================================== */

    if (type === "reviews") {

      return {

        name:
          String(raw.name || "").trim(),

        city:
          String(raw.city || "").trim(),

        rating:
          numberOrZero(raw.rating),

        review:
          String(raw.review || "").trim()

      };
    }


    return raw;
  }


  /* ============================================================
     OPEN EDITOR
  ============================================================ */

  async function openEditor(type, id = null) {

    const config = configs[type];

    if (!config) {
      return;
    }

    let row = {};


    /* ------------------------------
       Load existing record
    ------------------------------ */

    if (id) {

      const {
        data,
        error
      } = await db
        .from(config.table)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {

        toast(
          error.message,
          true
        );

        return;
      }

      row = data;
    }


    /* ------------------------------
       Modal title
    ------------------------------ */

    const title = $("modalTitle");

    if (title) {

      title.textContent =
        (id ? "Edit " : "Add ") +
        (
          type === "cars"
            ? "Car"
            : type === "routes"
              ? "Route"
              : type === "services"
                ? "Service"
                : "Review"
        );
    }


    /* ------------------------------
       Form
    ------------------------------ */

    const form = $("modalForm");

    if (!form) {
      return;
    }

    form.innerHTML =
      fieldsHTML(type, row);


    /* ------------------------------
       Show modal
    ------------------------------ */

    const modal = $("modal");

    if (modal) {
      modal.classList.remove("hidden");
    }


    /* ------------------------------
       Submit
    ------------------------------ */

    form.onsubmit = async event => {

      event.preventDefault();


      let obj;

      try {

        obj =
          prepareData(
            type,
            event.target
          );

      } catch (error) {

        toast(
          error.message,
          true
        );

        return;
      }


      /* ----------------------------
         Basic validation
      ---------------------------- */

      if (
        type === "cars" &&
        !obj.name
      ) {

        toast(
          "Car name is required.",
          true
        );

        return;
      }


      if (
        type === "routes" &&
        (!obj.from_city || !obj.to_city)
      ) {

        toast(
          "From and To are required.",
          true
        );

        return;
      }


      if (
        type === "services" &&
        !obj.title
      ) {

        toast(
          "Service title is required.",
          true
        );

        return;
      }


      if (
        type === "reviews" &&
        (!obj.name || !obj.review)
      ) {

        toast(
          "Name and review are required.",
          true
        );

        return;
      }


      /* ----------------------------
         Insert / Update
      ---------------------------- */

      let result;


      if (id) {

        result =
          await db
            .from(config.table)
            .update(obj)
            .eq("id", id);

      } else {

        result =
          await db
            .from(config.table)
            .insert([obj]);

      }


      /* ----------------------------
         Error
      ---------------------------- */

      if (result.error) {

        console.error(
          `Supabase ${type} error:`,
          result.error
        );

        toast(
          result.error.message,
          true
        );

        return;
      }


      /* ----------------------------
         Success
      ---------------------------- */

      closeModal();

      toast(
        id
          ? "Updated successfully"
          : "Added successfully"
      );

      await renderResource(type);

      await dashboard();
    };


    /* ------------------------------
       Cancel
    ------------------------------ */

    const cancel =
      $("cancelModal");

    if (cancel) {

      cancel.onclick =
        closeModal;
    }
  }


  /* ============================================================
     DELETE
  ============================================================ */

  async function remove(
    table,
    id,
    type
  ) {

    if (
      !confirm(
        "Delete this item?"
      )
    ) {
      return;
    }


    const {
      error
    } = await db
      .from(table)
      .delete()
      .eq("id", id);


    if (error) {

      toast(
        error.message,
        true
      );

      return;
    }


    toast(
      "Deleted successfully"
    );


    await renderResource(type);

    await dashboard();
  }


  /* ============================================================
     BOOKINGS
  ============================================================ */

  async function loadBookings() {

    const body =
      $("bookingsBody");

    if (!body) {
      return;
    }


    const {
      data,
      error
    } = await db
      .from("bookings")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      );


    if (error) {

      body.innerHTML = `
        <tr>
          <td
            colspan="10"
            class="empty"
          >
            ${esc(error.message)}
          </td>
        </tr>
      `;

      return;
    }


    const rows =
      data || [];


    body.innerHTML =
      rows.map(row => `

        <tr>

          <td>
            ${esc(
              row.created_at ||
              row.booking_date ||
              ""
            )}
          </td>

          <td>

            ${esc(
              row.customer_name ||
              row.name ||
              ""
            )}

            <br>

            <small>
              ${esc(row.phone || "")}
            </small>

          </td>

          <td>

            ${esc(
              row.from_city ||
              row.pickup ||
              ""
            )}

            →

            ${esc(
              row.to_city ||
              row.drop ||
              ""
            )}

          </td>

          <td>
            ${esc(row.trip_type || "")}
          </td>

          <td>
            ${esc(row.passengers || "")}
          </td>

          <td>
            ${esc(row.status || "new")}
          </td>

          <td>

            <button
              class="small"
              data-booking="${esc(row.id)}"
              data-status="confirmed"
            >
              Confirm
            </button>

            <button
              class="small danger"
              data-booking="${esc(row.id)}"
              data-status="cancelled"
            >
              Cancel
            </button>

          </td>

        </tr>

      `).join("");


    if (!rows.length) {

      body.innerHTML = `
        <tr>
          <td
            colspan="10"
            class="empty"
          >
            No bookings.
          </td>
        </tr>
      `;
    }
  }


  /* ============================================================
     UPDATE BOOKING
  ============================================================ */

  async function updateBooking(
    id,
    status
  ) {

    const {
      error
    } = await db
      .from("bookings")
      .update({
        status
      })
      .eq("id", id);


    if (error) {

      toast(
        error.message,
        true
      );

      return;
    }


    toast(
      "Booking updated"
    );


    await loadBookings();

    await dashboard();
  }


  /* ============================================================
     SETTINGS
  ============================================================ */

  async function loadSettings() {

    const {
      data,
      error
    } = await db
      .from("settings")
      .select("*")
      .limit(1)
      .maybeSingle();


    if (error) {

      toast(
        "Settings: " +
        error.message,
        true
      );

      return;
    }


    if (!data) {
      return;
    }


    const form =
      $("settingsForm");

    if (!form) {
      return;
    }


    Object.keys(data)
      .forEach(key => {

        if (
          form.elements[key]
        ) {

          form.elements[key].value =
            data[key] ?? "";
        }

      });
  }


  async function saveSettings(
    event
  ) {

    event.preventDefault();


    const form =
      event.target;


    const obj =
      Object.fromEntries(
        new FormData(form)
          .entries()
      );


    const {
      data,
      error: selectError
    } = await db
      .from("settings")
      .select("id")
      .limit(1)
      .maybeSingle();


    if (selectError) {

      $("settingsMsg").textContent =
        selectError.message;

      toast(
        selectError.message,
        true
      );

      return;
    }


    let result;


    if (data) {

      result =
        await db
          .from("settings")
          .update(obj)
          .eq("id", data.id);

    } else {

      result =
        await db
          .from("settings")
          .insert([obj]);
    }


    if (result.error) {

      $("settingsMsg").textContent =
        result.error.message;

      toast(
        result.error.message,
        true
      );

      return;
    }


    $("settingsMsg").textContent =
      "Saved ✓";


    toast(
      "Settings saved"
    );
  }


  /* ============================================================
     LOGIN
  ============================================================ */

  const loginForm =
    $("loginForm");


  if (loginForm) {

    loginForm.onsubmit =
      async event => {

        event.preventDefault();


        const loginError =
          $("loginError");


        if (loginError) {
          loginError.textContent = "";
        }


        const {
          error
        } = await db.auth
          .signInWithPassword({

            email:
              $("email").value.trim(),

            password:
              $("password").value

          });


        if (error) {

          if (loginError) {

            loginError.textContent =
              error.message;
          }

          return;
        }


        await init();
      };
  }


  /* ============================================================
     LOGOUT
  ============================================================ */

  const logoutBtn =
    $("logoutBtn");


  if (logoutBtn) {

    logoutBtn.onclick =
      async () => {

        await db.auth.signOut();

        location.reload();
      };
  }


  /* ============================================================
     NAVIGATION
  ============================================================ */

  document
    .querySelectorAll(".nav")
    .forEach(button => {

      button.onclick =
        async () => {

          document
            .querySelectorAll(".nav")
            .forEach(item =>
              item.classList
                .remove("active")
            );


          document
            .querySelectorAll(".panel")
            .forEach(panel =>
              panel.classList
                .remove("active")
            );


          button.classList
            .add("active");


          const panel =
            $(button.dataset.panel);


          if (panel) {

            panel.classList
              .add("active");
          }


          const title =
            $("pageTitle");


          if (title) {

            title.textContent =
              button.textContent
                .replace(
                  /^[^A-Za-z]+/,
                  ""
                )
                .trim();
          }


          /* Load bookings when opened */

          if (
            button.dataset.panel ===
            "bookings"
          ) {

            await loadBookings();
          }

        };
    });


  /* ============================================================
     ADD BUTTONS
  ============================================================ */

  document
    .querySelectorAll("[data-add]")
    .forEach(button => {

      button.onclick =
        () =>
          openEditor(
            button.dataset.add
          );

    });


  /*
   * Compatibility with existing HTML:
   *
   * <button id="addCar">
   * <button id="addRoute">
   * etc.
   */

  const addButtons = {
    addCar: "cars",
    addRoute: "routes",
    addService: "services",
    addReview: "reviews"
  };


  Object.entries(addButtons)
    .forEach(([id, type]) => {

      const button = $(id);

      if (!button) {
        return;
      }

      button.onclick =
        () =>
          openEditor(type);

    });


  /* ============================================================
     GLOBAL CLICK HANDLER
  ============================================================ */

  document.addEventListener(
    "click",
    event => {

      /* --------------------------
         Edit
      -------------------------- */

      const edit =
        event.target.closest(
          ".edit"
        );


      if (edit) {

        openEditor(
          edit.dataset.type,
          edit.dataset.id
        );

        return;
      }


      /* --------------------------
         Delete
      -------------------------- */

      const del =
        event.target.closest(
          ".delete"
        );


      if (del) {

        remove(
          del.dataset.table,
          del.dataset.id,
          del.dataset.type
        );

        return;
      }


      /* --------------------------
         Booking
      -------------------------- */

      const booking =
        event.target.closest(
          "[data-booking]"
        );


      if (booking) {

        updateBooking(
          booking.dataset.booking,
          booking.dataset.status
        );

      }

    }
  );


  /* ============================================================
     MODAL CONTROLS
  ============================================================ */

  const closeButton =
    $("closeModal");


  if (closeButton) {

    closeButton.onclick =
      closeModal;
  }


  const modal =
    $("modal");


  if (modal) {

    modal.addEventListener(
      "click",
      event => {

        if (
          event.target === modal
        ) {

          closeModal();
        }

      }
    );
  }


  /* ============================================================
     BOOKINGS REFRESH
  ============================================================ */

  const refreshBookings =
    $("refreshBookings");


  if (refreshBookings) {

    refreshBookings.onclick =
      loadBookings;
  }


  /* ============================================================
     MOBILE MENU
  ============================================================ */

  const menuBtn =
    $("menuBtn");


  if (menuBtn) {

    menuBtn.onclick =
      () => {

        const sidebar =
          document.querySelector(
            ".sidebar"
          );

        if (sidebar) {

          sidebar.classList
            .toggle("open");
        }

      };
  }


  /* ============================================================
     SETTINGS FORM
  ============================================================ */

  const settingsForm =
    $("settingsForm");


  if (settingsForm) {

    settingsForm.onsubmit =
      saveSettings;
  }


  /* ============================================================
     AUTH INITIALIZATION
  ============================================================ */

  async function init() {

    const {
      data
    } = await db.auth
      .getSession();


    const loginScreen =
      $("loginScreen") ||
      $("login");


    const app =
      $("app");


    if (
      !data ||
      !data.session
    ) {

      if (loginScreen) {

        loginScreen
          .classList
          .remove("hidden");
      }


      if (app) {

        app.classList
          .add("hidden");
      }


      return;
    }


    if (loginScreen) {

      loginScreen
        .classList
        .add("hidden");
    }


    if (app) {

      app.classList
        .remove("hidden");
    }


    /*
     * Load all admin resources
     */

    await Promise.all([

      dashboard(),

      renderResource(
        "cars"
      ),

      renderResource(
        "routes"
      ),

      renderResource(
        "services"
      ),

      renderResource(
        "reviews"
      ),

      loadSettings()

    ]);
  }


  /* ============================================================
     AUTH STATE CHANGE
  ============================================================ */

  db.auth.onAuthStateChange(
    (_event, session) => {

      const loginScreen =
        $("loginScreen") ||
        $("login");

      const app =
        $("app");


      if (session) {

        if (loginScreen) {

          loginScreen
            .classList
            .add("hidden");
        }


        if (app) {

          app.classList
            .remove("hidden");
        }

      } else {

        if (loginScreen) {

          loginScreen
            .classList
            .remove("hidden");
        }


        if (app) {

          app.classList
            .add("hidden");
        }
      }

    }
  );


  /* ============================================================
     START
  ============================================================ */

  init();

})();
