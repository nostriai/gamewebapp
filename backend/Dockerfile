# Use a Miniconda base image
FROM continuumio/miniconda3

WORKDIR /app

# Copy the environment file
COPY environment.yml .

# Create the environment and activate it
RUN conda env create -f environment.yml && conda clean --all -y

# Activate Conda environment and set it as default
SHELL ["conda", "run", "-n", "fastapi_env", "/bin/bash", "-c"]

# Copy the rest of the app
COPY . .

# Run FastAPI app using Conda environment
CMD ["conda", "run", "-n", "fastapi_env", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
