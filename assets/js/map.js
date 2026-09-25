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

let tourismAssets = [];
let markers = []; 

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

// Form Submission -> Send to Supabase Database
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving to Database...';
    submitBtn.disabled = true;

    const newAsset = {
        name: document.getElementById('asset-name').value,
        category: document.getElementById('asset-category').value,
        description: document.getElementById('asset-desc').value,
        photo: document.getElementById('asset-photo').value,
        lat: parseFloat(latInput.value),
        lng: parseFloat(lngInput.value)
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

            // Clean, modern popup content with optional photo
            const photoHTML = asset.photo ? `<img src="${asset.photo}" alt="${escapeHTML(asset.name)}" class="popup-photo">` : '';
            const popupContent = `
                <div class="custom-popup">
                    ${photoHTML}
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
    
    totalCountEl.textContent = count;
}

// Utility to escape HTML and prevent XSS
function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
