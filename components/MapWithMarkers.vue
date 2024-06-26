<template>
  <div class="map-container">
    <div :id="uniqueId" class="map"></div>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default {
  props: {
    coordinatesArray: {
      type: Array,
      required: true
    },
    destinationNames: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      uniqueId: 'map-' + Math.random().toString(36).substring(7), // Generate unique ID for map container
      map: null,
      loading: false, // Track loading state
      popups: [] // Array to store references to all popups
    };
  },
  mounted() {
    mapboxgl.accessToken = 'pk.eyJ1IjoidmlrdG9ydmVsIiwiYSI6ImNsdmk1aDV5djFjbGMyanFmODNkbG53ZHMifQ.X1lqvNcIbVceNnL6xJAnXA';
    const map = new mapboxgl.Map({
      container: this.uniqueId,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: this.coordinatesArray[1], // Set center as the first coordinate
      zoom: 13
    });

    const start = this.coordinatesArray[0];

    // Function to add markers
    const addMarkers = (coordinates, names) => {
      coordinates.forEach((coord, index) => {
        const el = document.createElement('div');
        el.className = 'marker bg-orange-500 rounded-full w-8 h-8 flex justify-center items-center text-white text-sm font-bold';
        el.innerHTML = `<span>${index + 1}</span>`;

        const popup = new mapboxgl.Popup({
          closeButton: true, // Hide default close button
          closeOnClick: true, // Keep open on click
          anchor: 'bottom' // Anchor to bottom of marker
        }).setHTML(`<h3>${names[index]}</h3>`);

        this.popups.push(popup); // Add popup to the array

        new mapboxgl.Marker(el)
          .setLngLat(coord)
          .setPopup(popup)
          .addTo(map);

        el.addEventListener('click', async () => {
           // Close all other popups
           this.popups.forEach(p => p.remove());

          this.loading = true; // Show loading animation

          const response = await fetch(`/api/GetLocationByName?destination=${encodeURIComponent(names[index])}&lat=${coord[1]}&long=${coord[0]}`);
          const data = await response.json();

          // Get the first sentence of the description
          const firstSentence = data.description.split('.')[0];

          // Construct popup content with Tailwind CSS classes
          const content = `
            <div class="popup-wrapper rounded-md overflow-hidden">
              <div class="popup-image-wrapper h-48 bg-cover bg-center" style="background-image: url(${data.imageUrl});"></div>
              <div class="popup-text p-4 text-black">
                <h3 class="text-xl font-bold">${data.name}</h3>
                <p>${firstSentence}</p>
              </div>
            </div>
          `;

          popup.setHTML(content);
          popup.addTo(this.map); // Open the clicked popup
          this.loading = false; // Hide loading animation once loaded

           // Center the map around the popup
           this.map.flyTo({
            center: coord,
            zoom: 15
          });
        });
      });
    };

    const getRoute = async (coordinates) => {
      const coordsString = coordinates.map(coord => `${coord[0]},${coord[1]}`).join(';');
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${coordsString}?alternatives=false&continue_straight=true&geometries=geojson&language=en&overview=full&steps=true&access_token=${mapboxgl.accessToken}`,
        { method: 'GET' }
      );
      const json = await query.json();
      const data = json.routes[0];
      const routeCoordinates = data.geometry.coordinates;

      addMarkers(coordinates, this.destinationNames);

      const geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeCoordinates
        }
      };

      if (map.getSource('route')) {
        map.getSource('route').setData(geojson);
      } else {
        map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: geojson
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });
      }
    };

    map.on('load', () => {
      getRoute(this.coordinatesArray);

      map.addLayer({
        id: 'point',
        type: 'circle',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Point',
                  coordinates: start
                }
              }
            ]
          }
        },
        paint: {
          'circle-radius': 10,
          'circle-color': '#3887be'
        }
      });
    });

    this.map = map; // Store map instance
  }
};
</script>

<style>

body {
  margin: 0;
  padding: 0;
}

.map-container {
  height: 100vh; /* Half height of the viewport */
  width: 48vw; /* Half width of the viewport */
  position: relative; /* Ensure proper positioning */
}

.map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}

</style>
