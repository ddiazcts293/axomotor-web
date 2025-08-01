export function init(extraData) {
  const { navigateTo } = extraData;
  const form = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMsg");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Credenciales de prueba
    const validEmail = "admin@axomotor.com";
    const validPassword = "1234";

    if (email === validEmail && password === validPassword) {
      localStorage.setItem("isLoggedIn", "true");
      navigateTo("home");
    } else {
      errorMsg.textContent = "Correo o contraseña incorrectos";
    }
  });
}

export function cleanUp() {
  console.log("Cerrando login");
}
