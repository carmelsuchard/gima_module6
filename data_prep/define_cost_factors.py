import geopandas as gpd
import pandas as pd
import os
import numpy as np

def create_cost_factors_table(roads_df):
    # Get unique osmids
    unique_osmids = roads_df['osmid'].unique()
    osms_df = pd.DataFrame(unique_osmids, columns=['osmid'])
    
    # Fill with random values until real factors are calculated
    osms_df['distance'] = np.random.uniform(1, 10, size=len(osms_df))  # Random distances for example
    osms_df['surface'] = np.random.uniform(1, 10, size = len(osms_df))  # Random surface values for example)

    return osms_df

if __name__ == "__main__":
    roads_path = "data_prep/data_layers/utrecht_cyclepaths_edges.shp"
    if not os.path.exists(roads_path):
        raise FileNotFoundError(f"Roads shapefile not found at {roads_path}")
    
    # Load the roads data
    roads_df = gpd.read_file(roads_path)
    
    # Create cost factors table
    cost_factors_df = create_cost_factors_table(roads_df)
    
    # Save cost factors table to a CSV
    cost_factors_df.to_csv("data_prep/data_layers/cost_factors_demo.csv", index=False)
    
    # Save the cost factors table to a CSV file
    # cost_factors.to_csv("data_prep/data_layers/cost_factors.csv", index=False)
    # create_cost_factors_table(r"C:\Users\carme\OneDrive\Documents\Git_Repos\gima_module6\data_prep\data_layers\utrecht_cyclepaths_edges.shp")
    
    