var geoserverUrl = "http://127.0.0.1:8080/geoserver/module6";
var source = 1;
var target = 10;

// Conversion from EPSG:4326 to RD new
//proj4.defs("EPSG:28992", "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +no_defs");

// initialize our map
var map = L.map('map').setView([52.09, 5.11], 13);

// //add openstreet map baselayer to the map
var OpenStreetMap = L.tileLayer(
	"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
	{
		maxZoom: 19,
		attribution:
			'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}
).addTo(map);

// // empty geojson layer for the shortes path result
var pathLayer = L.geoJSON(null);


var sourceMarker = L.marker([52.1, 5.11], {
	draggable: true
})
	.on("dragend", function(e) {
		selectedPoint = e.target.getLatLng();
		getVertex(selectedPoint.lng, selectedPoint.lat, true);
		getRoute();
	})
	.addTo(map);

// draggbale marker for destination point.Note the marker is initialized with an initial destination positon
var targetMarker = L.marker([52.1, 5.11], {
	draggable: true
})
	.on("dragend", function(e) {
		selectedPoint = e.target.getLatLng();
		getVertex(selectedPoint.lng, selectedPoint.lat, false);
		getRoute();
	})
	.addTo(map);

// function to get nearest vertex to the passed point
function getVertex(x, y, isSource) {

	var url = `${geoserverUrl}/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=module6:nearest_vertex_utrecht&outputFormat=application/json&viewparams=x:${x};y:${y}`;
	console.warn(`Fetching nearest vertex for coordinates: (${x}, ${y})`);
	console.warn(`Request URL: ${url}`);

	$.ajax({
		url: url,
		success: function(data) {
			var features = data.features;
			if (!features.length) {
				console.warn("No nearest vertex found");
				return;
			}

			var id = features[0].properties.id;
			console.log(`Nearest vertex ID: ${id}`);
			if (isSource) {
				source = id;
				console.log("Source vertex ID:", source);
			} else {
				target = id;
				console.log("Target vertex ID:", target);
			}

			if (source !== null && target !== null) {
				getRoute();
			}
		}
	});
}

// function to update the source and target nodes as returned from geoserver for later querying
function loadVertex(response, isSource) {
	var features = response.features;
	map.removeLayer(pathLayer);
	if (isSource) {
		source = features[0].properties.id;
	} else {
		target = features[0].properties.id;
	}
}

// function to get the shortest path from the give source and target nodes
function getRoute() {
	var url = `${geoserverUrl}/wfs?service=WFS&version=1.0.1&request=GetFeature&typeName=module6:shortest_path_utrecht&outputFormat=application/json&viewparams=source:${source};target:${target};`;

	$.getJSON(url, function(data) {
		map.removeLayer(pathLayer);
		pathLayer = L.geoJSON(data);
		map.addLayer(pathLayer);
	});
	console.log(`Route requested: source=${source}, target=${target}`);
}



//var pt = proj4("EPSG:28992", "EPSG:4326", [133000, 455000]);
//L.marker([pt[1], pt[0]]).addTo(map).bindPopup("Test point");

// getVertex(sourceMarker.getLatLng());
// getVertex(targetMarker.getLatLng());
// getRoute();

// Random marker for testing purposes
// L.marker([50.5, 30.5]).addTo(map);



// WHAT it returns
// http://127.0.0.1:8080/geoserver/module6/wfs?service=WFS&version=1.0.1&request=GetFeature&typeName=module6:shortest_path_utrecht&outputFormat=application/json&viewparams=source:77183;target

// GOOD
// http://127.0.0.1:8080/geoserver/module6/wfs?service=WFS&version=1.0.1&request=GetFeature&typeName=module6%3Ashortest_path_utrecht&outputFormat=application%2Fjson&maxFeatures=50&viewparams=source:1;target:10