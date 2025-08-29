import geopandas as gpd
import requests

# Read Utrecht boundary
boundary = gpd.read_file("data_prep/data_layers/utrecht.shp")
projected = boundary.to_crs(4326)
utrech_polygon = projected["geometry"].iloc[0]
coords = utrech_polygon.exterior.coords
  # lat lon format


# Download bike paths from OSM and save
poly_str = " ".join(f"{y} {x}" for x, y in coords)

query = f"""
[out:xml][timeout:180];
(
    way
    ["highway"]["area"!~"yes"]["highway"!~"footway|motorway|motorway_link|steps|proposed|construction|abandoned|platform|raceway|bus_guideway"]
    ["bicycle"!~"no"]
    (poly:"{poly_str}");
);
(._;>;);
out body;
"""

# Send query to Overpass API
print("Sending Overpass query")
response = requests.post("https://overpass-api.de/api/interpreter", data={"data": query})
response.raise_for_status()  # Raise an error for bad responses

# Save the result to an OSM XML file
output_path = "data_prep/data_layers/cycling_roads_overpass.osm"
with open(output_path, "wb") as f:
    f.write(response.content)
    
print(f"OSM data saved")