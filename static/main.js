var map = L.map('map').setView([39.828, -100], 4);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


function addmarker(row_tuple){
    const user_id = row_tuple["user_id"];
    const latitude = row_tuple["latitude"];
    const longitude = row_tuple["longitude"];
    L.marker([latitude,longitude]).addTo(map)
    .bindPopup(`user_id: ${user_id}`);
}

function handleCheckins(event) {
    console.log("Hello");
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

//addmarker("hi",20,-0.08);