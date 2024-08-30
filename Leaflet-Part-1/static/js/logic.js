// Create the map
function createMap() {
    let map = L.map("map").setView([37.09, -95.71], 4); 
    
    // Add a tile layer to the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Define the URL for the GeoJSON feed
    let geoData = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

    // Fetch the earthquake data
    d3.json(geoData).then(function(data) {
        
        // Function to get the color of the circle marker based on earthquake depth
        function getColor(depth) {
            return depth > 90 ? '#bd0026' :
                   depth > 70 ? '#f03b20' :
                   depth > 50 ? '#fd8d3c' :
                   depth > 30 ? '#feb24c' :
                   depth > 10 ? '#fed976' :
                                '#ffeda0';
        }

        // Function to determine the radius based on magnitude
        function getRadius(magnitude) {
            return magnitude * 4;
        }

        // Function to handle feature interactions
        function onEachFeature(feature, layer) {
            // Set mouse events for interaction
            layer.on({
                mouseover: function(event) {
                    layer = event.target;
                    layer.setStyle({
                        fillOpacity: 0.9
                    });
                },
                mouseout: function(event) {
                    layer = event.target;
                    layer.setStyle({
                        fillOpacity: 0.8
                    });
                },
                click: function(event) {
                   
                    let latlng = event.target.getLatLng();
             
                    map.setView(latlng, 4);
                }
            });
   
            // Bind a popup with additional information
            layer.bindPopup('<h3>Magnitude: ' + feature.properties.mag + '</h3>' +
                            '<p>Location: ' + feature.properties.place + '</p>' +
                            '<p>Depth: ' + feature.geometry.coordinates[2] + ' km</p>');
        }

        // Create a GeoJSON layer with custom options
        L.geoJSON(data, {
            pointToLayer: function(feature, latlng) {
                // Create a circle marker for each GeoJSON point
                return L.circleMarker(latlng, {
                    radius: getRadius(feature.properties.mag),
                    fillColor: getColor(feature.geometry.coordinates[2]), 
                    color: '#000',
                    weight: 1, 
                    opacity: 1,
                    fillOpacity: 0.8 
                });
            },
            onEachFeature: onEachFeature
        }).addTo(map);

        

    // Set up the legend
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        let depthRanges = [-10, 10, 30, 50, 70, 90];
        let colors = ['#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#f03b20', '#bd0026'];

        // Loop through intervals and generate a label with a colored square for each interval
        for (let i = 0; i < depthRanges.length; i++) {
            let rangeStart = depthRanges[i];
            let rangeEnd = depthRanges[i + 1];

            // Determine the label for the range
            let label = rangeEnd === undefined
                ? `${rangeStart}+` 
                : `${rangeStart}&ndash;${rangeEnd}`; 

            div.innerHTML +=
                '<i style="background:' + colors[i] + '"></i> ' +
                label +
                '<br>';
        }

        return div;
    };

    legend.addTo(map);
});
}

// Call the createMap function to initialize the map
createMap();