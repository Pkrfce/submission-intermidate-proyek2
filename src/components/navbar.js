// src/components/navbar.js
import { AuthService } from "../utils/authService";
import appLogo from "../assets/logo.svg";

export default function NavigationBar() {
  const navElement = document.createElement("nav");
  navElement.className = "navbar";
  
  navElement.innerHTML = `
    <div class="container navbar-content">
      <div class="brand-logo">
        <img class="logo-img" src="${appLogo}" alt="Logo StoryHub" width="28" height="28">
        <span>StoryHub</span>
      </div>
      <div class="navigation-actions">
        <a class="btn outline" href="#/home">Beranda</a>
        <a class="btn outline" href="#/map">Peta Cerita</a>
        <a class="btn outline" href="#/add">Tambah Cerita</a>
        <a class="btn outline" href="#/settings">Pengaturan</a>
        <button class="btn secondary" id="logoutButton" type="button">Keluar</button>
      </div>
    </div>`;
  
  navElement.querySelector("#logoutButton").addEventListener("click", () => {
    AuthService.signOut();
    window.location.hash = "#/login";
  });
  
  return navElement;
}