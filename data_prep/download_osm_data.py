import geopandas as gpd
import osmnx as ox
import os

# Read Utrecht boundary
boundary = gpd.read_file("data_prep/data_layers/utrecht.shp")
projected = boundary.to_crs(4326)
utrech_polygon = projected["geometry"].iloc[0]

# Get bicycle repair stations
repairs = "data_prep/data_layers/repair_stations.shp"
if not os.path.exists(repairs):
    tags = {"amenity": "bicycle_repair_station"}
    gdf = ox.features.features_from_polygon(utrech_polygon, tags)
    gdf.to_crs(28992)
    gdf.to_file(repairs, driver='ESRI Shapefile')
else:
    print("Repair stations already downloaded.")    
    
bicycle_parking = "data_prep/data_layers/bicycle_parking.shp"
if not os.path.exists(bicycle_parking):
    tags = {"amenity": "bicycle_parking"}
    gdf = ox.features.features_from_polygon(utrech_polygon, tags)
    gdf.to_crs(28992)
    gdf.to_file(bicycle_parking, driver='ESRI Shapefile')
else:
    print("Bicycle parking already downloaded.")
    gdf = gpd.read_file(bicycle_parking)
    print(gdf)

# Find lists of available tags: 
# https://taginfo.openstreetmap.org/projects

# cyclosm elemnts
# https://www.cyclosm.org/legend.html
# Tags used by cyclosm
# https://raw.githubusercontent.com/cyclosm/cyclosm-cartocss-style/master/taginfo.json