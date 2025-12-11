
"use client";

import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete, DirectionsRenderer } from '@react-google-maps/api';
import { FaLocationArrow, FaTimes, FaSearch, FaRoute, FaMapMarkerAlt } from 'react-icons/fa';

const containerStyle = {
    width: '100%',
    height: '80vh',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
};

const PAKISTAN_CENTER = {
    lat: 30.3753,
    lng: 69.3451
};

const libraries = ['places'];

export default function MapComponent() {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries: libraries
    });

    const [map, setMap] = useState(null);
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [distance, setDistance] = useState('');
    const [duration, setDuration] = useState('');
    const [draggableMarkerPos, setDraggableMarkerPos] = useState(PAKISTAN_CENTER);
    const [userLocation, setUserLocation] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);

    const originRef = useRef(null);
    const destinationRef = useRef(null);
    const searchAutocompleteRef = useRef(null);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    const calculateRoute = async () => {
        if (!originRef.current?.value || !destinationRef.current?.value) {
            alert("Please enter both origin and destination.");
            return;
        }


        if (typeof google === 'undefined') return;

        setIsCalculating(true);
        try {

            const directionsService = new google.maps.DirectionsService();
            const results = await directionsService.route({
                origin: originRef.current.value,
                destination: destinationRef.current.value,

                travelMode: google.maps.TravelMode.DRIVING,
            });

            if (results) {
                setDirectionsResponse(results);
                if (results.routes[0] && results.routes[0].legs[0]) {
                    setDistance(results.routes[0].legs[0].distance?.text || 'N/A');
                    setDuration(results.routes[0].legs[0].duration?.text || 'N/A');
                }
            }
        } catch (error) {
            console.error("Error calculating route:", error);

            alert("Could not calculate route. Please check the locations and try again.");
        } finally {
            setIsCalculating(false);
        }
    };

    const clearRoute = () => {
        setDirectionsResponse(null);
        setDistance('');
        setDuration('');
        if (originRef.current) originRef.current.value = '';
        if (destinationRef.current) destinationRef.current.value = '';
        map?.panTo(PAKISTAN_CENTER);
        map?.setZoom(6);
    };

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const pos = { lat: latitude, lng: longitude };
                setUserLocation(pos);
                map?.panTo(pos);
                map?.setZoom(15);
            },
            () => {
                alert("Unable to retrieve your location");
            },
            { enableHighAccuracy: true }
        );
    };

    const useCurrentLocationAsOrigin = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const pos = { lat: latitude, lng: longitude };
                setUserLocation(pos);
                map?.panTo(pos);
                map?.setZoom(15);


                if (originRef.current) {
                    originRef.current.value = `${latitude}, ${longitude}`;
                }
            },
            () => {
                alert("Unable to retrieve your location");
            },
            { enableHighAccuracy: true }
        );
    };

    const onSearchLoad = (autocomplete) => {
        searchAutocompleteRef.current = autocomplete;
    };

    const onSearchPlaceChanged = () => {
        if (searchAutocompleteRef.current) {
            const place = searchAutocompleteRef.current.getPlace();
            if (place.geometry && place.geometry.location) {
                map.panTo(place.geometry.location);
                map.setZoom(14);
            } else {
                console.log("Returned place contains no geometry");
            }
        }
    };

    const onMarkerDragEnd = (e) => {
        setDraggableMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    };

    if (!isLoaded) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', backgroundColor: '#f0f2f5', borderRadius: '15px' }}>
                <div style={{ fontSize: '1.2rem', color: '#666' }}>Loading Google Maps...</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Control Panel */}
            <div style={styles.controlPanel}>
                <h2 style={styles.headerTitle}>Explore Maps</h2>

                {/* Search Section */}
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Search Location</label>
                    <div style={styles.inputWrapper}>
                        <FaSearch style={styles.inputIcon} />
                        <Autocomplete
                            onLoad={onSearchLoad}
                            onPlaceChanged={onSearchPlaceChanged}
                        >
                            <input
                                type='text'
                                placeholder='Find a place...'
                                style={styles.input}
                            />
                        </Autocomplete>
                    </div>
                </div>

                {/* Directions Section */}
                <div style={styles.divider}></div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Directions</label>

                    <div style={styles.directionsInputs}>
                        <div style={styles.inputWrapper}>
                            <FaMapMarkerAlt style={{ ...styles.inputIcon, color: '#EA4335' }} />
                            <Autocomplete>
                                <input type='text' placeholder='Origin' ref={originRef} style={{ ...styles.input, paddingRight: '40px' }} />
                            </Autocomplete>
                            <button
                                onClick={useCurrentLocationAsOrigin}
                                title="Use my current location as origin"
                                style={styles.inputActionBtn}
                            >
                                <FaLocationArrow />
                            </button>
                        </div>

                        <div style={styles.inputWrapper}>
                            <FaMapMarkerAlt style={{ ...styles.inputIcon, color: '#4285F4' }} />
                            <Autocomplete>
                                <input type='text' placeholder='Destination' ref={destinationRef} style={styles.input} />
                            </Autocomplete>
                        </div>
                    </div>

                    <div style={styles.buttonGroup}>
                        <button
                            style={{ ...styles.button, ...styles.primaryButton, opacity: isCalculating ? 0.7 : 1 }}
                            onClick={calculateRoute}
                            disabled={isCalculating}
                        >
                            <FaRoute /> {isCalculating ? 'Calculating...' : 'Get Directions'}
                        </button>
                        <button style={{ ...styles.button, ...styles.secondaryButton }} onClick={clearRoute}>
                            <FaTimes />
                        </button>
                    </div>

                    {/* Stats Display */}
                    {(distance && duration) && (
                        <div style={styles.statsCard}>
                            <div style={styles.statItem}>
                                <span style={styles.statLabel}>Distance</span>
                                <span style={styles.statValue}>{distance}</span>
                            </div>
                            <div style={styles.statItem}>
                                <span style={styles.statLabel}>Duration</span>
                                <span style={styles.statValue}>{duration}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div style={styles.divider}></div>
                <button style={styles.locateButton} onClick={handleLocateMe}>
                    <FaLocationArrow /> Pan to Current Location
                </button>
            </div>

            {/* Map */}
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={PAKISTAN_CENTER}
                zoom={6}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    styles: [
                        {
                            featureType: "poi",
                            elementType: "labels",
                            stylers: [{ visibility: "off" }]
                        }
                    ]
                }}
            >
                <Marker position={PAKISTAN_CENTER} title="Center" />
                <Marker
                    position={draggableMarkerPos}
                    draggable={true}
                    onDragEnd={onMarkerDragEnd}
                />
                {userLocation && (
                    <Marker
                        position={userLocation}
                        icon={{
                            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                        }}
                    />
                )}
                {directionsResponse && (
                    <DirectionsRenderer directions={directionsResponse} />
                )}
            </GoogleMap>
        </div>
    );
}

const styles = {
    container: {
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    controlPanel: {
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    headerTitle: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1a1a1a',
        margin: '0 0 8px 0',
    },
    label: {
        fontSize: '0.85rem',
        fontWeight: '600',
        color: '#666',
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
    },
    directionsInputs: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '12px',
    },
    inputWrapper: {
        position: 'relative',
        width: '100%',
    },
    inputIcon: {
        position: 'absolute',
        top: '50%',
        left: '12px',
        transform: 'translateY(-50%)',
        color: '#999',
        fontSize: '14px',
        zIndex: 1,
    },
    input: {
        width: '100%',
        padding: '12px 12px 12px 36px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        transition: 'all 0.2s ease',
        backgroundColor: '#f8f9fa',
        color: '#333',
    },
    inputActionBtn: {
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        color: '#1a73e8',
        cursor: 'pointer',
        fontSize: '16px',
        padding: '4px',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        height: '1px',
        backgroundColor: '#eee',
        margin: '4px 0',
    },
    buttonGroup: {
        display: 'flex',
        gap: '10px',
    },
    button: {
        padding: '12px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'transform 0.1s ease, box-shadow 0.2s ease',
    },
    primaryButton: {
        flex: 1,
        backgroundColor: '#4285F4',
        color: 'white',
        boxShadow: '0 2px 4px rgba(66, 133, 244, 0.3)',
    },
    secondaryButton: {
        backgroundColor: '#f1f3f4',
        color: '#5f6368',
        width: '40px',
        padding: '0',
    },
    locateButton: {
        backgroundColor: '#E8F0FE',
        color: '#1967D2',
        border: 'none',
        padding: '12px',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
    },
    statsCard: {
        marginTop: '16px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
    },
    statItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: '12px',
        color: '#666',
        marginBottom: '4px',
    },
    statValue: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#333',
    },
};

