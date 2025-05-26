import geopandas as gpd
import osmnx as ox

ox.settings.use_cache = True
ox.settings.log_console = True
ox.settings.all_tags = True

# Read Utrecht boundary
boundary = gpd.read_file("data_prep/data_layers/utrecht.shp")
projected = boundary.to_crs(4326)
utrech_polygon = projected["geometry"].iloc[0]

# Download bike paths from OSM

custom_filter = (
    '["highway"]["area"!~"yes"]["highway"!~"footway|motorway|motorway_link|steps|proposed|construction|abandoned|platform|raceway|bus_guideway"]'
    '["bicycle"!~"no"]'
)

G = ox.graph_from_polygon(
    utrech_polygon,
    network_type='all',
    simplify=False,
    retain_all=True,
    truncate_by_edge=True,
    custom_filter=custom_filter
)

# # Save raw osm for pgRouting
# ox.save_graph_xml(G, "data_prep/data_layers/cycling_roads.osm")

# Convert to geodataframes
gdf_nodes, gdf_edges = ox.convert.graph_to_gdfs(G, nodes=True, edges=True, node_geometry=True, fill_edge_geometry=True)

# Project to RD New
gdf_nodes = gdf_nodes.to_crs("EPSG:28992")
gdf_edges = gdf_edges.to_crs("EPSG:28992")

# Save to shapefiles
gdf_nodes.to_file("data_prep/data_layers/utrecht_cyclepaths_nodes.shp")
gdf_edges.to_file("data_prep/data_layers/utrecht_cyclepaths_edges.shp")


# Tutorials
# https://github.com/gboeing/osmnx-examples/blob/main/notebooks/03-graph-place-queries.ipynb
# https://geoffboeing.com/2016/11/osmnx-python-street-networks/

# osm2pgrouting.ext Upload to Postgres:
# C:\Program Files\PostgreSQL\16\bin
# osm2pgrouting.exe -c "C:\Program Files\PostgreSQL\16\bin\mapconfig_for_bicycles.xml" -d postgres -U postgres -W my_password -f "C:\Users\carme\OneDrive\Documents\Git_Repos\gima_module6\data_prep\data_layers\cycling_roads.osm" -- tags