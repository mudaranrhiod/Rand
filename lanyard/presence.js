// Lanyard, fully AI generated sob (not proud of this)

const DISCORD_USER_ID = "807170846497570848";

// DOM Elements
const presenceElement = document.getElementById("presence-data");
const statusBadge = document.getElementById("status-badge");
const avatar = document.getElementById("avatar");
const usernameElement = document.getElementById("username");
const userStatusElement = document.getElementById("user-status");

// WebSocket Connection
const socket = new WebSocket("wss://api.lanyard.rest/socket");
let heartbeatInterval;
let lastPresenceData = null;

// Helper Functions
function formatProgressTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function createProgressBarHTML(timestamps, activityId) {
  if (!timestamps?.start) {
    return '';
  }

  const { start, end } = timestamps;
  const now = Date.now();
  const duration = (end || now) - start;
  const elapsed = now - start;
  const percentage = Math.min(100, (elapsed / duration) * 100);

  return `
    <div class="progress-wrapper">
      <div class="progress-container">
        <div class="progress-bar-fill" style="width: ${percentage}%"></div>
      </div>
      <div class="timestamp-wrapper">
        <span class="timestamp-start">${formatProgressTime(elapsed)}</span>
        <span class="timestamp-end">${formatProgressTime(duration)}</span>
      </div>
    </div>
  `;
}

// WebSocket Handlers
socket.addEventListener("open", () => {
  socket.send(JSON.stringify({
    op: 2,
    d: { subscribe_to_id: DISCORD_USER_ID }
  }));
});

socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  
  if (message.op === 1) {
    socket.send(JSON.stringify({ op: 3 }));
    return;
  }
  
  if (message.op === 0) {
    lastPresenceData = message.d;
    updateDisplay(message.d);
    
    if (!heartbeatInterval) {
      heartbeatInterval = setInterval(updateProgressBars, 1000);
    }
  }
});

async function updateDisplay(data) {
  const { discord_user, activities, discord_status } = data;
  
  // Update user info
  avatar.src = discord_user.avatar 
    ? `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.png?size=256`
    : `https://cdn.discordapp.com/embed/avatars/${discord_user.discriminator % 5}.png`;
  
  statusBadge.className = `status-badge ${discord_status.toLowerCase()}`;
  usernameElement.textContent = discord_user.global_name || discord_user.username;
  
  // Find custom status (type 4 activity)
  const customStatus = activities.find(a => a.type === 4);
  
  // Update status display - only if custom status exists
  if (customStatus?.state) {
    userStatusElement.innerHTML = `
      <span class="status-indicator ${discord_status.toLowerCase()}"></span>
      <span class="status-text">${customStatus.state}</span>
    `;
    userStatusElement.style.display = 'flex';
  } else {
    userStatusElement.style.display = 'none';
  }
  
  // Process other activities (excluding custom status)
  let html = '';
  for (const activity of activities.filter(a => a.type !== 4)) {
    html += await createActivityHTML(activity);
  }
  
  // Spotify
  if (data.spotify) {
    const spotify = data.spotify;
    const spotifyImage = spotify.album_art_url 
      ? await getImageWithFallback(spotify.album_art_url, 'spotify')
      : null;
    
    html += `
      <div class="activity-card spotify" data-activity-id="spotify-${spotify.track_id}">
        <div class="activity-header">
          LISTENING TO SPOTIFY
        </div>
        <div class="activity-content">
          ${spotifyImage ? `<img src="${spotifyImage}" class="activity-cover" alt="Album cover">` : ''}
          <div class="activity-text">
            <div class="activity-title">${spotify.song}</div>
            <div class="activity-detail">${spotify.artist}</div>
            ${spotify.album ? `<div class="activity-detail">${spotify.album}</div>` : ''}
          </div>
        </div>
        ${createProgressBarHTML(spotify.timestamps, `spotify-${spotify.track_id}`)}
      </div>
    `;
  }
  
  presenceElement.innerHTML = html || '<div class="no-activity">No activities currently</div>';
}

async function createActivityHTML(activity) {
  const type = getActivityType(activity.type);
  const imageUrl = getImageUrl(activity);
  const appName = activity.application_id ? await getApplicationName(activity.application_id) : null;

  return `
    <div class="activity-card ${type.toLowerCase()}" data-activity-id="${activity.id}">
      <div class="activity-header">
        ${type} ${type === 'LISTENING' ? 'TO ' + (appName ? appName.toUpperCase() : 'MUSIC') : activity.name}
      </div>
      <div class="activity-content">
        ${imageUrl ? `<img src="${imageUrl}" class="activity-cover" alt="Activity cover">` : ''}
        <div class="activity-text">
          <div class="activity-title">${activity.details || activity.name || 'Unknown'}</div>
          ${activity.state ? `<div class="activity-detail">${activity.state}</div>` : ''}
          ${activity.assets?.large_text ? `<div class="activity-detail">${activity.assets.large_text}</div>` : ''}
        </div>
      </div>
      ${createProgressBarHTML(activity.timestamps, activity.id)}
    </div>
  `;
}

function updateProgressBars() {
  if (!lastPresenceData || !presenceElement) return;

  const cards = presenceElement.querySelectorAll('.activity-card');
  cards.forEach(card => {
    const activityId = card.dataset.activityId;
    const timestamps = getActivityTimestamps(activityId);
    
    if (!timestamps?.start) return;

    const now = Date.now();
    const duration = (timestamps.end || now) - timestamps.start;
    const elapsed = now - timestamps.start;
    const percentage = Math.min(100, (elapsed / duration) * 100);
    
    const bar = card.querySelector('.progress-bar-fill');
    const timeStart = card.querySelector('.timestamp-start');
    const timeEnd = card.querySelector('.timestamp-end');
    
    if (bar) bar.style.width = `${percentage}%`;
    if (timeStart) timeStart.textContent = formatProgressTime(elapsed);
    if (timeEnd) timeEnd.textContent = formatProgressTime(duration);
  });
}

// Utility Functions
function getImageUrl(activity) {
  if (!activity?.assets?.large_image) return null;
  
  if (activity.assets.large_image.startsWith('mp:external/')) {
    return `https://media.discordapp.net/external/${activity.assets.large_image.replace('mp:external/', '')}`;
  } else if (activity.application_id) {
    return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`;
  }
  return null;
}

async function getApplicationName(applicationId) {
  if (!window.appNameCache) window.appNameCache = {};
  if (window.appNameCache[applicationId]) return window.appNameCache[applicationId];
  
  try {
    const response = await fetch(`https://discord.com/api/v9/applications/${applicationId}/rpc`);
    if (response.ok) {
      const data = await response.json();
      window.appNameCache[applicationId] = data.name;
      return data.name;
    }
  } catch (error) {
    console.error("Error fetching application name:", error);
  }
  return null;
}

async function getImageWithFallback(url, cacheKey) {
  if (!url) return null;
  if (imageCache.has(cacheKey)) return imageCache.get(cacheKey);
  
  try {
    const exists = await testImage(url);
    if (exists) {
      imageCache.set(cacheKey, url);
      return url;
    }
  } catch (error) {
    console.log(`Failed to load image ${url}`, error);
  }
  return null;
}

function testImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

function getActivityTimestamps(activityId) {
  if (!activityId || !lastPresenceData) return null;
  
  if (activityId.startsWith('spotify-') && lastPresenceData.spotify) {
    return lastPresenceData.spotify.timestamps;
  }
  
  return lastPresenceData.activities.find(a => a.id === activityId)?.timestamps;
}

function getActivityType(typeCode) {
  const types = ['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING', 'CUSTOM'];
  return types[typeCode] || 'CUSTOM';
}

function getStatusText(status) {
  const statusMap = {
    online: "Online",
    idle: "Idle",
    dnd: "Do Not Disturb",
    offline: "Offline"
  };
  return statusMap[status.toLowerCase()] || "Offline";
}