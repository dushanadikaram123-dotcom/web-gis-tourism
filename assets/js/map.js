// Initialize Supabase Connection
const SUPABASE_URL = 'https://qhlwqorsiaofkyvlpqdi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_yfZqvkmeXnDlD42lBJStvQ_LCKw5rOn';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
    nature: '🍃',
    culture: '🏛️',
    adventure: '🧗',
    food: '🍛'
};

// Fetch data from Supabase PostgreSQL Database
async function loadDestinations() {
    const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('created_at', { ascending: false });
        
    if (error) {
        console.error('Error fetching data from Supabase:', error);
        return;
    }

    tourismAssets = data;

    // Auto-seed the database if it is completely empty
    if (tourismAssets.length === 0) {
        await seedInitialData();
    } else {
        renderMarkers();
    }
}

// Function to automatically seed the popular destinations into Supabase the first time
async function seedInitialData() {
    const seedData = [
        { name: "Colombo National Museum", category: "culture", description: "The largest museum in Sri Lanka, housing royal regalia and ancient artifacts from the Kandyan kingdom.", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/National_Museum_of_Colombo_01.jpg/800px-National_Museum_of_Colombo_01.jpg", lat: 6.9105, lng: 79.8604 },
        { name: "Gangaramaya Temple", category: "culture", description: "A highly revered temple mixing modern architecture and cultural essence, situated near Beira Lake.", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Gangaramaya_Temple_Colombo.jpg/800px-Gangaramaya_Temple_Colombo.jpg", lat: 6.9157, lng: 79.8573 },
        { name: "Galle Face Green", category: "nature", description: "A popular 5 hectare ocean-side urban park in the heart of Colombo. Great for sunset views and street food.", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Galle_Face_Green.jpg/800px-Galle_Face_Green.jpg", lat: 6.9242, lng: 79.8447 },
        { name: "Mount Lavinia Beach", category: "nature", description: "A famous beach just south of Colombo, known for its golden sand and vibrant sunset views.", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Mount_Lavinia_Beach.jpg/800px-Mount_Lavinia_Beach.jpg", lat: 6.8347, lng: 79.8647 },
        { name: "Secret Kalutara Waterfall", category: "nature", description: "A hidden cascading waterfall nestled deep within the rubber estates. Perfect for a morning hike and natural pool dip.", photo: "", lat: 6.685, lng: 80.125 }
    ];
    
    const { error } = await supabase.from('destinations').insert(seedData);
    if (!error) {
        console.log("Seeded database with initial popular destinations.");
        await loadDestinations(); // Reload after seeding
    } else {
        console.error("Failed to seed database:", error);
    }
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
    const { error } = await supabase
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
