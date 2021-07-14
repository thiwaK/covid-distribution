
// Initalize the map
let config = {
  minZoom: 1,
  maxZomm: 20,
  zoomControl: false,

  zoom: 8,
  lat: 7.8731,
  lng: 80.7718,
};
const map = L.map('map', config).setView([config.lat, config.lng], config.zoom);

// Load map tile layers
let openStreet = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '',
    maxZoom: 20,
});
let googleStreet = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&language=en-US',{
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
    maxZoom: 20,
});
var clean = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    attribution: ''
});
var dark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    attribution: ''
});
// let baseMaps = {
//   "Clean" : clean,
//   "Dark" : dark,
//   "OpenStreet" : openStreet,
//   "ESRI Satellite" : ESRI,
//   "Google Street" : googleStreet,
//   "Google Satellite" : googleSat,
// };
// L.control.layers(baseMaps).addTo(map);

clean.addTo(map);

var markersLayer = new L.LayerGroup();
var controlSearch = new L.Control.Search({
  position:'topleft',		
  layer: markersLayer,
  initial: false,
  zoom: 12,
  marker: false
});

var newSearchControl = new L.Control.Search({
  url: 'https://nominatim.openstreetmap.org/search?format=json&accept-language=de-DE&q={s}',
  jsonpParam: 'json_callback',
  propertyName: 'display_name',
  propertyLoc: ['lat','lon'],
  markerLocation: true,
  autoType: false,
  autoCollapse: true,
  minLength: 2,
  zoom:10,
  text: 'Search',
  textCancel: 'Cancel',
  textErr: 'Not found'
});

map.addControl(newSearchControl);
L.control.zoom({position: 'topleft'}).addTo(map);

// map.attributionControl.setPrefix(false);
// map.dragging.enable();
// map.touchZoom.enable();
// map.doubleClickZoom.enable();
// map.scrollWheelZoom.enable();

const Http = new XMLHttpRequest();
const url='https://nhss.gov.lk/api/suwapetha/getPatientData/covid';
Http.open("POST", url);
Http.send();

let pationt = [];
var cfg = {
  // radius should be small ONLY if scaleRadius is true (or small radius is intended)
  // if scaleRadius is false it will be the constant radius used in pixels
  "radius": .01,
  "maxOpacity": 0.4,
  // scales the radius based on map zoom
  "scaleRadius": true,
  // if set to false the heatmap uses the global maximum for colorization
  // if activated: uses the data maximum within the current map boundaries
  //   (there will always be a red spot with useLocalExtremas true)
  "useLocalExtrema": true,
  // which field name in your data represents the latitude - default "lat"
  latField: 'lat',
  // which field name in your data represents the longitude - default "lng"
  lngField: 'lng',
  // which field name in your data represents the data value - default "value"
  valueField: 'count'
};

Http.onreadystatechange = (e) => {
  // packet by packet
};

Http.onloadend = (e) =>{
  // whole packet

  const obj = JSON.parse(Http.responseText);
  console.log(obj.http_status);

  for (let item in obj.patients) {
    // console.log(obj.patients[item].Date_of_report_received);
    // console.log(obj.patients[item].lat);
    // console.log(obj.patients[item].lng);
    if(obj.patients[item].lat >= 0){
      if(obj.patients[item].lng >= 0){
        pationt.push({"lat":parseFloat(obj.patients[item].lat) , "lng":parseFloat(obj.patients[item].lng), count: 1}); 
      }
    }

    
  }

  var testData = {
    "data":pationt,
  };
  
  var heatmapLayer = new HeatmapOverlay(cfg);
  heatmapLayer.setData(testData);
  map.addLayer(heatmapLayer);

};






// var testData = {
//   "max": 999999999,
//   "data": pationt,
// };



//L.marker([7.8731, 80.7710]).addTo(map);
// var circleCenter = [config.lat, config.lng];
// var circleOptions = {
//   color: 'red',
//   fillColor: '#f03',
//   fillOpacity: .2
// }
// var circle = L.circle(circleCenter, 500, circleOptions);
// circle.addTo(map);



