# Pylon Proxy - A mobile view for Pylon

[Pylon](https://usepylon.com/) is a great tool for support teams. However, at the moment, it misses a interface appropriated for using it on mobile.

Pylon Proxy is application designed to provide a opinionated simplified lightweight interface for interacting with the Pylon on a mobile browser.

## What it Does

The application acts as a proxy, allowing users to securely access and manage Pylon API data through a user-friendly web interface.

*   **Backend**: A Go application built with the Echo framework that proxies requests to the official Pylon API. It handles authentication, data transformation (e.g., simplifying user and team data), and provides endpoints for fetching users, teams, and issues. It also serves OpenAPI documentation for its own API.
*   **Frontend**: A Single Page Application (SPA) built with vanilla JavaScript, HTML, and CSS, served by another Go application (also using Echo). It provides a web interface for users to input their Pylon API key, view issues, and select users/teams. All API calls from the frontend are routed through the backend proxy.


## Development Setup

To run Pylon Proxy locally for development, you will need Docker and Docker Compose installed.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/porter/pylon-proxy.git
    cd pylon-proxy
    ```

2.  **Start the development environment:**
    The `start-development.sh` script will build the Docker images for both the backend and frontend, and then start the services using Docker Compose.

    ```bash
    ./start-development.sh
    ```

    This script will:
    *   Build the `pylon-proxy-backend` and `pylon-proxy-frontend` Docker images.
    *   Start the backend and frontend services, which will be accessible respectively on `http://localhost:8080` and `http://localhost:8081`.

3.  **Access the application:**
    Once the services are running, open your web browser and navigate to `http://localhost:8081`.

    You will be prompted to enter your Pylon API key. After entering a valid key, you can navigate to the "Issues" page to view issues.

## Deployment

This application is designed to be deployed to platforms like Porter. The `.github/workflows` directory contains GitHub Actions workflows (`porter_app_pylon-proxy-backend_4359.yml` and `porter_app_pylon-proxy-frontend_4359.yml`) that automate the build and deployment process for both the backend and frontend services.

These workflows typically:
1.  Build the Docker images for the respective services.
2.  Push the images to a container registry.
3.  Deploy the new images to the configured Porter application.

For specific deployment configurations or manual deployments, refer to the `backend.porter.yaml` and `frontend.porter.yaml` files, which define the Porter application configurations for each service.
