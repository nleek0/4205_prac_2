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
- How to intialise database: 

---
## 4. Code Structure
### Frontend

### Backend

### Databaes Connection

---
## 5. Queries Implemented

---
## 6. How to Run the Application

---

## 7. Port Usage

## 8. UI Address

## 9. Additional Motes

---
### Note

