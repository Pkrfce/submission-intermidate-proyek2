// src/pages/register.js
import { AuthService } from "../utils/authService";
import appLogo from "../assets/logo.svg";

export default function RegisterComponent() {
  const container = document.createElement("div");
  
  container.innerHTML = `
    <header class="navbar">
      <div class="container navbar-content">
        <div class="brand-logo">
          <img class="logo-img" src="${appLogo}" alt="Logo StoryHub" width="28" height="28">
          <span>StoryHub</span>
        </div>
        <a class="btn outline" href="#/login">Masuk</a>
      </div>
    </header>

    <main class="auth-container container">
      <section class="auth-panel">
        <h1>Bergabung dengan StoryHub</h1>
        <form id="registerForm" novalidate>
          <div class="form-field">
            <label for="userName">Nama Lengkap</label>
            <input id="userName" name="name" autocomplete="name" required>
          </div>
          <div class="form-field">
            <label for="registerEmail">Email</label>
            <input id="registerEmail" name="email" type="email" autocomplete="email" required>
          </div>
          <div class="form-field">
            <label for="registerPassword">Kata Sandi</label>
            <input id="registerPassword" name="password" type="password" autocomplete="new-password" required>
          </div>
          <button class="btn primary" type="submit">Daftar Sekarang</button>
          <div class="error-message" id="registerError" role="alert" aria-live="polite" style="display:none"></div>
        </form>
      </section>
    </main>
  `;

  const registerForm = container.querySelector("#registerForm");
  const errorElement = container.querySelector("#registerError");

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const userName = container.querySelector("#userName").value.trim();
    const userEmail = container.querySelector("#registerEmail").value.trim();
    const userPassword = container.querySelector("#registerPassword").value;
    
    try {
      await AuthService.registerUser({ name: userName, email: userEmail, password: userPassword });
      window.location.hash = "#/login";
    } catch (error) {
      errorElement.textContent = error.message || "Pendaftaran tidak berhasil";
      errorElement.style.display = "block";
    }
  });

  return container;
}