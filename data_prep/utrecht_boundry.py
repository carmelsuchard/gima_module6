import osmnx as ox
import requests
import geopandas as gpd
import json
import os
import pyproj
import sys

utrecht_shapefile = "data_prep/data_layers/utrecht.shp"
if not os.path.exists(utrecht_shapefile):
    # Download municipality borders from PDOK
    endpoint = "https://service.pdok.nl/cbs/gebiedsindelingen/2025/wfs/v1_0"
    params = {
        'request': 'GetFeature',
        'service': 'WFS',
        'version': '1.0.0',
        "typeName": 'gemeente_gegeneraliseerd',
        "outputFormat": "application/json; subtype=geojson"
    }
    response = requests.get(endpoint, params=params)

    if response.status_code == 200:
        print("Success!")
        content = response.content
    else:
        print(f"Error {response.status_code}: {response.reason}")
        response.raise_for_status() 

    # Open with geopandas and filter to Utrecht
    netherlands = gpd.GeoDataFrame.from_features(json.loads(content), crs="EPSG:28992")
    utrecht = netherlands[netherlands['statnaam'] == 'Utrecht']
    utrecht.to_file(utrecht_shapefile, driver='ESRI Shapefile')
