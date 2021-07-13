
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
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
});
var dark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
	maxZoom: 20,
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
});


let baseMaps = {
  "Clean" : clean,
  "Dark" : dark,
  "OpenStreet" : openStreet,
  "ESRI Satellite" : ESRI,
  "Google Street" : googleStreet,
  "Google Satellite" : googleSat,
};



L.control.layers(baseMaps).addTo(map);
dark.addTo(map);

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
