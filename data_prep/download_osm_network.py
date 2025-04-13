
G = ox.graph_from_polygon(utrecht, network_type='drive')
ox.plot_graph(G)
    
#  data = gpd.GeoDataFrame.from_features(geojson.loads(r.content), crs="EPSG:3067")   
# EPSG:28992

# municipality = ox.geocode_to_gdf('Berkeley, California')
# ax = ox.project_gdf(municipality).plot()
# _ = ax.axis('off')

	
# G = ox.graph_from_polygon(mission_shape, network_type='all')
# ox.plot_graph(G)

# G = ox.graph_from_polygon(mission_shape, network_type='bike')
# ox.plot_graph(G)