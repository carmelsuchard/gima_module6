FROM python:3.11-slim

# Set working directory
WORKDIR /gima_module6

# Copy everything from your repo into /gima_mod6
COPY . /gima_module6

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Run your app
CMD ["python", "app.py"]
