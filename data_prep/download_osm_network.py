import geopandas as gpd
import osmnx as ox

# Read Utrecht boundary
boundary = gpd.read_file("data_prep/data_layers/utrecht.shp")
projected = boundary.to_crs(4326)
utrech_polygon = projected["geometry"].iloc[0]

# Download bike paths from OSM and save
G = ox.graph_from_polygon(utrech_polygon, network_type='bike')
try:
    ox.io.save_graph_xml(G, filepath="data_prep/data_layers/utrecht_cyclepaths.osm")
except ox._errors.GraphSimplificationError as e:
    print (f"Can't save as .osm, error: {e}")
finally:
    gdf_nodes, gdf_edges = ox.convert.graph_to_gdfs(G)
    gdf_nodes = gdf_nodes.to_crs("EPSG:28992")
    gdf_edges = gdf_edges.to_crs("EPSG:28992")
    gdf_nodes.to_file("data_prep/data_layers/utrecht_cyclepaths_nodes.shp")
    gdf_edges.to_file("data_prep/data_layers/utrecht_cyclepaths_edges.shp")

    print(gdf_edges.crs)

# Tutorials
# https://github.com/gboeing/osmnx-examples/blob/main/notebooks/03-graph-place-queries.ipynb
# https://geoffboeing.com/2016/11/osmnx-python-street-networks/