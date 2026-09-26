// Initialize Supabase Connection
const SUPABASE_URL = 'https://qhlwqorsiaofkyvlpqdi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_yfZqvkmeXnDlD42lBJStvQ_LCKw5rOn';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Initialize map centered on the Western Province, Sri Lanka
const map = L.map('map', { zoomControl: false }).setView([6.85, 80.05], 11);

// Move zoom control to bottom right so it doesn't clash with floating panel
L.control.zoom({ position: 'bottomright' }).addTo(map);

// Add vibrant Esri World Street Map base layer for maximum color
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
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
const togglePanelBtn = document.getElementById('toggle-panel-btn');
const floatingPanel = document.getElementById('floating-panel');

let tourismAssets = [];
let markers = []; 

// Panel Toggle Logic
togglePanelBtn.addEventListener('click', () => {
    floatingPanel.classList.toggle('minimized');
});

const categoryColors = {
    nature: 'green',
    culture: 'orange',
    adventure: 'red',
    food: 'blue'
};

const categoryEmojis = {
    nature: '<i class="fa-solid fa-leaf"></i>',
    culture: '<i class="fa-solid fa-building-columns"></i>',
    adventure: '<i class="fa-solid fa-person-hiking"></i>',
    food: '<i class="fa-solid fa-bowl-food"></i>'
};

// Fetch data from Supabase PostgreSQL Database
async function loadDestinations() {
    const { data, error } = await supabaseClient
        .from('destinations')
        .select('*')
        .order('created_at', { ascending: false });
        
    if (error) {
        console.error('Error fetching data from Supabase:', error);
        return;
    }

    tourismAssets = data;
    renderMarkers();
}

// Load data immediately on startup
loadDestinations();

// Function to handle opening the modal
function openModal(lat, lng) {
    if(lat && lng) {
        latInput.value = lat;
        lngInput.value = lng;
    } else {
        const center = map.getCenter();
        latInput.value = center.lat;
        lngInput.value = center.lng;
    }
    modal.classList.remove('hidden');
}

// Map click event (with Ocean & Country restriction)
map.on('click', async function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    
    // Temporarily change cursor to show loading
    document.getElementById('map').style.cursor = 'wait';
    
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await response.json();
        
        document.getElementById('map').style.cursor = '';
        
        if (data.error) {
            alert("🌊 Oops! You clicked on the ocean. Please select a valid land location.");
            return;
        }
        
        if (data.address && data.address.country_code !== 'lk') {
            alert("🗺️ Please select a location within Sri Lanka.");
            return;
        }
        
        openModal(lat, lng);
    } catch (err) {
        document.getElementById('map').style.cursor = '';
        // Fallback if API fails
        openModal(lat, lng);
    }
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

// Form Submission -> Send to Supabase Database
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving to Database...';
    submitBtn.disabled = true;

    // Handle File Upload to Base64
    const photoInput = document.getElementById('asset-photo');
    let photoBase64 = "";
    
    if (photoInput.files && photoInput.files[0]) {
        const file = photoInput.files[0];
        try {
            photoBase64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        } catch (err) {
            console.error("Error reading file:", err);
            alert("Error reading the image file.");
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }
    }

    const newAsset = {
        name: document.getElementById('asset-name').value,
        category: document.getElementById('asset-category').value,
        description: document.getElementById('asset-desc').value,
        photo: photoBase64,
        lat: parseFloat(latInput.value),
        lng: parseFloat(lngInput.value),
        source: 'Community'
    };
    
    // Insert into Supabase
    const { error } = await supabaseClient
        .from('destinations')
        .insert([newAsset]);
        
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
        
    if (error) {
        alert("Error saving to database: " + error.message);
        return;
    }
    
    modal.classList.add('hidden');
    form.reset();
    
    // Fetch latest data from database to update the map
    await loadDestinations();
    
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

            // Clean, modern popup content with brilliant photo
            const photoHTML = asset.photo ? `<img src="${asset.photo}" alt="${escapeHTML(asset.name)}" class="popup-photo">` : '';
            const popupContent = `
                <div class="custom-popup" id="popup-${asset.id}">
                    ${photoHTML}
                    <h3>${escapeHTML(asset.name)}</h3>
                    <div class="popup-tags">
                        <span class="tag ${asset.category}">${categoryEmojis[asset.category]} ${asset.category}</span>
                        ${asset.source === 'Official' ? '<span class="tag official">👑 Official</span>' : '<span class="tag community">👥 Community</span>'}
                    </div>
                    
                    <div class="extra-details" id="details-${asset.id}">
                        <p>${escapeHTML(asset.description)}</p>
                    </div>
                    
                    <button class="btn-details-dropdown" onclick="window.toggleDetails(event, ${asset.id})">
                        <i class="fa-solid fa-chevron-down"></i> More Details
                    </button>
                </div>
            `;
            
            const marker = L.marker([asset.lat, asset.lng], {icon: customIcon})
                .bindPopup(popupContent, { closeButton: true })
                .addTo(map);
                
            // Open popup on hover
            marker.on('mouseover', function(e) {
                this.openPopup();
            });
                
            markers.push(marker);
            count++;
        }
    });
    
    totalCountEl.textContent = count;
}

// Global function to toggle dropdown details in popup
window.toggleDetails = function(event, id) {
    if (event) event.stopPropagation();
    const detailsDiv = document.getElementById(`details-${id}`);
    if (detailsDiv) {
        detailsDiv.classList.toggle('expanded');
        // Tell leaflet to update popup size
        map.eachLayer((layer) => {
            if (layer.getPopup && layer.getPopup() && layer.getPopup().isOpen()) {
                layer.getPopup().update();
            }
        });
    }
};

// Close Add Modal
document.getElementById('close-add-btn').addEventListener('click', () => {
    modal.classList.add('hidden');
});



window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
    
});

// Utility to escape HTML and prevent XSS
function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
