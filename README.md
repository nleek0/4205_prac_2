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
- This query takes a user's id as an input and shows all the check ins on the map. This query helps to visualise the distribution of the different users.
- SQL code is shown below:
```sql
SELECT * FROM gowcheckins
WHERE user_id = user
```
- Inputs:
  - `user`: This is the user_id
- If the given user_id is empty or out of bounds, the query simply returns 0 rows and nothing will be displayed on the map
### 2. Neaerest Friend
- This query takes a user's id, longitude, and latitude as the input and shows the nearest check ins on the map based on distance. This query can help highlight patterns of social proximity or regular locations. 
- SQL code is shown below:
```sql
SELECT *
FROM (
SELECT DISTINCT ON (ch.user_id) ch.*,
ST_SetSRID(ST_MakePoint(lat, lon), 4326) <-> ST_SetSRID(ST_MakePoint(ch.latitude, ch.longitude), 4326) AS dist
FROM gowedges e
JOIN gowcheckins ch ON ch.user_id = e.friend_id
WHERE e.user_id = user
ORDER BY ch.user_id, dist
) sub
ORDER BY dist
LIMIT 10;
```
- Inputs:
  - `user`: This is the given user
  - `lat`: This is the latitude of the checkin
  - `lon`: This is the longitude of the checkin
- The inputs for this function are unique to each checkin marker on the map, therefore no missing/out of bound inputs can be entered.

### 3. List Trajectory
- This query takes a user_id as the input and shows a path that the user has taken. This query helps visualise the path taken by users
- SQL query below:
```sql
SELECT latitude, longitude
FROM gowcheckins
WHERE user_id = user
ORDER BY checkin_time;
```
- Inputs:
  - `user`: This is the given user_id
- The query will not run if the given user is not an integer, and if the user_id is out of bound the query will not return any rows

### 4. Closest Friend (DTW)
- This query takes a user_id as the input and shows the 100 nearest user paths. This query can help visualise different moving behaviours and to identify trends such as coordinated activites.
- SQL queries below:
```sql
SELECT latitude, longitude
FROM gowcheckins ch
WHERE user_id = user
ORDER BY checkin_time;
```
```sql
SELECT ch.user_id, ch.latitude, ch.longitude
FROM gowcheckins ch
JOIN gowedges e ON ch.user_id = e.friend_id
WHERE e.user_id = user
ORDER BY ch.user_id, ch.checkin_time;
```
- Python code shown below with fastDTW implementation:
```python
def get_dtw(self,user_id):
    friend_checkins = self.__dtw_friend_checkin(user_id)
    coords_list = {}
    for row in friend_checkins:
        user = row[0]
        latitude = row[1]
        longitude = row[2]
        if user in coords_list:
            coords_list[user].append((latitude,longitude))
        else:
            coords_list[user] = [(latitude,longitude)]

    user_checkins = list(self.__dtw_self_checkin(user_id))

    dtw_list = {}
    for key in coords_list:
        dtw_list[key] = fastdtw(user_checkins,coords_list[key],dist = self.__coord_distance)[0]

    closest_friend = sorted(dtw_list, key=lambda k: dtw_list[k])[:10]

    closest_friend_dict = {key:coords_list[key] for key in closest_friend if key in coords_list}
    return closest_friend_dict
```
- Inputs:
  - `user`: This is the given user_id
- The query will not run if the given user is not an integer, and if the user_id is out of bound the query will not return any rows

### 5. Friends in a Rectangle
- This query takes a user_id and a bounding rectangle as an input, and returns all the check ins of the user_id's friend within the bounding rectangle. The purpose of this query is to aid with identifying trends, such as localised friend groups or coordinate activities among users.
- SQL query below:
```sql
SELECT ch.*
FROM gowcheckins ch
JOIN gowedges e ON ch.user_id = e.friend_id
WHERE e.user_id = user
AND ch.latitude >= min_lat AND ch.latitude <= max_lat
AND ch.longitude >= min_lon AND ch.longitude <= max_lon;
```
- Inputs:
  - `user`: This is the user_id
  - `bounding box`: The bounding box is set by setting 2 markers on the map, which provides the domain and range for the latitude and longitude

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
Back End: 8000
Server: 5432

## 8. UI Address
http://127.0.0.1:8000/
## 9. Additional Notes
- I'd like to acknowledge the use of AI tools, such as ChatGPT, for the assistance in development of the front end and the integreation between the front end and back end components. 
---
### Note

