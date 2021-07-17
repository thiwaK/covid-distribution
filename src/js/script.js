// map tile layers
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
var CartoDB_Voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
});
var clean = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    attribution: ''
});
var dark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    attribution: ''
});

// Configurations
let config = {
  minZoom: 2,
  maxZomm: 20,
  zoomControl: false,

  zoom: 3,
  lat: 18,
  lng: 15,

  // zoom: 8,
  // lat: 7.8731,
  // lng: 80.7718,
};

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

function setAdditionalConfig(){
  map.attributionControl.setPrefix(false);
  map.dragging.enable();
  map.touchZoom.enable();
  map.doubleClickZoom.enable();
  map.scrollWheelZoom.enable();
}

function processData(allText) {

  var dataBundle = {
    countryName:[],
    lat:[],
    lng:[]
  };

  
  var allTextLines = allText.split(/\r\n|\n/);

  // var record_num = 6;  // or however many elements there are in each row
  // var entries = allTextLines[0].split(',');
  // var lines = [];
  // var headings = entries.splice(0,record_num);
  // while (entries.length>0) {
  //     var tarr = [];
  //     for (var j=0; j<record_num; j++) {
  //         tarr.push(headings[j]+":"+entries.shift());
  //     }
  //     lines.push(tarr);
  // }

  var count = 1;
  while (allTextLines.length != count){
    // "Vanuatu", "VU", "VUT", "548", "-16", "167"
    // console.log(allTextLines[count].split(',')[0]);
    // dataBundle.countryCode[count] = allTextLines[count].split(',')[1];
    var reg = /^[a-z]+$/i;
    let countryCode = allTextLines[count].match(/\".+?\"/g)[0].replace("\"", "").replace("\"","");
    // let countryCode2 = allTextLines[count].match(/\".+?\"/g)[2].replace("\"", "").replace("\"","");
    let lat = allTextLines[count].match(/\".+?\"/g)[1].replace("\"", "").replace("\"","");
    let lng = allTextLines[count].match(/\".+?\"/g)[2].replace("\"", "").replace("\"","");
    let countryName = allTextLines[count].match(/\".+?\"/g)[3];

    // console.log(lat,lng);

    dataBundle.countryName[countryCode] = countryName;
    dataBundle.lat[countryCode] = parseFloat(lat);
    dataBundle.lng[countryCode] = parseFloat(lng);

    
    count += 1;
  }
  
  loadWorldSummary(dataBundle);
}

function addAdditionalTileLayers(){
  let baseMaps = {
    "Clean" : clean,
    "Dark" : dark,
    "OpenStreet" : openStreet,
    "ESRI Satellite" : ESRI,
    "Google Street" : googleStreet,
    "Google Satellite" : googleSat,
  };
  L.control.layers(baseMaps).addTo(map);
}

function loadSLCovid(){

  const Http = new XMLHttpRequest();
  const url='https://nhss.gov.lk/api/suwapetha/getPatientData/covid';
  Http.open("POST", url);
  Http.send();

  let pationt = [];

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

          var circleCenter = [obj.patients[item].lat, obj.patients[item].lng];
          var circleOptions = {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: .4
          }
          var circle = L.circle(circleCenter, 50, circleOptions);
          circle.bindPopup("<b>Reported on </b>" + obj.patients[item].Date_of_report_received + 
          "<br/><b>Latitiude </b>" + obj.patients[item].lat + 
          "<br/><b>Longitiude </b>" + obj.patients[item].lng);
          circle.addTo(map);


        }
      }

      
    }

    var testData = {
      "data":pationt,
    };
    
    var heatmapLayer = new HeatmapOverlay(cfg);
    heatmapLayer.setData(testData);
    //map.addLayer(heatmapLayer);
  };
}

function loadCVS(){

  let Http_3 = new XMLHttpRequest();
  let url_3='/src/countries.csv';
  Http_3.open("GET", url_3);
  Http_3.send();
 
  Http_3.onloadend = (e) =>{
    if(Http_3.status == 404){
      url_3='/covid-distribution/src/countries.csv';
      Http_3.open("GET", url_3);
      Http_3.send();

      Http_3.onloadend = (e) =>{
        processData(Http_3.responseText);
      }

    }
    else{
      processData(Http_3.responseText);
    }
  }
  
}


function loadWorldSummary(dataBundle){


  const Http_2 = new XMLHttpRequest();
  const url_2='https://api.covid19api.com/summary';
  Http_2.open("GET", url_2);
  Http_2.send();

  Http_2.onloadend = (e) =>{

    const obj = JSON.parse(Http_2.responseText);
    let minCases = 2^53 - 1;
    let maxCases = 0;

    for (let item in obj.Countries){
      if(obj.Countries[item].TotalConfirmed < minCases){
        minCases = obj.Countries[item].TotalConfirmed;
      }
      if(obj.Countries[item].TotalConfirmed > maxCases){
        maxCases = obj.Countries[item].TotalConfirmed;
      }
    }

    let classWidth = parseInt((maxCases - minCases)/5)
    console.log(minCases, maxCases, classWidth);
    

    
    for (let item in obj.Countries) {
      
      let lat = dataBundle["lat"][obj.Countries[item].CountryCode];
      let lng = dataBundle["lng"][obj.Countries[item].CountryCode];

      if (lat != undefined){
        // console.log(obj.Countries[item].Country);
        // console.log(dataBundle["lat"][obj.Countries[item].CountryCode]);
        // console.log(dataBundle["lng"][obj.Countries[item].CountryCode]);


        var circleCenter = [lat, lng];
        var circleOptions = {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: .4,
          weight: .5
        }


        

        let circleSize = obj.Countries[item].TotalConfirmed/40;
        var circle = L.circle(circleCenter, circleSize, circleOptions);
        circle.addTo(map);
      }
    }

  };
}



// Initalize the map
const map = L.map('map', config).setView([config.lat, config.lng], config.zoom);
CartoDB_Voyager.addTo(map);

// Search controler
var markersLayer = new L.LayerGroup();
var searchControl = new L.Control.Search({
  position:'topleft',	
  layer: markersLayer,
  marker: false,
  initial: false,
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
map.addControl(searchControl);
L.control.zoom({position: 'topleft'}).addTo(map);


// Zoom level change listener
map.on("zoomstart", function (e) { console.log("ZOOMSTART", e); });
map.on("zoomend", function (e) { 
  console.log("ZOOMEND", e); 
  console.log("ZOOMEND", e.type); 
  console.log("ZOOMEND", e.target._zoom); 
});



// let Countries = [];
// let CountryCode = [];
// let TotalConfirmed = [];
// let TotalDeaths = [];
// let TotalRecovered = [];
// let Date = [];

// let NewConfirmed = [];
// let NewDeaths = [];
// let NewRecovered = [];



loadCVS();



//L.marker([7.8731, 80.7710]).addTo(map);
// var circleCenter = [config.lat, config.lng];
// var circleOptions = {
//   color: 'red',
//   fillColor: '#f03',
//   fillOpacity: .2
// }
// var circle = L.circle(circleCenter, 500, circleOptions);
// circle.addTo(map);


// var popup = L.popup();

// function onMapClick(e) {
//     popup
//         .setLatLng(e.latlng)
//         .setContent("You clicked the map at " + e.latlng.toString())
//         .openOn(map);
// }

// map.on('click', onMapClick);
