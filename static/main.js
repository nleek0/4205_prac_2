var map = L.map('map').setView([39.828, -100], 4);
var flag = 0;
var rec_coords = {0:false,1:false};
var rec_latlng = {}

var redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

map.on('click', function(e) {
    if (flag < 2){
        const markerbind = L.marker(e.latlng, {icon : redIcon}).addTo(map);
        flag += 1;
        if (!rec_coords[0]){
            rec_coords[0] = true;
            rec_latlng[0] = e.latlng;
            markerbind.on('click', function() {
                map.removeLayer(markerbind);
                flag -= 1;
                rec_coords[0] = false;
                delete rec_latlng[0];
        });
        } else if(!rec_coords[1]){
            rec_coords[1] = true;
            rec_latlng[1] = e.latlng;
            markerbind.on('click', function() {
                map.removeLayer(markerbind);
                flag -= 1;
                rec_coords[1] = false;
                delete rec_latlng[1];
        });
        }
    }
  });

function addmarker(row_tuple){
    const user_id = row_tuple["user_id"];
    const time = row_tuple["time"];
    const latitude = row_tuple["latitude"];
    const longitude = row_tuple["longitude"];
    const location_id = row_tuple["location_id"]


    const popupContent = `
        user_id: ${user_id} <br> 
        ${time} <br> 
        location: ${location_id} <br>
        <button 
            onclick='console.log("hi")'
            hx-get="/nn/${user_id}/${latitude}/${longitude}"  
            hx-trigger="click" 
            hx-swap="none" 
            hx-on:htmx:after-request="handleNN(event)">
            NN
        </button>
    `;

    /*
    L.marker([latitude,longitude]).addTo(map)
    .bindPopup(popupContent);
    */

    const marker = L.marker([latitude, longitude]).addTo(map);
    
    // Create the popup but don't bind it immediately
    const popup = L.popup().setContent(popupContent);
    
    // Add a listener for when the popup opens
    marker.bindPopup(popup);
    
    // Process HTMX elements after popup is opened
    marker.on('popupopen', function() {
        // Process the newly added content with HTMX
        htmx.process(popup.getElement());
    });
}

function handleCheckins(event) {
    const responseText = event.detail.xhr.responseText;
    const checkins = JSON.parse(responseText); // Parse the JSON string into an object/array
    checkin_markers(checkins); // Now pass the data to your main function
}

function checkin_markers(responseData){
    clear_everything();
    for(let row of responseData)
    addmarker(row);
}

function clear_everything(){
    map.eachLayer(function(layer) {
        if (!(layer instanceof L.TileLayer)) {
            map.removeLayer(layer);
        }
    });

    flag = 0;
    rec_coords = {0:false, 1:false}
    rec_latlng = {}
}

function handleNN(event) {
    console.log("NN working")
    const responseText = event.detail.xhr.responseText;
    const checkins = JSON.parse(responseText);
    checkin_markers(checkins);

}

function handleDTW(event){
    console.log("DTW working")
    const responseText = event.detail.xhr.responseText;
    const users = JSON.parse(responseText);
    DTW(users);
}

function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

function DTW(users){
    for(let key in users){
        console.log(key)
        const latlngs = users[key]
        const color = getRandomColor()
        const polyline = L.polyline(latlngs, { color }).addTo(map);
        polyline.bindPopup(`User ID: ${key}`)
    } 
}

function handleTraj(event){
    console.log("handle work")
    const responseText = event.detail.xhr.responseText;
    const data = JSON.parse(responseText)
    const user_id = Object.keys(data)[0];
    const trajectory = data[user_id]
    console.log(user_id)
    get_trajectory(user_id, trajectory)
}

function get_trajectory(user_id,trajectory){
    console.log("func work")
    const color = getRandomColor()
    const polyline = L.polyline(trajectory, { color }).addTo(map);
    polyline.bindPopup(`User ID: ${user_id}`);
}

async function handleRec(){
    //const responseText = event.detail.xhr.responseText;
    //const data = JSON.parse(responseText);
    //checkin_markers(data)

    if (flag === 2){
        const user_id = document.getElementById('myTextbox4').value;
        max_lat = Math.max(rec_latlng[0]["lat"],rec_latlng[1]["lat"]);
        min_lat = Math.min(rec_latlng[0]["lat"],rec_latlng[1]["lat"]);
        max_lon = Math.max(rec_latlng[0]["lng"],rec_latlng[1]["lng"]);
        min_lon = Math.min(rec_latlng[0]["lng"],rec_latlng[1]["lng"]);
        //console.log({"max_lat":max_lat, "min_lat": min_lat, "max_lon": max_lon, "min_lon": min_lon});
        const response = await fetch('/rectangle',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ "user_id": user_id,"max_lat":max_lat, "min_lat": min_lat, "max_lon": max_lon, "min_lon": min_lon})
        });
        
        const data = await response.json();
        //const result = JSON.parse(data);
        
        //onsole.log(data[1]["user_id"])
        //checkin_markers(data);
        marker_cluster(data);
    }
}


function marker_cluster(data){
    clear_everything()
    console.log("cluster work")
    const markers = L.markerClusterGroup()
    data.forEach(point => {
        const marker = L.marker([point["latitude"], point["longitude"]])
            .bindPopup(`user_id: ${point["user_id"]} <br>
                        ${point["time"]} <br>
                        location: ${point["location_id"]}`);
        markers.addLayer(marker);
    });

    map.addLayer(markers);
}
    


//addmarker("hi",20,-0.08);