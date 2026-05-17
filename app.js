// ====== HEADER GREETING ======
const greetingText = document.getElementById("greeting-text");
const profileName = document.getElementById("profile-name");
const hour = new Date().getHours();
const greeting = hour < 12 ? "Good Morning," : hour < 18 ? "Good Afternoon," : "Good Evening,";
if (greetingText) {
  greetingText.textContent = greeting;
}
if (profileName) {
  const storedName = localStorage.getItem("userName") || "Your Name";
  profileName.textContent = storedName;
}

// ====== NAVIGATION ======
const buttons = document.querySelectorAll(".bottom-nav button");

buttons[0].onclick = () => window.location.href = "pages/spots.html";
buttons[1].onclick = () => window.location.href = "pages/catches.html";
buttons[2].onclick = () => window.location.href = "index.html";
buttons[3].onclick = () => window.location.href = "pages/activity.html";
buttons[4].onclick = () => window.location.href = "pages/lures.html";

// ====== USER PREFERENCE =====
const userPreferences = {
  personIcon: localStorage.getItem("personIcon") || "female"
};

function savePersonIconPreference(iconType) {
  userPreferences.personIcon = iconType;
  localStorage.setItem("personIcon", iconType);
  updateLocationButtonIcon();

  if (userMarker) {
    userMarker.setIcon(createUserLocationIcon());
  }
}

function getPersonIconEmoji() {
  return userPreferences.personIcon === "male" ? "🧍‍♂️" : "🧍‍♀️"
}

function createUserLocationIcon() {
  return L.divIcon({
    className: "user-location-icon",
    html: getPersonIconEmoji(),
    iconSize: [30, 30],
    iconAnchor: [15, 30]
  });
}

function updateLocationButtonIcon() {
  const locationBtn = document.getElementById("mapLocationBtn");

  if (!locationBtn) return;

  locationBtn.textContent = getPersonIconEmoji();
}

// ===== MAP VARIABLES =====
let map;
let markers = [];
let userMarker = null;
let locationWatchId = null;
let isTrackingLocation = false;

// ===== LOAD MAP AFTER PAGE OPENS =====
document.addEventListener("DOMContentLoaded", initializeMap);

// ===== INITIALIZE MAP =====
function initializeMap() {
  map = L.map("map", {
    zoomControl: false
  }).setView([39.8283, -98.5795], 5);

  L.control.zoom({
    position: "bottomright" // move them
  }).addTo(map);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  addFishingSpots();

  console.log("Map loaded");

  map.on("click", onMapClick);
}

// ===== STARTER FISHING SPOTS =====
function addFishingSpots() {
  const fishingSpots = [
    {
      name: "Lake Fork",
      lat: 32.94,
      lng: -95.50,
      description: "Top bass fishing lake in Texas",
      fishTypes: ["Largemouth Bass"]
    },
    {
      name: "Lake Okeechobee",
      lat: 26.94,
      lng: -80.80,
      description: "Famous Florida bass fishing",
      fishTypes: ["Bass", "Crappie"]
    },
    {
      name: "Table Rock Lake",
      lat: 36.57,
      lng: -93.31,
      description: "Clear water fishing spot",
      fishTypes: ["Smallmouth Bass", "Spotted Bass"]
    },
    {
      name: "Clear Lake",
      lat: 38.97,
      lng: -122.73,
      description: "Big bass hotspot",
      fishTypes: ["Largemouth Bass"]
    },
   {
      name: "Lake Guntersville",
      lat: 34.42,
      lng: -86.25,
      description: "Grass-heavy bass lake",
      fishTypes: ["Bass"]
    }
  ];

  const bounds = [];

  fishingSpots.forEach(function (spot) {
    createFishingMarker(spot);
    bounds.push([spot.lat, spot.lng]);
  });

  map.fitBounds(bounds);
}

// ===== CREATE FISHING MARKER =====
function createFishingMarker(spot) {
  const marker = L.marker([spot.lat, spot.lng]).addTo(map);

  marker.bindPopup(`
    <div style="font-family: Arial, sans-serif;">
      <h4 style="margin: 0 0 8px 0; color: #0f0;">${spot.name}</h4>
      <p style="margin: 4px 0; font-size: 12px;">${spot.description}</p>
      <p style="margin: 4px 0; font-size: 12px;">
        <strong>Fish:</strong> ${spot.fishTypes.join(", ")}
      </p>
    </div>
  `);

  markers.push(marker);
}

// ===== MAP CLICK HANDLER ======
function onMapClick(e) {
  const lat = e.latlng.lat;
  const lng = e.latlng.lng;

  const userChoice = confirm("Drop a pin here?");

  if (!userChoice) return;

  createUserPin(lat, lng);
}

// ====== CREATE USER PIN ===== 
function createUserPin(lat, lng) {
  const marker = L.marker([lat, lng]).addTo(map);

  marker.bindPopup(`
    <div style="font-family: Arial;">
    <strong>Custom Spot</strong><br>
    Lat: ${lat.toFixed(4)}<br>
    Lng: ${lng.toFixed(4)}
    </div> 
   `);

   markers.push(marker);
}

// ===== SEARCH MAP LOCATION =====
async function searchGlobalLocation() {
  const searchInput = document.getElementById("globalSearchInput");
  let searchText = searchInput.value.trim();

  if (searchText === "") {
    alert("Please type a location first.");
    return;
  }

  searchText = searchText.replace(/[^\w\s]/gi, "");
  searchText = searchText.replace(/\s+/g, " ");

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&countrycodes=us&limit=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.length === 0) {
      alert("Location not found. Try city and state.");
      return;
    }

    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);

    map.setView([lat, lon], 13);

    L.marker([lat, lon])
      .addTo(map)
      .bindPopup(`<strong>${searchText}</strong>`)
      .openPopup();

  } catch (error) {
    console.error("Search failed:", error);
    alert("Search is not working right now.");
  }
}

// ===== PRESS ENTER TO SEARCH =====
document.addEventListener("DOMContentLoaded", function () {
  updateLocationButtonIcon();

  const searchInput = document.getElementById("globalSearchInput");

  if (searchInput) {
    searchInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        searchGlobalLocation();
      }
    });
  }

  const locationBtn = document.getElementById("mapLocationBtn");

  if (locationBtn) {
    locationBtn.addEventListener("click", toggleLocationTracking);
  }
});

// ===== ADD NEW FISHING SPOT =====
function addNewFishingSpot(name, lat, lng, description, fishTypes) {
 const newSpot = {
    name: name,
    lat: lat,
    lng: lng,
    description: description,
    fishTypes: fishTypes
  };

  createFishingMarker(newSpot);
}

// ===== TOGGLE LIVE LOCATION TRACKING =====
function toggleLocationTracking() {
  if (isTrackingLocation) {
    stopLocationTracking();
  } else {
    startLocationTracking();
  }
}

// ===== START LIVE LOCATION TRACKING =====
function startLocationTracking() {
  if (!navigator.geolocation) {
    alert("Location is not supported on this device.");
    return;
  }

  isTrackingLocation = true;

  const locationBtn = document.getElementById("mapLocationBtn");
  if (locationBtn) {
    locationBtn.classList.add("tracking-active");
    updateLocationButtonIcon();
  }

  locationWatchId = navigator.geolocation.watchPosition(
    function (position) {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;
      const userCoords = [userLat, userLng];

      if (userMarker) {
        userMarker.setLatLng(userCoords);
        userMarker.setIcon(createUserLocationIcon());
      } else {
        userMarker = L.marker(userCoords, {
          icon: createUserLocationIcon()
        }).addTo(map);

        userMarker.bindPopup("You are here").openPopup();
      }

      map.setView(userCoords, 15);
    },
    function (error) {
      console.error("Location tracking error:", error);
      alert("Location failed: " + error.message);
      stopLocationTracking();
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000
    }
  );
}

// ===== STOP LIVE LOCATION TRACKING =====
function stopLocationTracking() {
  if (locationWatchId !== null) {
    navigator.geolocation.clearWatch(locationWatchId);
    locationWatchId = null;
  }

  isTrackingLocation = false;

  const locationBtn = document.getElementById("mapLocationBtn");
  if (locationBtn) {
    locationBtn.classList.remove("tracking-active");
    updateLocationButtonIcon();
  }
}

// ======= STOP LIVE LOCATION TRACKING =====
function stopLocationTracking() {
  if (locationWatchId !== null) {
    navigator.geolocation.clearWatch(locationWatchId);
    locationWatchId = null;
  }
  isTrackingLocation = false;

  const locationBtn = document.getElementById("mapLocationBtn");
  if (locationBtn) {
    locationBtn.classList.remove("tracking-active");
    updateLocationButtonIcon();
  }
}

/* ======= TOGGLE MAP SIZE ====== */
function toggleMapSize() {
  const mapSection = document.querySelector(".map-section");
  const btn = document.getElementById("mapToggleBtn");

  if (!mapSection) {
    console.error("map-section not found");
    return;
  }

  mapSection.classList.toggle("map-expanded");

  const isExpanded = mapSection.classList.contains("map-expanded");

  btn.textContent = isExpanded ? "_" : "⛶";

  /* Leaflet needs this after size changes */
  setTimeout(() => {
    map.invalidateSize();
  }, 300);
}