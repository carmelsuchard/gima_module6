var geoserverUrl = "http://127.0.0.1:8080/geoserver/module6";

// Default source and target vertex IDs
var source = 100782;
var target = 92512;

const sliders = {
  Greenery: document.getElementById('Greenery'),
  Visibility: document.getElementById('Visibility'),
  Surveillance: document.getElementById('Surveillance'),
  Slope: document.getElementById('Slope'),
  Surface_Hazard: document.getElementById('Surface Hazard'),
  Flow_Efficiency: document.getElementById('Flow Efficiency'),
  Traffic_Intensity: document.getElementById('Traffic Intensity'),
  Crime_Risk: document.getElementById('Crime Risk'),
  Intersections: document.getElementById('Intersections'),
  Incidents: document.getElementById('Incidents')
};

const sliderValues = {
  Greenery: sliders.Greenery.value,
  Visibility: sliders.Visibility.value,
  Surveillance: sliders.Surveillance.value,
  Slope: sliders.Slope.value,
  Surface_Hazard: sliders['Surface_Hazard'].value,
  Flow_Efficiency: sliders['Flow_Efficiency'].value,
  Traffic_Intensity: sliders['Traffic_Intensity'].value,
  Crime_Risk: sliders['Crime_Risk'].value,
  Intersections: sliders['Intersections'].value,
  Incidents: sliders['Incidents'].value,
};

const personaPresets = {
  stress_avoider: {
	Visibility: 5,
	Surveillance: 5,
	Surface_Hazard: 10,
	Traffic_Intensity: 40,
	Crime_Risk: 10,
	Intersections: 20,
	Incidents: 10,
	Greenery: 0,
	Slope: 0,
	Flow_Efficiency: 0

  },
  visibility_seeker: {
    Visibility: 70,
	Surveillance: 10,
	Crime_Risk: 20,
	Greenery: 0,
	Slope: 0,
	Surface_Hazard: 0,
	Flow_Efficiency: 0,
	Traffic_Intensity: 0,
	Intersections: 0,
	Incidents: 0
  },
  comfort_rider: {
    Greenery: 5,
	Slope: 30,
	Surface_Hazard: 10,
	Traffic_Intensity: 40,
	Incidents: 15,
	Visibility: 0,
	Surveillance: 0,
	Flow_Efficiency: 0,
	Crime_Risk: 0,
	Intersections: 0
  },
  flow_seeker: {
    Slope: 20,
	Surface_Hazard: 20,
	Flow_Efficiency: 50,
	Intersections: 10,
	Visibility: 0,
	Surveillance: 0,
	Greenery: 0,
	Traffic_Intensity: 0,
	Crime_Risk: 0,
	Incidents: 0
  }
};

const personaButtons = document.querySelectorAll(".persona-button");

personaButtons.forEach(button => {
  button.addEventListener("click", () => {
    const preset = personaPresets[button.id];
    for (const key in preset) {
      if (sliders[key]) {
        sliders[key].value = preset[key];           // Set the slider
        sliderValues[key] = preset[key];             // Update the synced variable
      }
    }
  });
});



// Step 3: Function to update variable on slider input
function updateSliderValue(id) {
  sliderValues[id] = sliders[id].value;
  // Call your function here or wherever you want to use the updated values
  yourFunctionUsingSliders();
}

// Attach event listeners
for (const id in sliders) {
  sliders[id].addEventListener('input', () => updateSliderValue(id));
}

// Your function that uses the current slider values
function yourFunctionUsingSliders() {
  // Example: just console.log the current values
  console.log('Current slider values:', sliderValues);
}

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


var sourceMarker = L.marker([52.089382, 5.1097798347], {
	draggable: true
})
	.on("dragend", function(e) {
		selectedPoint = e.target.getLatLng();
		getVertex(selectedPoint.lng, selectedPoint.lat, true);
		map.removeLayer(pathLayer)
	})
	.addTo(map);

// draggbale marker for destination point.Note the marker is initialized with an initial destination positon
var targetMarker = L.marker([52.08896, 5.1674902], {
	draggable: true
})
	.on("dragend", function(e) {
		selectedPoint = e.target.getLatLng();
		getVertex(selectedPoint.lng, selectedPoint.lat, false);
		map.removeLayer(pathLayer);
	})
	.addTo(map);

// function to get nearest vertex to the passed point
function getVertex(x, y, isSource) {

	var url = `${geoserverUrl}/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=module6:nearest_vertex_utrecht_cloud&outputFormat=application/json&viewparams=x:${x};y:${y}`;	
	console.warn(`Fetching nearest vertex for coordinates: (${x}, ${y})`);

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
	console.log(`Route requested: source=${source}, target=${target}`);

	// Get the selectedPersona variable, depending on selected persona, then network call will be different
	const url = getUrlForSelectedPersona(source, target);

	console.log("URL:", url);

	if (source !== null && target !== null) {
		console.log("Went into the if statement");

		$.getJSON(url, function(data) {
			map.removeLayer(pathLayer);

			// Apply styling to the route
			pathLayer = L.geoJSON(data, {
				style: function (feature) {
					return {
						color: '#d968c0',
						weight: 6,
						opacity: 0.9
					};
				}
			});

			map.addLayer(pathLayer);
		});
	} else {
		console.warn("Source or target vertex is not set. Please set both before requesting a route.");
		alert("Please select both source and target points on the map before requesting a route.");
	}
}

document.addEventListener("DOMContentLoaded", function () {
	document.getElementById("makeRouteButton").addEventListener("click", getRoute);
});

//var pt = proj4("EPSG:28992", "EPSG:4326", [133000, 455000]);
//L.marker([pt[1], pt[0]]).addTo(map).bindPopup("Test point");

// getVertex(sourceMarker.getLatLng());
// getVertex(targetMarker.getLatLng());
// getRoute();

// Random marker for testing purposes
// L.marker([50.5, 30.5]).addTo(map);

