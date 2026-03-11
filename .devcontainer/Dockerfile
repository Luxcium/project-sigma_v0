FROM mcr.microsoft.com/devcontainers/javascript-node:22

# Install Docker CLI for running docker compose from inside the container
RUN apt-get update && apt-get install -y docker.io && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Switch to node user
USER node
