// src/pages/home.js
import NavigationBar from "../components/navbar";
import { fetchStories } from "../utils/authService";
import createStoryCard from "../components/storyCard";

export default function HomePageComponent() {
  const pageContainer = document.createElement("div");
  pageContainer.appendChild(NavigationBar());

  const mainContent = document.createElement("main");
  mainContent.className = "container";
  mainContent.innerHTML = `
    <h1>Koleksi Cerita</h1>
    <div id="storiesContainer" class="stories-grid"></div>
    <p id="statusMessage" class="status-text"></p>
  `;
  
  pageContainer.appendChild(mainContent);

  const storiesContainer = mainContent.querySelector("#storiesContainer");
  const statusMessage = mainContent.querySelector("#statusMessage");

  async function loadStoriesData() {
    try {
      const { stories } = await fetchStories();
      
      if (!stories.length) {
        statusMessage.textContent = "Belum ada cerita. Tambahkan cerita pertama Anda!";
        return;
      }
      
      stories.forEach((storyItem) => {
        const storyCard = createStoryCard(storyItem);
        
        storyCard.addEventListener("click", () => {
          localStorage.setItem("highlightedLat", storyItem.lat);
          localStorage.setItem("highlightedLon", storyItem.lon);
          localStorage.setItem("highlightedId", storyItem.id);
          window.location.hash = "#/map";
        });
        
        storiesContainer.appendChild(storyCard);
      });
    } catch (error) {
      statusMessage.textContent = "Gagal memuat cerita. Pastikan Anda sudah login.";
      console.error(error);
    }
  }

  loadStoriesData();
  return pageContainer;
}