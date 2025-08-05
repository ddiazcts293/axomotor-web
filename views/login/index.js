import { supabase } from '/secrets.js';

export function init(extraData) {
  const { navigateTo } = extraData;
  const form = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    errorMsg.textContent = "Validando...";
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", data.user.email);

      errorMsg.textContent = "";
      navigateTo("home");
      await updateUserMenu();

    } catch (err) {
      console.error("Login error:", err.message);
      errorMsg.textContent = "Correo o contraseña incorrectos";
    }
  });
}

export function cleanUp() {
  console.log("Cerrando login");
}
