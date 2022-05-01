
// Configuration Obj --------------------------------------------------------------
let tileLayer = {
    cartoDBVoyager: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }),
    openStreet: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '',
        maxZoom: 20,
    }),
    googleStreet: L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&language=en-US', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }),
    googleSat: L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&language=en-US', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }),
    googleTerrain: L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&language=en-US', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }),
    ESRI: L.tileLayer(
        'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '',
        maxZoom: 20,
    }),
    clean: L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: ''
    }),
    dark: L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: ''
    }),

}
let majorMapConfig = {
    minZoom: 2,
    maxZomm: 20,
    zoomControl: false,
    'messagebox': true,
    zoom: 3,
    lat: 18,
    lng: 15,
};
var heatmapOverlayConfig = {
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
var dataBundle = {
    countryName: [],
    lastUpdate: [],
    lat: [],
    lng: [],
    Confirmed: [],
    Deaths: [],
    Recovered: [],
    Active: []
};
var searchControl = new L.Control.Search({
    position: 'topleft',
    layer: markersLayer,
    url: 'https://nominatim.openstreetmap.org/search?format=json&accept-language=en-US&q={s}',
    jsonpParam: 'json_callback',
    propertyName: 'display_name',
    propertyLoc: ['lat', 'lon'],
    animateLocation: true,		//animate a circle over location found
    circleLocation: false,		//draw a circle in location found
    markerLocation: true,		//draw a marker in location found
    minLength: 2,
    zoom: 9,
    text: 'Search',
    textCancel: 'Cancel',
    textErr: 'Not found',
    // map.setView([0, 0], 0);
})

// Variables ----------------------------------------------------------------------
let current_zoom_level = 1;
let circlesArrayWorld = [];
let circlesArraySL = [];
var circlesWorld = L.layerGroup;
var geo = []
var markersLayer = new L.LayerGroup();
var patientFeatureGroup = new L.featureGroup();
var chart;

// Secondary Functions ------------------------------
function messegeBoxFunctionality() {
    L.Control.Messagebox = L.Control.extend({
        options: {
            position: 'topright',
            timeout: 3000
        },

        onAdd: function (map) {
            this._container = L.DomUtil.create('div', 'leaflet-control-messagebox');
            //L.DomEvent.disableClickPropagation(this._container);
            return this._container;
        },

        show: function (message, timeout) {
            var elem = this._container;
            elem.innerHTML = message;
            elem.style.display = 'block';

            timeout = timeout || this.options.timeout;

            if (typeof this.timeoutID == 'number') {
                clearTimeout(this.timeoutID);
            }
            this.timeoutID = setTimeout(function () {
                elem.style.display = 'none';
            }, timeout);
        }
    });

    L.Map.mergeOptions({
        messagebox: false
    });

    L.Map.addInitHook(function () {
        if (this.options.messagebox) {
            this.messagebox = new L.Control.Messagebox();
            this.addControl(this.messagebox);
        }
    });

    L.control.messagebox = function (options) {
        return new L.Control.Messagebox(options);
    };
}

function additionalMapConfig() {
    map.attributionControl.setPrefix(false);
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
}

function addAdditionalTileLayers() {
    let baseMaps = {
        "Clean": clean,
        "Dark": dark,
        "OpenStreet": openStreet,
        "ESRI Satellite": ESRI,
        "Google Street": googleStreet,
        "Google Satellite": googleSat,
    };
    L.control.layers(baseMaps).addTo(map);
}

// Primary Functions ------------------------------

function initChart() {
    chart = new Chart('chartCanvas', {
    type: 'doughnut',
    data: {
      labels: ['Active', 'Recoverd', 'Death'],
      datasets: [{
        data: [12, 19, 3],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(54, 162, 235, 0.2)',


        ],
        borderColor: [
          'rgba(255,99,132,1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',


        ],
        borderWidth: 1
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        display: true,
        position: "bottom",
        align: "center"
      },
      tooltips: {
        enabled: true
      },
      title: {
        display: true,
        text: 'Summary'
      },
      elements: {
        center: {
          text: '5555555',
          color: '#1D1E20', // Default is #000000
          fontStyle: 'Arial', // Default is Arial
          sidePadding: 20, // Default is 20 (as a percentage)
          minFontSize: 5, // Default is 20 (in px), set to false and text will not wrap.
          lineHeight: 25 // Default is 25 (in px), used for when text wraps
        }
      }
    }
  });
  // chart.canvas.parentNode.style.height = '180px';
  // chart.canvas.parentNode.style.width = '180px';

  // map.on('zoom move', updateChart);
  // CartoDB_Voyager.on('load', updateChart);

  document.getElementById("info-pane").style.display = 'none';
}

function updateLocationOfCircles() {
    count = 0;
    while (dataBundle.countryName.length != count) {

        // console.log(dataBundle.countryName[count]);

        var circleCenter = [dataBundle.lat[count], dataBundle.lng[count]];
        var circleOptions = {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: .4,
            weight: .5
        }

        let circleSize = dataBundle.Confirmed[count] / 40;
        // console.log(circleSize);
        var circle = L.circle(circleCenter, circleSize, circleOptions);

        // circle.on('click', function(e){
        //   console.log(e);
        //   console.log(e.target._popup._content)
        // });



        // circle.bindPopup(
        //   "<div id=\"popupTable\"><table>" +
        //   "<tr><th colspan=2>" + dataBundle.countryName[count] + "</th></tr>" +
        //   "<tr><td>🏥 Confirmed</td><td>" + dataBundle.Confirmed[count] + "</td></tr>" +
        //   "<tr><td>🟢 Active</td><td>" + dataBundle.Active[count] + "</td></tr>" +
        //   "<tr><td>🩹 Recovered</td><td>" + dataBundle.Recovered[count] + "</td></tr>" +
        //   "<tr><td>💀 Deaths</td><td>" + dataBundle.Deaths[count] + "</td></tr>" +
        //   "</table></div>"
        // );

        circle.bindPopup(
            "{ \"data\": [\"" +
            dataBundle.countryName[count] + "\"," +
            dataBundle.Confirmed[count] + "," +
            dataBundle.Active[count] + "," +
            dataBundle.Recovered[count] + "," +
            dataBundle.Deaths[count] + "]}"
        );

        circle.on("click", onClickCircle);


        circlesArrayWorld.push(circle);


        count += 1;
    }
    circlesWorld = L.layerGroup(circlesArrayWorld);
    circlesWorld.addTo(map);
}

function onClickCircle(e) {

    document.getElementById("info-pane").style.display = 'block';

    var clickedCircle = e.target;
    clickedCircle.closePopup();

    const obj = JSON.parse(clickedCircle._popup._content);

    chart.data.datasets[0].data[0] = obj.data[2];
    chart.data.datasets[0].data[1] = obj.data[3];
    chart.data.datasets[0].data[2] = obj.data[4];

    chart.options.title.text = obj.data[0];
    chart.options.elements.center.text = obj.data[1];
    chart.options.legend.labels.boxWidth = 5;
    chart.update();
}

function isNoData(str) {
    if (str == null) return true;
    else {
        try {
            if (str.length < 2) return true
            else return false
        } catch (error) {
            return true
        }
    }
}

// LK Data ------------------------------

function loadSLData() {

    const Http = new XMLHttpRequest();
    const url = 'https://nhss.gov.lk/api/suwapetha/getPatientData/covid';
    Http.open("POST", url);
    Http.send();

    let pationt = [];
    isLoaded = true;

    Http.onloadend = (e) => {

        const obj = JSON.parse(Http.responseText);
        // console.log(obj.http_status);

        for (let item in obj.patients) {
            // console.log(obj.patients[item].Date_of_report_received);
            // console.log(obj.patients[item].lat);
            // console.log(obj.patients[item].lng);
            if (obj.patients[item].lat >= 0) {
                if (obj.patients[item].lng >= 0) {
                    pationt.push({ "lat": parseFloat(obj.patients[item].lat), "lng": parseFloat(obj.patients[item].lng), count: 1 });

                    var circleCenter = [parseFloat(obj.patients[item].lat), parseFloat(obj.patients[item].lng)];
                    geo.push(circleCenter);
                    var circleOptions = {
                        color: 'red',
                        fillColor: '#f03',
                        fillOpacity: .4
                    }
                    var circle = L.circle(circleCenter, 50, circleOptions);

                    circle.bindPopup(obj.patients[item].Date_of_report_received);

                    circle.addTo(patientFeatureGroup);
                    circlesArraySL.push(circle);



                }
            }

        }


        var testData = {
            "data": pationt,
        };


        // patientFeatureGroup.on("click", function (e) {
        //     slExtraInfo(e)
        // }).addTo(map);

        // geo = {
        //     "type": "MultiPoint",
        //     "coordinates": [[7., 80.], [7., 80.], [7., 79.], [6., 79.], [8., 80.], [7., 81.], [6., 79.]]
        // }
        // L.geoJSON(geo).addTo(map);


        // var heatmapLayer = new HeatmapOverlay(heatmapOverlayConfig);
        // heatmapLayer.setData(testData);
        //map.addLayer(heatmapLayer);

    }
}

function slExtraInfo(context) {

    const params = {
        "id": 0,
        "lat": context.latlng.lat,
        "lng": context.latlng.lng,
        "uid": 0
    }

    console.log(context);


    const http = new XMLHttpRequest();
    const url = 'https://nhss.gov.lk/api/suwapetha/locationInfo';
    http.open("POST", url, true);
    http.setRequestHeader('Content-type', 'application/json;charset=utf-8');
    http.setRequestHeader('User-Agent', 'okhttp/3.12.1');
    http.setRequestHeader('Accept', 'application/json, text/plain, */*');
    http.send(JSON.stringify(params));

    http.onloadend = (e) => {

        const obj = JSON.parse(http.responseText);
        let popupString = "<table>";

        if (obj.http_status == "success") {


            popupString += "<tr><td> Reported </td><td>" + context.layer._popup._content + "</td></tr>"
            popupString += "<tr><td colspan=2>" + obj.location.province + " Province - " + obj.location.district + "</td></tr>"
            popupString += "<tr><td> DSD </td><td>" + obj.location.dsd + "</td></tr>"
            popupString += "<tr><td> GND </td><td>" + obj.location.gndName + "</td></tr>"
            popupString += "<tr><td> MOH </td><td>" + obj.location.MOH + "</td></tr>"
            if (isNoData(obj.location.PHI) == false) popupString += "<tr><td> PHI </td><td>" + obj.location.PHI + "</td></tr>"

            popupString += "</table>"
            // {
            //   "http_status": "success",
            //   "location": {
            //     "gndName": "Bandirippuwa North",
            //     "province": "North Western",
            //     "district": "Puttalam",
            //     "dsd": "Wennappuwa",
            //     "MOH": "Dankotuwa MOH",
            //     "PHI": " ",
            //     "phi_officer_name": " ",
            //     "phi_officer_mobile": null,
            //     "moh_officer": " ",
            //     "moh_tel": null,
            //     "MOH_Tel": "312258178"
            //   }
            // }
        }



        var clickedCircle = context.layer;
        clickedCircle.bindPopup(popupString).openPopup();



    };
}

// World Data ------------------------------

function secondaryWorldDataSource(datesBack) {

    var today = new Date();
    var yesterday = new Date();
    yesterday.setDate(today.getDate() - datesBack);

    var dd = String(yesterday.getDate()).padStart(2, '0');
    var mm = String(yesterday.getMonth() + 1).padStart(2, '0');
    var yyyy = yesterday.getFullYear();

    let _date_ = mm + '-' + dd + '-' + yyyy;


    const Http = new XMLHttpRequest();
    let url = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/' + _date_ + '.csv';
    Http.open("GET", url);
    Http.send();



    Http.onloadend = (e) => {


        var allText = "";
        if (Http.status != 200) {
            worldDataSource2(datesBack + 1);

        } else {
            allText = Http.responseText;
            console.log(allText);
            var allTextLines = CSVToArray(allText)
            var count = 1;

            while (allTextLines.length != count) {

                let rowArray = allTextLines[count];
                // FIPS,Admin2,Province_State,Country_Region,Last_Update,Lat,Long_,Confirmed,Deaths,Recovered,Active,Combined_Key,Incident_Rate,Case_Fatality_Ratio

                if (rowArray[2] == "" || rowArray[2] != "") {  // skip privince_state filter      
                    if (rowArray[5] != undefined || rowArray[6] != undefined) {

                        // if(dataBundle.countryName.includes(rowArray[3])){
                        //     const position = dataBundle.countryName.indexOf(rowArray[3]);
                        //     dataBundle.Confirmed[position] += rowArray[7];
                        //     dataBundle.Deaths[position] += rowArray[8];
                        //     dataBundle.Recovered[position] += rowArray[9];
                        //     dataBundle.Active[position] += rowArray[10];
                        // }else{
                        //   dataBundle.countryName.push(rowArray[3]);
                        //   dataBundle.lastUpdate.push(rowArray[4]);
                        //   dataBundle.lat.push(rowArray[5]);
                        //   dataBundle.lng.push(rowArray[6]);
                        //   dataBundle.Confirmed.push(rowArray[7]);
                        //   dataBundle.Deaths.push(rowArray[8]);
                        //   dataBundle.Recovered.push(rowArray[9]);
                        //   dataBundle.Active.push(rowArray[10]);

                        // dataBundle.lastUpdate.push(rowArray[4]);
                        // dataBundle.lat.push(rowArray[5]);
                        // dataBundle.lng.push(rowArray[6]);
                        // dataBundle.Confirmed.push(rowArray[7]);
                        // dataBundle.Deaths.push(rowArray[8]);
                        // dataBundle.Recovered.push(rowArray[9]);
                        // dataBundle.Active.push(rowArray[10]);

                        // if(rowArray[2].trim() == ""){
                        //   dataBundle.countryName.push(rowArray[3]);
                        // }else{
                        //   let position = multiplePoints.country.indexOf(rowArray[3]);
                        //   if(position != -1){
                        //     multiplePoints.confirmed[position] += parseInt(rowArray[7]);
                        //     multiplePoints.death[position] += parseInt(rowArray[8]);
                        //   }else{
                        //     multiplePoints.country.push(rowArray[3]);
                        //     multiplePoints.confirmed.push(parseInt(rowArray[7]));
                        //     multiplePoints.death.push(parseInt(rowArray[8]));
                        //   }

                        //   console.log(rowArray[3] + " - " + rowArray[2]);
                        //   dataBundle.countryName.push(rowArray[3] + " - " + rowArray[2]);
                        // }



                        if (rowArray[2].trim() == "") {
                            dataBundle.countryName.push(rowArray[3]);
                            dataBundle.lastUpdate.push(rowArray[4]);
                            dataBundle.lat.push(rowArray[5]);
                            dataBundle.lng.push(rowArray[6]);
                            dataBundle.Confirmed.push(parseInt(rowArray[7]));
                            dataBundle.Deaths.push(parseInt(rowArray[8]));
                            dataBundle.Recovered.push(parseInt(rowArray[9]));
                            dataBundle.Active.push(parseInt(rowArray[10]));
                        } else {
                            let position = dataBundle.countryName.indexOf(rowArray[3]);
                            if (position != -1) {

                                if (parseInt(rowArray[7]) >= 0) {
                                    dataBundle.Confirmed[position] += parseInt(rowArray[7]);
                                }
                                if (parseInt(rowArray[8]) >= 0) {
                                    dataBundle.Deaths[position] += parseInt(rowArray[8]);
                                }
                                if (parseInt(rowArray[9]) >= 0) {
                                    dataBundle.Recovered[position] += parseInt(rowArray[9]);
                                }
                                if (parseInt(rowArray[10]) >= 0) {
                                    dataBundle.Active[position] += parseInt(rowArray[10]);
                                }
                            } else {
                                if (parseInt(rowArray[7]) >= 0) {
                                    dataBundle.Confirmed.push(parseInt(rowArray[7]));
                                } else { dataBundle.Confirmed.push(0) }

                                if (parseInt(rowArray[8]) >= 0) {
                                    dataBundle.Deaths.push(parseInt(rowArray[8]));
                                } else { dataBundle.Deaths.push(0) }

                                if (parseInt(rowArray[9]) >= 0) {
                                    dataBundle.Recovered.push(parseInt(rowArray[9]));
                                } else { dataBundle.Recovered.push(0) }

                                if (parseInt(rowArray[10]) >= 0) {
                                    dataBundle.Active.push(parseInt(rowArray[10]));
                                } else { dataBundle.Active.push(0) }

                                dataBundle.countryName.push(rowArray[3]);
                                dataBundle.lastUpdate.push(rowArray[4]);
                                dataBundle.lat.push(rowArray[5]);
                                dataBundle.lng.push(rowArray[6]);

                            }
                            console.log(rowArray[7], rowArray[8], rowArray[9], rowArray[10]);
                            // console.log(rowArray[3] + " - " + rowArray[2]);

                        }


                    }

                }

                count += 1;
            }

            updateLocationOfCircles();
        }





    };



    return dataBundle;
}

function primaryWorldDataSource() {

    const Http = new XMLHttpRequest();
    let url = 'https://corona.lmao.ninja/v2/countries?yesterday&sort';
    Http.open("GET", url);
    Http.send();

    Http.onloadend = (e) => {


        var allText = "";
        if (Http.status != 200) {
            console.log("Pulling data from secondary source")
            secondaryWorldDataSource(1);

        } else {
            console.log("Primary source is OK")
            allText = Http.responseText;

            const obj = JSON.parse(allText);

            var count = 0;
            while (obj.length != count) {


                dataBundle.countryName.push(obj[count].country);
                dataBundle.lastUpdate.push(obj[count]);
                dataBundle.lat.push(obj[count].countryInfo.lat);
                dataBundle.lng.push(obj[count].countryInfo.long);
                dataBundle.Confirmed.push(parseInt(obj[count].cases));
                dataBundle.Deaths.push(parseInt(obj[count].deaths));
                dataBundle.Recovered.push(parseInt(obj[count].recovered));
                dataBundle.Active.push(parseInt(obj[count].active));


                // console.log(rowArray[7], rowArray[8], rowArray[9], rowArray[10]);
                // console.log(rowArray[3] + " - " + rowArray[2]);


                count += 1;
            }

            updateLocationOfCircles();
        }

    };



    return dataBundle;
}

function loadWorldSummary(dataBundle) {


    const Http_2 = new XMLHttpRequest();
    const url_2 = 'https://api.covid19api.com/summary';
    Http_2.open("GET", url_2);
    Http_2.send();

    Http_2.onloadend = (e) => {



        const obj = JSON.parse(Http_2.responseText);
        let minCases = 2 ^ 53 - 1;
        let maxCases = 0;

        if (obj.Message == "Caching in progress") {
            box.show('Servers are busy. Try again');
        }

        for (let item in obj.Countries) {
            if (obj.Countries[item].TotalConfirmed < minCases) {
                minCases = obj.Countries[item].TotalConfirmed;
            }
            if (obj.Countries[item].TotalConfirmed > maxCases) {
                maxCases = obj.Countries[item].TotalConfirmed;
            }
        }

        let classWidth = parseInt((maxCases - minCases) / 5)
        console.log(minCases, maxCases, classWidth);



        for (let item in obj.Countries) {

            let lat = dataBundle["lat"][obj.Countries[item].CountryCode];
            let lng = dataBundle["lng"][obj.Countries[item].CountryCode];

            if (lat != undefined) {
                console.log(obj.Countries[item].Country);
                console.log(dataBundle["lat"][obj.Countries[item].CountryCode]);
                console.log(dataBundle["lng"][obj.Countries[item].CountryCode]);


                var circleCenter = [lat, lng];
                var circleOptions = {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: .4,
                    weight: .5
                }




                let circleSize = obj.Countries[item].TotalConfirmed / 40;
                var circle = L.circle(circleCenter, circleSize, circleOptions);
                circle.addTo(map);
            }
        }

    };
}



// Initalize ------------------------------
const map = L.map('map', majorMapConfig).setView([majorMapConfig.lat, majorMapConfig.lng], majorMapConfig.zoom);
var southWest = L.latLng(-89.98155760646617, -180), northEast = L.latLng(89.99346179538875, 180);
map.setMaxBounds(L.latLngBounds(southWest, northEast));
tileLayer.cartoDBVoyager.addTo(map);
L.control.scale().addTo(map);

map.addControl(searchControl);
L.control.zoom({ position: 'topleft' }).addTo(map);

// Events - Search
searchControl.on('search_locationfound', function (e) {
    console.log('search:locationfound');
});
searchControl.on('search_collapsed', function (e) {
    console.log('search:collapsed');
});

// Events - Map
map.on("zoomstart", function (e) {
    // console.log("ZOOMSTART", e);
    // console.log("ZOOMEND", e.target._zoom); 
    // zoomConfig.previous = e.target._zoom;
    current_zoom_level = e.target._zoom;

    document.getElementById("info-pane").style.display = 'none';
});
map.on("zoomend", function (e) {
    if (map.getCenter().lng > 79 & map.getCenter().lng < 83) {
        if (map.getCenter().lat > 6 & map.getCenter().lat < 10) {
            if (e.target._zoom >= 9) {
                map.removeLayer(circlesWorld);
                // slDotLayer.addTo(map);
            } else {
                // map.removeLayer(slDotLayer);
                circlesWorld.addTo(map);
            }

        } else {
            // map.removeLayer(slDotLayer);
            circlesWorld.addTo(map);
        }

    } else {
        // map.removeLayer(slDotLayer);
        circlesWorld.addTo(map);
    }

});
map.on("moveend", function (e) {
    current_zoom_level = e.target._zoom;
    if (map.getCenter().lng > 79 & map.getCenter().lng < 83) {
        if (map.getCenter().lat > 6 & map.getCenter().lat < 10) {
            if (e.target._zoom >= 9) {
                map.removeLayer(circlesWorld);
                // slDotLayer.addTo(map);
            } else {
                // map.removeLayer(slDotLayer);
                circlesWorld.addTo(map);
            }

        } else {
            // map.removeLayer(slDotLayer);
            circlesWorld.addTo(map);
        }

    } else {
        // map.removeLayer(slDotLayer);
        circlesWorld.addTo(map);
    }
});
map.on('click', function (e) {

    console.log(e);
    if (e.type == "click") {
        markersLayer.clearLayers();
        document.getElementById("info-pane").style.display = 'none';
    }


    // var popLocation= e.latlng;
    // var popup = L.popup()
    // .setLatLng(popLocation)
    // .setContent('<p>Hello world!<br />This is a nice popup.</p>')
    // .openOn(map);        
});

// Load data
primaryWorldDataSource();
loadSLData();
initChart();

// Additional Features ------------------------------
messegeBoxFunctionality();
var box = L.control.messagebox({ timeout: 5000 }).addTo(map);

// BOX
var info = L.control();
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'infoMy');
    this.update();
    return this._div;
};
info.update = function (props) {
    this._div.innerHTML = '<div><canvas id="myChart"></canvas></div>';
};
// info.addTo(map);

// map.locate({ setView: true, watch: true }) /* This will return map so you can do chaining */
// map.on('locationfound', function (e) {
//   var marker = L.marker([e.latitude, e.longitude]).bindPopup('Your are here :)');
//   var circle = L.circle([e.latitude, e.longitude], e.accuracy / 2, {
//     weight: 1,
//     color: 'blue',
//     fillColor: '#cacaca',
//     fillOpacity: 0.2
//   });
//   map.addLayer(marker);
//   map.addLayer(circle);
// })
// map.on('locationerror', function (e) {
//   console.log(e);
//   alert("Location access denied.");
// });


L.Control.CustomCommand = L.Control.extend({
    options: {
        position: 'topleft',
    },

    onAdd: function (map) {
        var controlDiv = L.DomUtil.create('div', 'leaflet-control-command');
        L.DomEvent
            .addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
            .addListener(controlDiv, 'click', L.DomEvent.preventDefault)
            .addListener(controlDiv, 'click', function () { MapShowCommand(); });

        var controlUI = L.DomUtil.create('div', 'leaflet-control-command-interior', controlDiv);
        controlUI.title = 'Map Commands';
        return controlDiv;
    }
});
var removeAllControl = new L.Control.CustomCommand();
map.addControl(removeAllControl);
function MapShowCommand() {
    alert(55)
}

