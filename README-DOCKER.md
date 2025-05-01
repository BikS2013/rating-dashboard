# Dockerized Rating Dashboard

This document explains how to build and run the Rating Dashboard using Docker.

## Prerequisites

- Docker installed on your machine
- Docker Compose installed on your machine (optional, but recommended)

## Building and Running with Docker

### Using Docker Compose (Recommended)

1. Navigate to the project directory:

```bash
cd ~/aiwork/open-webui-work/rating-dashboard
```

2. Build and start the container:

```bash
docker-compose up -d
```

This command will:
- Build the Docker image based on the Dockerfile
- Start the container in detached mode
- Map port 8080 on your host to port 80 in the container

3. Access the application at http://localhost:8080

4. To stop the container:

```bash
docker-compose down
```

### Using Docker CLI

If you prefer to use Docker CLI directly:

1. Build the Docker image:

```bash
docker build -t rating-dashboard .
```

2. Run the container:

```bash
docker run -d -p 8080:80 --name rating-dashboard rating-dashboard
```

3. Access the application at http://localhost:8080

4. To stop the container:

```bash
docker stop rating-dashboard
docker rm rating-dashboard
```

## Environment Variables

The application uses environment variables for configuration. In the Docker setup:

- Environment variables are handled by Vite during the build process
- The `.env.production` file is used during the build phase
- If you need to change environment variables after building, you can modify the Docker Compose file to mount a custom .env file

## Customizing the Nginx Configuration

The application uses Nginx to serve the static files. The Nginx configuration is located in `nginx.conf`. If you need to customize it:

1. Modify the `nginx.conf` file
2. Rebuild the Docker image:

```bash
docker-compose build
# or
docker build -t rating-dashboard .
```

## Troubleshooting

### Container not starting properly

Check the container logs:

```bash
docker logs rating-dashboard
```

### Cannot access the application

Make sure:
- The container is running: `docker ps`
- The port mapping is correct: it should show `8080:80` in the docker ps output
- Your firewall allows connections to port 8080

### Changes to environment variables not taking effect

Remember that environment variables are baked into the application during the build process in a React application. If you change environment variables:

1. Update the `.env.production` file
2. Rebuild the image: `docker-compose build` or `docker build -t rating-dashboard .`
3. Restart the container