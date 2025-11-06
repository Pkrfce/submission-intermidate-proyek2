// src/components/storyCard.js
export default function createStoryCard(storyItem) {
  const cardElement = document.createElement("article");
  cardElement.className = "story-card";
  
  const imageUrl = storyItem.photoUrl || "https://placehold.co/600x400?text=Tidak+Ada+Gambar";
  const authorName = storyItem.name || "Anonim";
  
  cardElement.innerHTML = `
    <img src="${imageUrl}" alt="Foto cerita oleh ${authorName}">
    <div class="card-content">
      <div class="author-name">${authorName}</div>
      <div class="post-date">${new Date(storyItem.createdAt).toLocaleString()}</div>
      <p class="story-description">${storyItem.description || ""}</p>
      ${typeof storyItem.lat === 'number' ? 
        `<p class="location-meta">Lokasi: ${storyItem.lat}, ${storyItem.lon}</p>` : 
        ""}
    </div>`;
  
  return cardElement;
}