import React, { useEffect, useRef, useState } from 'react'
import './Map.css'

import mapboxgl from 'mapbox-gl/dist/mapbox-gl-csp';
// eslint-disable-next-line import/no-webpack-loader-syntax
import MapboxWorker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker';

import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
// import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';

mapboxgl.workerClass = MapboxWorker;
mapboxgl.accessToken = 'pk.eyJ1Ijoic2Fmd2FuLWJhcmRvbGlhIiwiYSI6ImNrb2IwaXI5MzAzYnkydm4xZWg4eDFkbmoifQ.2JbbEHLeVd5Y1BcuVHAyyQ';

// todos
// 1.when you search place using geocode
// 		1.1.then remove existing marker/hide
// 		1.2.add new markker on new lat & lng  					++++++++
// 		1.3.add dragable functionality on that marker		++++++++

function Map() {

    const mapContainer = useRef();
    const [lng, setLng] = useState(-70.9);
    const [lat, setLat] = useState(42.35);
    const [zoom, setZoom] = useState(9);

		// update when we get new users location (using gps)
		const [renderMap, setRenderMap] = useState(false);	
    
    useEffect(()=>{

			// get user's location
			window.navigator.geolocation.getCurrentPosition(
					(position) => (
							console.log(position.coords),
							setLat(position.coords.latitude.toFixed(4)),
							setLng(position.coords.longitude.toFixed(4)),
							
							// without this center is not updated
							setRenderMap(true)
					),
					(err) => (
							console.log("error in getting location")
					)
			)


			// initialize the map
			const map = new mapboxgl.Map({
				container: mapContainer.current,
				style: 'mapbox://styles/mapbox/streets-v11',
				center: [lng, lat],
				zoom: zoom
			});
			
			// add marker for default location 
			const marker = new mapboxgl.Marker({
				draggable: true
			})
			.setLngLat([lng,lat])
			.addTo(map);
			
			// add draggable functionality
			marker.on('drag',()=>{
				const coordinates = marker.getLngLat();
				// updating co-ordinates on dragging
				setLat(coordinates.lat.toFixed(4));
				setLng(coordinates.lng.toFixed(4));
			})


			// *******************************************************
			
			// to search places in map
			// map.addControl(
			// 	new MapboxGeocoder({
			// 		accessToken: mapboxgl.accessToken,
			// 		mapboxgl: mapboxgl,
			// 		// not to display new marker
			// 		marker: false
			// 	}),
			// 	'top-left'
			// )

			
			// to search places in map (after search center will be resultant lat & lng )
			const geocoder = new MapboxGeocoder({
				accessToken: mapboxgl.accessToken,
				mapboxgl: mapboxgl,
				// not to display new marker
				marker: false
			});

			map.addControl(geocoder,'top-left')

			geocoder.on('result',(e)=>{
				console.log(e.result);

				// update lat & lng
				setLng(e.result.center[0]);
				setLat(e.result.center[1]);

				// remove the old marker
				marker.remove();
				
				// re-add the new marker
				const marker1 = new mapboxgl.Marker({
					draggable: true
				})
				.setLngLat(e.result.center)
				.addTo(map);	

				marker1.on('drag',()=>{
					const coordinates = marker1.getLngLat();
					// updating co-ordinates on dragging
					setLat(coordinates.lat.toFixed(4));
					setLng(coordinates.lng.toFixed(4));
				})
	
			})
			
			// *******************************************************
			

			// for direction from source to destination
			// map.addControl(
			// 	new MapboxDirections({
			// 		accessToken: mapboxgl.accessToken
			// 	}),
			// 	'top-left'
			// )

			
			
			// get the lat & lng every time any movement in map happen (like search)
			// map.on('move',()=>{
			// 		setLat(map.getCenter().lat.toFixed(4));
			// 		setLng(map.getCenter().lng.toFixed(4));
			// 		setZoom(map.getZoom().toFixed(2));
			// })

			// unmounting
			return () => map.remove();
    },[renderMap])

    return (
      <div className="map"> 
					<div className="sidebar">
						Latitude: {lat} | Longitude: {lng} | Zoom: {zoom}
					</div>
					<div className="map-container" ref={mapContainer} />  
			</div>	
    )
}

export default Map
						