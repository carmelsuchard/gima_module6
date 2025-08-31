FROM python:3.11-slim

# Install git so we can clone the repo
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /gima_module6

# Install dependencies
RUN pip install -r requirements.txt

# Clone your repo
RUN git clone https://github.com/carmelsuchard/gima_module6.git .

# Run your app
CMD ["python", "app.py"]
