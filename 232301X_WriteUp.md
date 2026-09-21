# Assignment 2 – Development of a Web Map
**PL 3508: Advance GIS and Remote Sensing for Planning**

**Topic:** Interactive Participatory Web GIS for Mapping Hidden Tourism Assets and Student-Led Destination Discovery in the Western Province

## 1. Introduction and Explanation of Topic
The Western Province of Sri Lanka is primarily known for its urban landscape, commercial hubs, and administrative centers, particularly around Colombo. While it is the most populous and economically active region, tourism is heavily concentrated in a few well-known hotspots. This over-concentration leads to the neglect of numerous cultural, natural, and culinary "hidden gems" scattered across the province, limiting local economic dispersal and offering a narrow experience to visitors. 

To address this spatial imbalance, I selected the topic: **"Interactive Participatory Web GIS for Mapping Hidden Tourism Assets and Student-Led Destination Discovery in the Western Province."** 

The core issue this Web Map addresses is the *information gap* regarding lesser-known tourism assets. By developing a participatory, crowdsourced Web GIS platform, the project aims to democratize destination discovery. The web map allows the public—particularly students, local explorers, and community members—to anonymously map hidden waterfalls, cultural ruins, obscure adventure trails, and hyper-local culinary spots. 

**Why the Web Map is Helpful:**
1. **Crowdsourcing Spatial Knowledge:** Traditional tourism maps are top-down, created by tourism boards. This Web Map is bottom-up, capturing indigenous spatial knowledge from the public.
2. **Interactive Visualization:** It visualizes assets dynamically based on categories (Nature, Culture, Adventure, Food), making it highly decision-making oriented for tourists planning their routes.
3. **Decentralizing Tourism:** By mapping hidden assets, it spatially redistributes tourist footfall, promoting local businesses in off-the-beaten-path neighborhoods in the Western Province.

## 2. Conceptualization and Application of the Web Map Interface
The interface is designed with a user-centric approach, prioritizing simplicity and interactivity. 
- **The Sidebar:** Functions as the control panel. It includes a dynamic category filter allowing users to customize their view based on their interests (e.g., viewing only 'Nature' or 'Food' spots). It also tracks community statistics, showing the total number of mapped assets.
- **The Map Canvas:** Utilizes Leaflet.js to provide a responsive, full-screen map interface centered on the Western Province. 
- **Public Interaction Modal:** The core feature is the "Add a Hidden Gem" tool. When a user clicks anywhere on the map, a form intuitively pops up, capturing the geographic coordinates automatically. Users can anonymously input the asset's name, category, and a brief description. 
- **Categorical Symbology:** Map markers are color-coded based on the asset category to provide immediate visual context without needing to click on them.

## 3. Input Data Sources and Tools Used

| Component / Requirement | Tool / Data Source Used | Purpose in Web Map |
| :--- | :--- | :--- |
| **Base Map & Geography** | OpenStreetMap (OSM) via Leaflet | Provides the underlying spatial reference, road networks, and geographical context of the Western Province. |
| **Web Mapping Library** | Leaflet.js (v1.9.4) | Lightweight JavaScript library used to render the map, manage layers, handle click events, and display markers/popups. |
| **Interface Styling & UI** | HTML5, CSS3, Font Awesome | Structures the web layout, styles the sidebar, modal forms, and provides intuitive icons for better user experience. |
| **Data Storage / Interaction**| JavaScript & Web LocalStorage / JSON | Simulates a backend database for the assignment's public interaction component. It captures form data, converts it to JSON, and plots it dynamically on the map. |
| **Marker Symbology** | Leaflet Color Markers (GitHub) | Provides custom-colored map pins to visually differentiate between tourism categories (e.g., green for nature). |

## 4. Web Map Link
*(Note: Please replace the link below with your actual deployed GitHub Pages link once you push the code)*
**Live Web Map URL:** [https://dushanadikaram123-dotcom.github.io/web-gis-tourism/](https://dushanadikaram123-dotcom.github.io/web-gis-tourism/)

## 5. AI Use Statement (Appendix)
| Requirement | Detail |
| :--- | :--- |
| **1. AI Tool Used** | Google Gemini |
| **2. Purpose of Use** | Coding support (HTML/CSS/JS structuring for Leaflet), layout conceptualization, and generating mock data for initial map state. |
| **3. Main Prompts** | "Generate a participatory Web GIS using Leaflet for mapping hidden tourism assets in the Western Province with HTML, CSS, JS." |
| **4. Accessible Link** | N/A (Integrated IDE session) |
| **5. Short Reflection** | The AI provided a strong structural foundation for the Leaflet map and UI modal. I checked the generated JavaScript to ensure the public interaction logic (form to map marker) worked correctly and customized the CSS to fit the assignment's thematic requirements. All AI-generated content was reviewed against spatial planning concepts taught in the module. |
