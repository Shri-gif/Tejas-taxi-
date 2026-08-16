(() => {
  const db = window.supabaseClient;

  if (!db) {
    console.error("Supabase client not found");
    return;
  }

  // Sidebar navigation
  function initNavigation() {
    const navButtons = document.querySelectorAll(".nav");
    const panels = document.querySelectorAll(".panel");
    const pageTitle = document.getElementById("pageTitle");

    navButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const panelId = btn.dataset.panel;

        navButtons.forEach(x => x.classList.remove("active"));
        panels.forEach(x => x.classList.remove("active"));

        btn.classList.add("active");

        const panel = document.getElementById(panelId);
        if (panel) panel.classList.add("active");

        if (pageTitle) {
          pageTitle.textContent = btn.textContent.replace(/[^\w\s]/g, "").trim();
        }

        // Trigger custom events
        window.dispatchEvent(
          new CustomEvent("panel-change", {
            detail: panelId
          })
        );
      });
    });
  }

  // Count records
  async function countTable(tableName, elementId) {
    try {
      const { count, error } = await db
        .from(tableName)
        .select("*", {
          count: "exact",
          head: true
        });

      const el = document.getElementById(elementId);

      if (error) {
        console.error(tableName, error);
        if (el) el.textContent = "!";
        return;
      }

      if (el) {
        el.textContent = count || 0;
      }

    } catch (err) {
      console.error(err);
    }
  }

  // Load dashboard stats
  async function loadDashboard() {
    await Promise.all([
      countTable("cars", "statCars"),
      countTable("routes", "statRoutes"),
      countTable("services", "statServices"),
      countTable("reviews", "statReviews"),
      countTable("bookings", "statBookings")
    ]);
  }

  // Auth complete
  window.addEventListener("admin-auth-ready", async () => {
    initNavigation();
    await loadDashboard();
  });

})();
