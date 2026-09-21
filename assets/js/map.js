// Initialize the map centered on the Western Province, Sri Lanka
const map = L.map('map').setView([6.85, 80.05], 11);

// Add OpenStreetMap base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors | Student-Led Destination Discovery'
}).addTo(map);

// DOM Elements
const modal = document.getElementById('add-modal');
const closeBtn = document.querySelector('.close-btn');
const form = document.getElementById('add-asset-form');
const latInput = document.getElementById('lat');
const lngInput = document.getElementById('lng');
const categoryFilter = document.getElementById('category-filter');
const totalCountEl = document.getElementById('total-count');

// Store assets (using localStorage to simulate a database for public interaction)
let tourismAssets = JSON.parse(localStorage.getItem('tourismAssets')) || [];
let markers = []; // Keep track of marker layers

// Icons mapping based on category
const categoryColors = {
    nature: 'green',
    culture: 'orange',
    adventure: 'red',
    food: 'blue'
};

// Initial Render
renderMarkers();

// Map click event to add a new gem
map.on('click', function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    
    // Set hidden inputs
    latInput.value = lat;
    lngInput.value = lng;
    
    // Open Modal
    modal.classList.remove('hidden');
});

// Close Modal
closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

// Close Modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});

// Form Submission
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newAsset = {
        id: Date.now(), // simple unique ID
        name: document.getElementById('asset-name').value,
        category: document.getElementById('asset-category').value,
        description: document.getElementById('asset-desc').value,
        lat: parseFloat(latInput.value),
        lng: parseFloat(lngInput.value),
        dateAdded: new Date().toISOString()
    };
    
    // Add to array and save to local storage (simulating a database submission)
    tourismAssets.push(newAsset);
    localStorage.setItem('tourismAssets', JSON.stringify(tourismAssets));
    
    // Close modal and reset form
    modal.classList.add('hidden');
    form.reset();
    
    // Re-render map
    renderMarkers();
    
    alert('Thank you! Your hidden gem has been shared anonymously with the community.');
});

// Filter Event
categoryFilter.addEventListener('change', function(e) {
    renderMarkers(e.target.value);
});

// Function to Render Markers
function renderMarkers(filter = 'all') {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    let count = 0;
    
    tourismAssets.forEach(asset => {
        if (filter === 'all' || asset.category === filter) {
            
            // Create a custom colored icon using a standard leaflet approach
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

            // Create popup content
            const popupContent = `
                <div class="custom-popup">
                    <h3>${escapeHTML(asset.name)}</h3>
                    <p>${escapeHTML(asset.description)}</p>
                    <span class="tag ${asset.category}">${asset.category}</span>
                </div>
            `;
            
            const marker = L.marker([asset.lat, asset.lng], {icon: customIcon})
                .bindPopup(popupContent)
                .addTo(map);
                
            markers.push(marker);
            count++;
        }
    });
    
    // Update stats
    totalCountEl.textContent = count;
}

// Utility to escape HTML and prevent XSS
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Add some initial mock data if empty (for demonstration purposes)
if (tourismAssets.length === 0) {
    const mockData = [
        { id: 1, name: "Secret Waterfall", category: "nature", description: "A hidden cascading waterfall perfect for a quick dip.", lat: 6.885, lng: 80.125, dateAdded: new Date().toISOString() },
        { id: 2, name: "Old Dutch Fort Ruins", category: "culture", description: "Lesser-known colonial ruins covered in moss.", lat: 6.832, lng: 79.995, dateAdded: new Date().toISOString() },
        { id: 3, name: "Spicy Kottu Spot", category: "food", description: "Best street food kottu in the province, opens only after 8PM.", lat: 6.901, lng: 79.882, dateAdded: new Date().toISOString() }
    ];
    tourismAssets = mockData;
    localStorage.setItem('tourismAssets', JSON.stringify(tourismAssets));
    renderMarkers();
}
