# 4205_prac_2
Interactive Geospatial Query Appliction

## 1. Project Overview
### Motivation
The main purpose of this project is to aid new comers to data analytics understand how queries on geospatial data works. Using the Gowalla dataset, it provides an interactive web based map interface that allows users to execute predefined queries in order to better understand the queries and the data set. This addresses the main problem that new comers to data analytics have where they may lack the technical ability to execute queries and interpret the data by offering a user friendly, intuitive experience in the form of this application. 

### Web Application Functions
- There are two main functionalities of this website:
  - Interactive map: A majority of the space on the website is allocated to the interactive map, where users can view the results of their queries.
  - Query sidebar: A sidebar that contains all the predefined queries(with descriptions of each query) where the user can enter inputs and execute the queries.
-Since a majority of the queries depend on the longitude, latitude and check in time of each user, there is a great need for high-dimensional queries in this application

---

## 2. Technology Stack
### Programming Languages & Frameworks
- Backend: Python with FastAPI
- Frontend: Leaflet.js, HTML/CSS/JavaScript, HTMX
- Database: PostgreSQL with PostGIS
### Packages & Dependencies
- All packages can be installed by installing the requirements.txt file
- Third party python libraries include:
  - `psycogp2` : This library is used to establish a connection between the database and the back end.
  - `fastdtw` : This library is used for some of the functionality, particularly for dynamic time warping used in Query 4

---

## 3. Setup Instructions
### Environment Setup
To install the dependencies, run the code below to install the dependencies:
```bash
pip install requirements.txt
```

### Database Configuration
The code needed to set up the database in contained in `psql_queries.txt` file
PostgreSQL should be installed with the PostGIS extention and the [Gowalla dataset](https://snap.stanford.edu/data/loc-gowalla.html) should be downloaded
Once these steps are completed, the following steps should be followed to initialise the database:
- **Step 1**: Create the database and connect to it
```bash
psql
CREATE DATABASE gowbackend;
\c gowbackend
```
- **Step 2**: Create database schema and copy files
```bash
CREATE TABLE gowedges(
    user_id INTEGER,
    friend_id INTEGER
);

CREATE TABLE gowcheckins(
    user_id INTEGER,
    checkin_time TIMESTAMP,
    latitude FLOAT,
    longitude FLOAT,
    location_id INTEGER
);
\COPY gowedges FROM 'path/to/gowalla_edges.txt' DELIMITER E'\t' CSV;
\COPY gowcheckins FROM 'path/to/gowalla_checkins.txt' DELIMITER E'\t' CSV;
```
- **Step 4**: Create indexes on the tables
```bash
CREATE INDEX IF NOT EXISTS idx_gowedges_user_id ON gowedges(user_id);
CREATE INDEX IF NOT EXISTS idx_gowcheckins_user_id ON gowcheckins(user_id);
```
- **Step 4**: Create a user and grant access on the tables
```bash
CREATE USER user WITH PASSWORD "password";
GRANT SELECT ON gowcheckins TO user;
GRANT SELECT ON gowedges TO user;
```
---
## 4. Code Structure
### Frontend
- `templates/index.html`: The only html file used for this project. Contains all the API calls between the front end and back end via HTMX.
- `static/main.js`: All the Javascript functions(mainly for the leaflet functions) are contained in this file.
- `static/style.css`: All the CSS code are contained in this file.

### Backend
- `src/main.py`: This file manages all the response handling from the front end via FastAPI.
- `src/database.py` This file contains all the back end functionality, including the connection to the database, and query execution.

### Database Connection
- `src/config.py`: This is a file that needs to be created when the repository is cloned. This file contains all the database variables for the psql server for the connection. An example of the code is shown below:
```bash
dbhost = "localhost"
dbname = "dbname"
dbuser = "postgres"
dbpassword = "password"
``` 

---
## 5. Queries Implemented
### 1. Get Checkins

### 2. Neaerest Friend

### 3. List Trajectory

### 4. Closest Friend (DTW)

---
## 6. How to Run the Application
- **Step 1**: Change directory to the file:
```bash
cd PATH/TO/4205_prac_2
```
- **Step 2**: Activate environment, example below uses conda:
```bash
conda activate 4205
```
- **Step 3**: Use uvicorn to launch the application:
```bash
uvicorn src.main:app --reload
```
---

## 7. Port Usage

## 8. UI Address
http://127.0.0.1:8000/
## 9. Additional Motes

---
### Note

