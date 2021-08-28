// TO MAKE THE MAP APPEAR YOU MUST
// ADD YOUR ACCESS TOKEN FROM
// https://account.mapbox.com
mapboxgl.accessToken = MAPBOXTOKEN;
const campground = campgroundJSON
const campgrounds = { features: campground }
console.log(campgrounds)
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v11', // style URL
  center: campground.geometry.coordinates, // starting position [lng, lat]
  zoom: 9 // starting zoom
})

// Create a default Marker and add it to the map.
const marker1 = new mapboxgl.Marker()
  .setLngLat(campground.geometry.coordinates)
  .addTo(map)