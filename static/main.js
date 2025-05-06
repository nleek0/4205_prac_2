var map = L.map('map').setView([39.828, -100], 4);


L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


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
//addmarker("hi",20,-0.08);