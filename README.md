# PATLYTICS InfringeScan Project

This project consists of two separate services:

1. **PATLYTICS_INFRINGESCAN_BACKEND** (Node.js-based backend API service)
2. **PATLYTICS_INFRINGESCAN_FRONTEND** (React Vite-based frontend application)

Follow the instructions below to set up both services locally using Docker.

---

## Prerequisites

- Docker and Docker Compose must be installed on your system.

## 1. Setting Up the Backend Service

1. **Navigate to the Backend Directory**
   - Open a terminal and navigate to the `PATLYTICS_INFRINGESCAN_BACKEND` directory.

2. **Configure Environment Variables**
   - In the backend directory, locate the `.env` file and fill in the necessary environment variables.

3. **Start Backend Services**
   - Run the following command to start the backend services using Docker:
     ```bash
     docker-compose up -d
     ```
   - This will initialize:
     - `patlytics-inf-api` - The backend API service
     - `patlytics-inf-mysql` - MySQL database service
     - `patlytics-inf-phpmyadmin` - phpMyAdmin for database management
     - `patlytics-inf-network` - Docker network for service communication

4. **Verify Backend Setup**
   - Ensure that all services are up and running. If any changes were made in the `.env` file, make note of any URLs that may need adjustment in the frontend configuration.

---

## 2. Setting Up the Frontend Service

1. **Navigate to the Frontend Directory**
   - Open a new terminal and navigate to the `PATLYTICS_INFRINGESCAN_FRONTEND` directory.

2. **Configure Environment Variables**
   - Check the `.env` file in the frontend directory.
   - Update the `VITE_BACKEND_API_BASE_URL` variable if necessary to match the backend service URL set in the backend’s `.env` file.

3. **Start Frontend Service**
   - Run the following command to start the frontend application:
     ```bash
     docker-compose up -d
     ```

4. **Access the Application**
   - Open a web browser and go to [http://localhost:5373](http://localhost:5373) to view the application.
   - (Assuming the port remains unchanged.)

---

## Notes

- **Troubleshooting:** If you encounter issues, ensure Docker is running and that the environment variables in both `.env` files are correctly configured.

---

Happy Testing!
