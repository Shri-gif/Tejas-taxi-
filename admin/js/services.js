let serviceCache = [];

window.loadServices = async () => {
  const { data, error } = await client
    .from("services")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    alert(error.message);
    return;
  }

  serviceCache = data || [];

  servicesBody.innerHTML = serviceCache.map(s => `
    <tr>
      <td>${esc(s.title)}</td>
      <td>${esc(s.description)}</td>
      <td>${esc(s.icon || "✦")}</td>
      <td>${s.active ? "Active" : "Hidden"}</td>
      <td>
        <button class="small" onclick="editService('${s.id}')">Edit</button>
        <button class="small danger" onclick="deleteService('${s.id}')">Delete</button>
      </td>
    </tr>
  `).join("");

  if (typeof statServices !== "undefined" && statServices) {
    statServices.textContent = serviceCache.length;
  }
};

addService.onclick = () => openService();

function openService(id) {
  const s = serviceCache.find(x => x.id === id) || {};

  openModal(
    id ? "Edit Service" : "Add Service",

    `
    <div class="grid2">

      <label>
        Title
        <input
          required
          name="title"
          value="${esc(s.title || "")}"
        >
      </label>

      <label>
        Description
        <textarea name="description">${esc(s.description || "")}</textarea>
      </label>

      <label>
        Icon
        <input
          name="icon"
          value="${esc(s.icon || "🚕")}"
        >
      </label>

      <label>
        Status
        <select name="active">
          <option value="true" ${s.active !== false ? "selected" : ""}>
            Available
          </option>

          <option value="false" ${s.active === false ? "selected" : ""}>
            Hidden
          </option>
        </select>
      </label>

    </div>

    <button class="primary" type="submit">
      Save Service
    </button>
    `,

    async form => {

      const title = form.get("title")?.trim();
      const description = form.get("description")?.trim();
      const icon = form.get("icon")?.trim() || "🚕";

      // IMPORTANT:
      // Convert string "true"/"false" into real boolean.
      const active = form.get("active") === "true";

      if (!title) {
        alert("Please enter service title.");
        return;
      }

      const payload = {
        title,
        description,
        icon,
        active
      };

      let result;

      if (id) {
        result = await client
          .from("services")
          .update(payload)
          .eq("id", id);
      } else {
        result = await client
          .from("services")
          .insert(payload);
      }

      if (result.error) {
        console.error(result.error);
        alert(result.error.message);
        return;
      }

      closeModal();
      await loadServices();
    }
  );
}

window.editService = openService;

window.deleteService = async id => {

  if (!confirm("Delete this service?")) {
    return;
  }

  const { error } = await client
    .from("services")
    .delete()
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  await loadServices();
};
