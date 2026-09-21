// Initialize map centered on the Western Province, Sri Lanka
const map = L.map('map', { zoomControl: false }).setView([6.85, 80.05], 11);

// Move zoom control to bottom right so it doesn't clash with floating panel
L.control.zoom({ position: 'bottomright' }).addTo(map);

// Add modern Mapbox-like OpenStreetMap base layer (using CartoDB Voyager for a cleaner look)
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO | Western Province Hidden Gems'
}).addTo(map);

// DOM Elements
const modal = document.getElementById('add-modal');
const closeBtn = document.querySelector('.close-btn');
const form = document.getElementById('add-asset-form');
const latInput = document.getElementById('lat');
const lngInput = document.getElementById('lng');
const categoryFilter = document.getElementById('category-filter');
const totalCountEl = document.getElementById('total-count');
const navAddBtn = document.getElementById('nav-add-btn');

// Store assets (using localStorage to simulate database for public interaction)
let tourismAssets = JSON.parse(localStorage.getItem('tourismAssets')) || [];
let markers = []; 

// Category Icon configuration
const categoryColors = {
    nature: 'green',
    culture: 'orange',
    adventure: 'red',
    food: 'blue'
};

const categoryEmojis = {
    nature: '🍃',
    culture: '🏛️',
    adventure: '🧗',
    food: '🍛'
};

// Initial Render
renderMarkers();

// Function to handle opening the modal
function openModal(lat, lng) {
    if(lat && lng) {
        latInput.value = lat;
        lngInput.value = lng;
    } else {
        // If clicked from navbar button, default to map center
        const center = map.getCenter();
        latInput.value = center.lat;
        lngInput.value = center.lng;
    }
    modal.classList.remove('hidden');
}

// Map click event
map.on('click', function(e) {
    openModal(e.latlng.lat, e.latlng.lng);
});

// Navbar Add Button click event
navAddBtn.addEventListener('click', () => {
    openModal();
});

// Close Modal
closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});

// Form Submission
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newAsset = {
        id: Date.now(),
        name: document.getElementById('asset-name').value,
        category: document.getElementById('asset-category').value,
        description: document.getElementById('asset-desc').value,
        lat: parseFloat(latInput.value),
        lng: parseFloat(lngInput.value),
        dateAdded: new Date().toISOString()
    };
    
    tourismAssets.push(newAsset);
    localStorage.setItem('tourismAssets', JSON.stringify(tourismAssets));
    
    modal.classList.add('hidden');
    form.reset();
    renderMarkers();
    
    // Smooth pan to new asset
    map.flyTo([newAsset.lat, newAsset.lng], 14, { duration: 1.5 });
});

// Filter Event
categoryFilter.addEventListener('change', function(e) {
    renderMarkers(e.target.value);
});

// Function to Render Markers
function renderMarkers(filter = 'all') {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    let count = 0;
    
    tourismAssets.forEach(asset => {
        if (filter === 'all' || asset.category === filter) {
            
            const markerColor = categoryColors[asset.category] || 'blue';
            const iconUrl = `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${markerColor}.png`;
            
            const customIcon = new L.Icon({
              iconUrl: iconUrl,
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            });

            // Clean, modern popup content
            const popupContent = `
                <div class="custom-popup">
                    <h3>${escapeHTML(asset.name)}</h3>
                    <p>${escapeHTML(asset.description)}</p>
                    <span class="tag ${asset.category}">${categoryEmojis[asset.category]} ${asset.category}</span>
                </div>
            `;
            
            const marker = L.marker([asset.lat, asset.lng], {icon: customIcon})
                .bindPopup(popupContent, { closeButton: false })
                .addTo(map);
                
            markers.push(marker);
            count++;
        }
    });
    
    // Animate stat number update
    totalCountEl.textContent = count;
}

// Utility to escape HTML and prevent XSS
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Add beautiful mock data if empty
if (tourismAssets.length === 0) {
    tourismAssets = [
        { id: 1, name: "Secret Kalutara Waterfall", category: "nature", description: "A beautiful cascading waterfall nestled deep within the rubber estates. Perfect for a morning hike and natural pool dip.", lat: 6.685, lng: 80.125, dateAdded: new Date().toISOString() },
        { id: 2, name: "Dutch Fort Ruins", category: "culture", description: "Lesser-known 17th-century colonial ruins covered in jungle overgrowth. Amazing photography spot.", lat: 6.832, lng: 79.995, dateAdded: new Date().toISOString() },
        { id: 3, name: "Midnight Kottu Spot", category: "food", description: "The most authentic street kottu in the province. No signboard, just follow the sound of the chopping blades after 10 PM.", lat: 6.901, lng: 79.882, dateAdded: new Date().toISOString() }
    ];
    localStorage.setItem('tourismAssets', JSON.stringify(tourismAssets));
    renderMarkers();
}
