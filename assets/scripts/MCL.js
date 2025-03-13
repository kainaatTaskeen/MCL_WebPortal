import L from 'leaflet';
// ------------------------------Add MAP-------------------------------------
const map = L.map('map', { attributionControl: false }).setView([31.4839, 74.3587], 11);

// Remove default zoom control from the top-right
map.zoomControl.remove();

// Re-add zoom control in the top-left corner
L.control.zoom({ position: "topright" }).addTo(map);


// ------------------------------Add OpenStreetMap base layer-------------------------------------
//.............................basemaps...........................
        // Define multiple basemaps
        var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
        });

        var googleSat = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            attribution: '&copy; Google Satellite'
        });

        var esriWorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; Esri'
        });

        // Set default basemap
        osm.addTo(map);

        // Add basemaps to the layer control
        var baseMaps = {
            "OpenStreetMap": osm,
            "Google Satellite": googleSat,
            "Esri World Imagery": esriWorldImagery
        };

        L.control.layers(baseMaps, {}, { position: "bottomleft" }).addTo(map);
        

// Add GeoServer WMS Layers
const pakistanBoundary = L.tileLayer.wms("http://localhost:8080/geoserver/wms", {
    layers: 'mcl:pakistan_boundary',
    format: 'image/png',
    transparent: true
}).setZIndex(10);

const zoneBoundary = L.tileLayer.wms("http://localhost:8080/geoserver/wms", {
    layers: 'mcl:zone_boundary',
    format: 'image/png',
    transparent: true
}).addTo(map).setZIndex(10).addTo(map);

const ucBoundary = L.tileLayer.wms("http://localhost:8080/geoserver/wms", {
    layers: 'mcl:uc_boundary',
    format: 'image/png',
    transparent: true
}).setZIndex(10);

const streetsLayer = L.tileLayer.wms("http://localhost:8080/geoserver/wms", {
    layers: 'mcl:Streets',
    format: 'image/png',
    transparent: true
}).setZIndex(10);



//----------------------------------------- Layer Control for toggling layers------------------------------
/// Custom Layer Control UI
const layerControl = L.control({ position: "topleft" });

layerControl.onAdd = function (map) {
    const div = L.DomUtil.create("div", "custom-layer-control");
    div.innerHTML = `<h4 style="text-align:start; padding-left:7px">LAYERS</h4><div id="layer-list"></div>`;
    return div;
};

layerControl.addTo(map);

// Function to Add Layer Controls
function addLayerControl(layer, name, defaultOpacity = 1) {
    const layerList = document.getElementById("layer-list");

    if (layerList) {
        const layerItem = document.createElement("div");
        layerItem.classList.add("layer-item");

        // Toggle Switch
        const toggle = document.createElement("label");
        toggle.classList.add("switch");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = map.hasLayer(layer);

        const sliderRound = document.createElement("span");
        sliderRound.classList.add("slider");

        toggle.appendChild(checkbox);
        toggle.appendChild(sliderRound);

        checkbox.addEventListener("change", function () {
            if (this.checked) {
                map.addLayer(layer);
            } else {
                map.removeLayer(layer);
            }
        });

        // Layer Name Label
        const label = document.createElement("span");
        label.classList.add("layer-label");
        label.textContent = name;

        // Opacity Slider
        const opacitySlider = document.createElement("input");
        opacitySlider.type = "range";
        opacitySlider.min = "0";
        opacitySlider.max = "1";
        opacitySlider.step = "0.1";
        opacitySlider.value = defaultOpacity;
        opacitySlider.classList.add("opacity-slider");

        // Prevent map from dragging when interacting with the slider
        L.DomEvent.disableClickPropagation(opacitySlider);
        L.DomEvent.on(opacitySlider, "mousedown", function () {
            map.dragging.disable();
        });
        L.DomEvent.on(opacitySlider, "mouseup", function () {
            map.dragging.enable();
        });

        // Apply Opacity
        opacitySlider.addEventListener("input", function () {
            if (layer.setOpacity) {
                layer.setOpacity(this.value);
            } else if (layer.setStyle) {
                layer.setStyle({ opacity: this.value, fillOpacity: this.value * 0.7 });
            }
        });

        // Append Elements
        layerItem.appendChild(toggle);
        layerItem.appendChild(label);
        layerItem.appendChild(opacitySlider);
        layerList.appendChild(layerItem);
    }
}

// ✅ Add Layers to Control Panel
addLayerControl(streetsLayer, "Streets");
addLayerControl(ucBoundary, "UC Boundary");
addLayerControl(zoneBoundary, "Zone Boundary");
addLayerControl(pakistanBoundary, "Pakistan Boundary");


// ----------------------------------------Change cursor on load-------------------------------------
map.getContainer().style.cursor = "default"; 

let highlightedStreet = null; // Keep track of highlighted feature

// ----------------------------------Function to check if a street exists at the hovered location------------------------------
map.on('mousemove', function (e) {
    const url = `http://localhost:8080/geoserver/wms?service=WMS&version=1.1.1&request=GetFeatureInfo
        &layers=mcl:Streets
        &query_layers=mcl:Streets
        &bbox=${map.getBounds().toBBoxString()}
        &srs=EPSG:4326
        &info_format=application/json
        &width=${map.getSize().x}
        &height=${map.getSize().y}
        &x=${Math.floor(map.latLngToContainerPoint(e.latlng).x)}
        &y=${Math.floor(map.latLngToContainerPoint(e.latlng).y)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.features && data.features.length > 0) {
                map.getContainer().style.cursor = "pointer"; // Street found, show pointer
            } else {
                map.getContainer().style.cursor = "default"; // No street, default cursor
            }
        })
        .catch(error => console.error("Error fetching street info:", error));
});

// ------------------------------On Map Click-------------------------------------
map.on("click", function (e) {
    const url = `http://localhost:8080/geoserver/wms?service=WMS&version=1.1.1&request=GetFeatureInfo&layers=mcl:Streets
        &query_layers=mcl:Streets&bbox=${map.getBounds().toBBoxString()}&srs=EPSG:4326&info_format=application/json
        &width=${map.getSize().x}&height=${map.getSize().y}&x=${Math.floor(map.latLngToContainerPoint(e.latlng).x)}
        &y=${Math.floor(map.latLngToContainerPoint(e.latlng).y)}`;

    fetch(url)
        .then(response => response.json())
        .then((data) => {
            if (typeof highlightedStreet !== "undefined" && highlightedStreet) {
                map.removeLayer(highlightedStreet);
                highlightedStreet = null;
            }

            if (data.features && data.features.length > 0) {
                const feature = data.features[0];
                const properties = feature.properties;
                const geometry = feature.geometry;

                // ✅ Update Side Panel with Street Data
                document.getElementById("zoneName").textContent = properties["zone_name"] || "N/A";
                document.getElementById("ucNo").textContent = properties["uc_no"] || "N/A";
                document.getElementById("streetRoad").textContent = properties["street_roa"] || "N/A";
                document.getElementById("status").textContent = properties["status"] || "N/A";

                document.getElementById("sidePanel").classList.add("show");  
                document.getElementById("map-container").classList.add("shrink-map"); 
                $(`#logo`).animate({ right: '405px' }, 500); 
                $(`#logo-container`).animate({ right: '405px' }, 500); 

                setTimeout(() => { map.invalidateSize(); }, 500);

                // ✅ Extract Video URLs Safely
                function ensureMp4Extension(filename) {
                    return filename.endsWith(".mp4") ? filename : filename + ".mp4";
                }

                const videoURLs = [];
                if (properties.before && properties.before.trim() !== "") {
                    videoURLs.push(`http://localhost:8000/static/project_res/Videos/before/${ensureMp4Extension(properties.before)}`);
                }
                if (properties.inprogress && properties.inprogress.trim() !== "") {
                    videoURLs.push(`http://localhost:8000/static/project_res/Videos/inprogress/${ensureMp4Extension(properties.inprogress)}`);
                }
                if (properties.after && properties.after.trim() !== "") {
                    videoURLs.push(`http://localhost:8000/static/project_res/Videos/after/${ensureMp4Extension(properties.after)}`);
                }

                // ✅ Show Popup at Clicked Location with Video Carousel
                const popup = L.popup({
                    maxWidth: "40vw",
                    closeOnClick: false
                })
                .setLatLng(e.latlng)
                .setContent(generateVideoCarousel(videoURLs))
                .openOn(map);

                // ✅ Ensure Popup Height Matches the Video Carousel
                setTimeout(() => {
                    const popupElement = document.querySelector(".leaflet-popup-content");
                    if (popupElement) {
                        popupElement.style.width = "40vw";
                        popupElement.style.height = "50vh";
                        popupElement.style.overflow = "hidden";
                    }
                }, 100);

                // ✅ Adjust Map View to Fit Popup
                setTimeout(() => {
                    const offsetLatLng = map.containerPointToLatLng([
                        map.latLngToContainerPoint(e.latlng).x, 
                        map.latLngToContainerPoint(e.latlng).y - 200 // Move map up to make room for popup
                    ]);
                    map.panTo(offsetLatLng);
                }, 300);

                // ✅ Highlight the clicked street in GREEN
                if (geometry) {
                    let streetGeoJSON = {
                        type: "Feature",
                        geometry: geometry,
                        properties: {}
                    };

                    highlightedStreet = L.geoJSON(streetGeoJSON, {
                        style: {
                            color: "green",
                            weight: 6,
                            opacity: 0.8
                        }
                    }).addTo(map);

                    const streetBounds = highlightedStreet.getBounds();
                    if (streetBounds.isValid()) {
                        map.fitBounds(streetBounds, { padding: [50, 50] });
                    }
                }
            }
        })
        .catch((error) => {
            console.error("Error fetching street info:", error);
        });
});

// Add event listener to the close button
document.getElementById("closePanelBtn").addEventListener("click", closeSidePanel);

// Function to close side panel and reset map size
function closeSidePanel() {
    document.getElementById("sidePanel").classList.remove("show");
    document.getElementById("map-container").classList.remove("shrink-map");
    setTimeout(() => { map.invalidateSize(); }, 500);  
    $(`#logo`).animate({ right: '5px' }, 500); 
    $(`#logo-container`).animate({ right: '5px' }, 500); 
}


// ✅-------------------------------- Function to Generate Bootstrap Video Carousel
function generateVideoCarousel(videoURLs) {
    let carouselIndicators = "";
    let carouselItems = "";

    const titles = ["Before", "In Progress", "After"]; // Titles for videos

    videoURLs.forEach((video, index) => {
        const videoTitle = titles[index] || `Video ${index + 1}`; // Fallback for additional videos

        carouselIndicators += `
        <button type="button" data-bs-target="#videoCarousel" data-bs-slide-to="${index}" 
            class="${index === 0 ? "active" : ""}" aria-label="Slide ${index + 1}"></button>`;

        carouselItems += `
        <div class="carousel-item ${index === 0 ? "active" : ""}" style="position: relative;">
            <div class="video-title" 
                style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.6); color: white; padding: 5px 10px; border-radius: 5px;
                font-size: 25px; z-index: 10;">
                ${videoTitle}
            </div>
            <video class="d-block w-100" controls style="width: 100%; height: 50vh; object-fit: cover;">
                <source src="${video}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        </div>`;
    });

    return `
    <div id="videoCarousel" class="carousel slide mt-3" data-bs-ride="carousel" style="width: 40vw; height: 50vh;">
        <div class="carousel-indicators">${carouselIndicators}</div>
        <div class="carousel-inner">${carouselItems}</div>
        <button class="carousel-control-prev" type="button" data-bs-target="#videoCarousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#videoCarousel" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
        </button>
    </div>`;
}




