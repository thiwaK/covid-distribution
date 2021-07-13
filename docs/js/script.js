
// Initalize the map
let config = {
  minZoom: 1,
  maxZomm: 20,

  zoom: 7,
  lat: 7.8731,
  lng: 80.7718,
};
const map = L.map('map', config).setView([config.lat, config.lng], config.zoom);

// Load map layers
let defualtLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '',
});

let googleStreet = googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&language=en-US',{
    maxZoom: 20,
    subdomains: ['mt0','mt1','mt2','mt3']
});

let googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&language=en-US',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
});

let googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&language=en-US',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
});

let ESRI = L.tileLayer(
  'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: '',
  maxZoom: 18,
  }).addTo(map);

window.addEventListener('DOMContentLoaded', function () {
  // Autocomplete
  new Autocomplete('search', {
    delay: 300,
    selectFirst: true,
    howManyCharacters: 2,
    onSearch: function ({ currentValue }) {
      const api = `https://nominatim.openstreetmap.org/search?format=geojson&limit=5&q=${encodeURI(currentValue)}`;

      // You can also use static files
      // const api = './search.json'

      /**
       * jquery
       * If you want to use jquery you have to add the
       * jquery library to head html
       * https://cdnjs.com/libraries/jquery
       */
      // return $.ajax({
      //   url: api,
      //   method: 'GET',
      // })
      //   .done(function (data) {
      //     return data
      //   })
      //   .fail(function (xhr) {
      //     console.error(xhr);
      //   });

      // OR ----------------------------------

      /**
       * axios
       * If you want to use axios you have to add the
       * axios library to head html
       * https://cdnjs.com/libraries/axios
       */
      // return axios.get(api)
      //   .then((response) => {
      //     return response.data;
      //   })
      //   .catch(error => {
      //     console.log(error);
      //   });

      // OR ----------------------------------

      /**
       * Promise
       */
      return new Promise((resolve) => {
        fetch(api)
          .then((response) => response.json())
          .then((data) => {
            resolve(data.features);
          })
          .catch((error) => {
            console.error(error);
          });
      });
    },
    // nominatim
    onResults: ({ currentValue, matches, template }) => {
      const regex = new RegExp(currentValue, 'i');
      // checking if we have results if we don't
      // take data from the noResults method
      return matches === 0
        ? template
        : matches
          .map((element) => {
            return `
          <li class="autocomplete-item loupe" role="option" aria-selected="false">
            <p>
              ${element.properties.display_name.replace(regex, (str) => `<b>${str}</b>`)}
            </p>
          </li> `;
          }).join('');
    },
    onSubmit: ({ object }) => {
      const { display_name } = object.properties;
      const cord = object.geometry.coordinates;
      // custom id for marker
      const customId = Math.random();

      const marker = L.marker([cord[1], cord[0]], {
        title: display_name,
        id: customId,
      });

      marker.addTo(map).bindPopup(display_name);

      map.setView([cord[1], cord[0]], 8);

      map.eachLayer(function (layer) {
        if (layer.options && layer.options.pane === 'markerPane') {
          if (layer.options.id !== customId) {
            map.removeLayer(layer);
          }
        }
      });
    },

    // get index and data from li element after
    // hovering over li with the mouse or using
    // arrow keys ↓ | ↑
    onSelectedItem: ({ index, element, object }) => {
      console.log('onSelectedItem:', index, element, object);
    },

    // the method presents no results
    noResults: ({ currentValue, template }) =>
      template(`<li>No results found: "${currentValue}"</li>`),
  });
});


let baseMaps = {
  "Default" : defualtLayer,
  "ESRI" : ESRI,
  "Google Street" : googleStreet,
  "Google Satellite" : googleSat,
};

L.control.layers(baseMaps).addTo(map);
defualtLayer.addTo(map);