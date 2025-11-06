// src/pages/settings.js
import NavigationBar from "../components/navbar";
import { pushService } from "../utils/pushService";
import { indexedDBService } from "../utils/indexedDBService";

export default function SettingsPage() {
  const pageContainer = document.createElement("div");
  pageContainer.appendChild(NavigationBar());

  const mainContent = document.createElement("main");
  mainContent.className = "container";
  mainContent.innerHTML = `
    <h1>Pengaturan Aplikasi</h1>

    <section class="form-panel" aria-label="Pengaturan Notifikasi">
      <h2>Notifikasi</h2>
      <div class="setting-item">
        <div class="setting-info">
          <h3>Push Notification</h3>
          <p>Dapatkan notifikasi ketika ada cerita baru dari komunitas</p>
          <span id="notificationStatus" class="status-inactive">Memuat status...</span>
        </div>
        <button id="notificationToggle" class="btn secondary" type="button">
          Memuat...
        </button>
      </div>
    </section>

    <section class="form-panel" aria-label="Pengaturan Offline">
      <h2>Mode Offline</h2>
      <div class="setting-item">
        <div class="setting-info">
          <h3>Sinkronisasi Data Offline</h3>
          <p>Kelola data yang dibuat saat offline dan sinkronkan ketika online</p>
          <span id="syncStatus" class="status-inactive">Memuat status...</span>
        </div>
        <button id="syncButton" class="btn" type="button" disabled>
          Sinkronisasi Sekarang
        </button>
      </div>

      <div class="offline-stats">
        <div class="stat-item">
          <span class="stat-label">Cerita Offline</span>
          <span id="offlineCount" class="stat-value">0</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Menunggu Sinkron</span>
          <span id="pendingSyncCount" class="stat-value">0</span>
        </div>
      </div>
    </section>

    <section class="form-panel" aria-label="Manajemen Data Lokal">
      <h2>Manajemen Data</h2>
      <div class="setting-item">
        <div class="setting-info">
          <h3>Data Lokal</h3>
          <p>Hapus semua data yang disimpan secara lokal di perangkat ini</p>
        </div>
        <button id="clearDataButton" class="btn outline" type="button">
          Hapus Data Lokal
        </button>
      </div>
    </section>
  `;
  
  pageContainer.appendChild(mainContent);
  initializeSettings(pageContainer);

  return pageContainer;
}

async function initializeSettings(container) {
  // Initialize push service
  const pushSupported = await pushService.initialize();
  
  if (!pushSupported) {
    const toggleBtn = container.querySelector('#notificationToggle');
    const statusEl = container.querySelector('#notificationStatus');
    
    toggleBtn.disabled = true;
    toggleBtn.textContent = 'Tidak Didukung';
    statusEl.textContent = 'Browser tidak mendukung push notification';
    statusEl.className = 'status-error';
  }

  // Load offline data stats
  await loadOfflineStats(container);

  // Setup event listeners
  setupEventListeners(container);
}

async function loadOfflineStats(container) {
  try {
    const stories = await indexedDBService.getStories();
    const offlineStories = stories.filter(s => s.isOffline);
    const pendingSync = await indexedDBService.hasPendingSync();

    container.querySelector('#offlineCount').textContent = offlineStories.length;
    container.querySelector('#pendingSyncCount').textContent = pendingSync ? 'Ya' : 'Tidak';
    
    const syncBtn = container.querySelector('#syncButton');
    syncBtn.disabled = !pendingSync;
    syncBtn.textContent = pendingSync ? 'Sinkronisasi Sekarang' : 'Tidak Ada Data';
    
    const syncStatus = container.querySelector('#syncStatus');
    syncStatus.textContent = pendingSync ? 'Data menunggu sinkronisasi' : 'Semua data tersinkronisasi';
    syncStatus.className = pendingSync ? 'status-warning' : 'status-active';
  } catch (error) {
    console.error('Error loading offline stats:', error);
  }
}

function setupEventListeners(container) {
  // Push notification toggle
  const toggleBtn = container.querySelector('#notificationToggle');
  toggleBtn.addEventListener('click', async () => {
    toggleBtn.disabled = true;
    toggleBtn.textContent = 'Memproses...';
    
    const success = await pushService.toggleSubscription();
    
    if (success) {
      // Update UI will be handled by pushService
    } else {
      toggleBtn.disabled = false;
    }
  });

  // Sync button
  const syncBtn = container.querySelector('#syncButton');
  syncBtn.addEventListener('click', async () => {
    syncBtn.disabled = true;
    syncBtn.textContent = 'Menyinkronisasi...';
    
    try {
      const result = await indexedDBService.syncOfflineData();
      
      if (result.success) {
        // Reload stats
        await loadOfflineStats(container);
        
        // Show success message
        const syncStatus = container.querySelector('#syncStatus');
        syncStatus.textContent = result.message;
        syncStatus.className = 'status-active';
      }
    } catch (error) {
      console.error('Sync failed:', error);
      const syncStatus = container.querySelector('#syncStatus');
      syncStatus.textContent = 'Gagal menyinkronisasi: ' + error.message;
      syncStatus.className = 'status-error';
    } finally {
      syncBtn.disabled = false;
      syncBtn.textContent = 'Sinkronisasi Sekarang';
    }
  });

  // Clear data button
  const clearBtn = container.querySelector('#clearDataButton');
  clearBtn.addEventListener('click', async () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua data lokal? Tindakan ini tidak dapat dibatalkan.')) {
      clearBtn.disabled = true;
      clearBtn.textContent = 'Menghapus...';
      
      try {
        await indexedDBService.clearAllData();
        await loadOfflineStats(container);
        alert('Data lokal berhasil dihapus');
      } catch (error) {
        console.error('Clear data failed:', error);
        alert('Gagal menghapus data lokal');
      } finally {
        clearBtn.disabled = false;
        clearBtn.textContent = 'Hapus Data Lokal';
      }
    }
  });
}