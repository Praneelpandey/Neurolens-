// Day 11: Service Worker (Required for PWA)

self.addEventListener('install', (e) => {
  console.log('[Service Worker] Installed');
});

self.addEventListener('fetch', (e) => {
  // Abhi hum kuch cache nahi kar rahe, bas PWA criteria poora kar rahe hain
});