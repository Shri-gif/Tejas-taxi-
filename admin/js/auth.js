(() => {
  const db = window.supabaseClient;

  const loginBox = document.getElementById("login");
  const appBox = document.getElementById("app");

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginBtn = document.getElementById("loginBtn");
  const loginError = document.getElementById("loginError");
  const logoutBtn = document.getElementById("logoutBtn");

  // Safety check
  if (!db) {
    console.error("Supabase client not found.");
    if (loginError) {
      loginError.textContent = "Supabase connection failed.";
    }
    return;
  }

  function showLogin() {
    if (loginBox) loginBox.style.display = "flex";
    if (appBox) appBox.style.display = "none";
  }

  function showApp() {
    if (loginBox) loginBox.style.display = "none";
    if (appBox) appBox.style.display = "flex";
  }

  async function checkSession() {
    const { data, error } = await db.auth.getSession();

    if (error) {
      console.error("Session error:", error);
      showLogin();
      return;
    }

    if (data.session) {
      showApp();

      // Dashboard will handle loading data later.
      window.dispatchEvent(
        new CustomEvent("admin-auth-ready", {
          detail: data.session
        })
      );
    } else {
      showLogin();
    }
  }

  async function login() {
    const email = emailInput?.value.trim() || "";
    const password = passwordInput?.value || "";

    if (!email || !password) {
      loginError.textContent = "Please enter email and password.";
      return;
    }

    loginError.textContent = "";
    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    const { data, error } = await db.auth.signInWithPassword({
      email,
      password
    });

    loginBtn.disabled = false;
    loginBtn.textContent = "Login";

    if (error) {
      console.error("Login error:", error);
      loginError.textContent = error.message;
      return;
    }

    if (data.session) {
      showApp();

      window.dispatchEvent(
        new CustomEvent("admin-auth-ready", {
          detail: data.session
        })
      );
    }
  }

  async function logout() {
    logoutBtn.disabled = true;
    logoutBtn.textContent = "Logging out...";

    const { error } = await db.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      logoutBtn.disabled = false;
