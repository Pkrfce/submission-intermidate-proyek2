// src/pages/login.js
import { AuthService } from "../utils/authService";
import appLogo from "../assets/logo.svg";

export default function LoginComponent() {
  const container = document.createElement("div");
  
  container.innerHTML = `
    <header class="navbar">
      <div class="container navbar-content">
        <div class="brand-logo">
          <img class="logo-img" src="${appLogo}" alt="Logo StoryHub" width="28" height="28">
          <span>StoryHub</span>
        </div>
        <a class="btn outline" href="#/register">Buat Akun</a>
      </div>
    </header>

    <main class="auth-container container">
      <section class="auth-panel">
        <h1>Masuk ke StoryHub</h1>
        <form id="loginForm" novalidate>
          <div class="form-field">
            <label for="userEmail">Email</label>
            <input id="userEmail" name="email" type="email" autocomplete="email" required>
          </div>
          <div class="form-field">
            <label for="userPassword">Kata Sandi</label>
            <input id="userPassword" name="password" type="password" autocomplete="current-password" required>
          </div>
          <button class="btn primary" type="submit">Masuk</button>
          <div class="error-message" id="errorDisplay" role="alert" aria-live="polite" style="display:none"></div>
        </form>
      </section>
    </main>
  `;

  const loginForm = container.querySelector("#loginForm");
  const errorElement = container.querySelector("#errorDisplay");

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const emailInput = container.querySelector("#userEmail").value.trim();
    const passwordInput = container.querySelector("#userPassword").value;
    
    try {
      await AuthService.signIn({ email: emailInput, password: passwordInput });
      window.location.hash = "#/home";
    } catch (error) {
      errorElement.textContent = error.message || "Terjadi kesalahan saat login";
      errorElement.style.display = "block";
    }
  });

  return container;
}