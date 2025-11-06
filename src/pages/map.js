// src/pages/map.js
import NavigationBar from "../components/navbar";
import { fetchStories } from "../utils/authService";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Marker.prototype.options.icon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapPageComponent() {
  const pageContainer = document.createElement("div");
  pageContainer.appendChild(NavigationBar());

  const mainContent = document.createElement("main");
  mainContent.className = "container";
  mainContent.innerHTML = `
    <h1>Peta Lokasi Cerita</h1>
    <section class="map-panel" aria-label="Peta visualisasi cerita dari komunitas">
      <div id="storiesMap" class="map-container" role="region" aria-label="Peta cerita"></div>
      <p class="help-text" id="mapStatus"></p>
    </section>
  `;
  
  pageContainer.appendChild(mainContent);

  const mapElement = mainContent.querySelector("#storiesMap");
  const statusMessage = mainContent.querySelector("#mapStatus");
  const markersLayer = L.layerGroup();

  const mapInstance = L.map(mapElement, { zoomControl: true }).setView([-6.2, 106.8], 11);
  
  const openStreetMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(mapInstance);
  
  const darkMap = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    attribution: "&copy; CartoDB"
  });
  
  L.control.layers({ "Peta Standar": openStreetMap, "Peta Gelap": darkMap }).addTo(mapInstance);
  markersLayer.addTo(mapInstance);

  mapInstance.whenReady(() => setTimeout(() => mapInstance.invalidateSize(), 0));
  requestAnimationFrame(() => mapInstance.invalidateSize());
  window.addEventListener("resize", () => mapInstance.invalidateSize(), { passive: true });

  const highlightedStoryId = localStorage.getItem("highlightedId");

  async function loadStoryLocations() {
    markersLayer.clearLayers();
    
    try {
      const { stories } = await fetchStories();
      
      if (!stories.length) {
        statusMessage.textContent = "Belum ada cerita dengan informasi lokasi.";
        return;
      }
      
      let focusedMarker = null;
      
      stories.forEach(story => {
        if (typeof story.lat === "number" && typeof story.lon === "number") {
          const marker = L.marker([story.lat, story.lon])
            .addTo(markersLayer)
            .bindPopup(`
              <b>${story.name || "Penulis"}</b><br>
              ${story.description || ""}
              ${story.photoUrl ? 
                `<br><img src="${story.photoUrl}" alt="Ilustrasi cerita" 
                style="max-width:140px;border-radius:8px;margin-top:6px;">` : 
                ""}
            `);
          
          if (highlightedStoryId && story.id === highlightedStoryId) {
            focusedMarker = marker;
          }
        }
      });
      
      if (focusedMarker) {
        mapInstance.setView(focusedMarker.getLatLng(), 13);
        focusedMarker.openPopup();
        
        const highlightCircle = L.circle(focusedMarker.getLatLng(), { 
          radius: 120, 
          color: "#8a2be2" 
        }).addTo(mapInstance);
        
        setTimeout(() => mapInstance.removeLayer(highlightCircle), 1200);
      }
      
      localStorage.removeItem("highlightedId");
      statusMessage.textContent = "";
    } catch (error) {
      statusMessage.textContent = "Gagal memuat data cerita. Pastikan Anda sudah login.";
      console.error(error);
    }
  }

  loadStoryLocations();
  return pageContainer;
}