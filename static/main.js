var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


L.marker([51.5, -0.09]).addTo(map)
    .bindPopup('A pretty CSS popup.<br> Easily customizable.')
    .openPopup();


function addmarker(row_tuple){
    console.log("yello");
    var user_id = row_tuple["user_id"];
    var latitude = row_tuple["latitude"];
    var longitude = row_tuple["longitude"];
    L.marker([longitude, latitude]).addTo(map)
    .bindPopup(`user_id: ${user_id}`);
}

function handleCheckins(event) {
    console.log("Hello");
    const responseText = event.detail.xhr.responseText;
    const checkins = JSON.parse(responseText); // Parse the JSON string into an object/array
    checkin_markers(checkins); // Now pass the data to your main function
}

function checkin_markers(responseData){
    console.log(responseData[0]);
    addmarker(responseData[0]);
}

//addmarker("hi",20,-0.08);