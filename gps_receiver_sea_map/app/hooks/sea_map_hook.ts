"use client";

import { useState, useEffect } from "react";
import { useMap } from "react-leaflet";

import DataStore from '../stores/data_store';
import OperateStore from '../stores/operate_store';

const SeaMapHook = () => {
    const { myLat, myLon, rxLat, rxLon } = DataStore(); // DateStore에서 좌표 불러옴
    const { moveDestination, setMoveDestination } = OperateStore();

    const [showCircle, setShowCircle] = useState(true);
    const [showMarker, setShowMarker] = useState(true);
    const [distanceInKm, setDistanceInKm] = useState<string | null>(null)
    const [zoom, setZoom] = useState(11);
    const [line1, setLine1] = useState<[number, number][] | null>(null)
    const [line2, setLine2] = useState<[number, number][] | null>(null)
    const [midPoint1, setMidPoint1] = useState<[number, number] | null>(null)
    const [midPoint2, setMidPoint2] = useState<[number, number] | null>(null)

    const radius = 10000; 

    const textGenerator = (text:string) => {
        return `<div style="font-weight: bold; cursor: pointer; color: black; font-size: 15px; transform: translateY(-5px);">${text} km</div>`
    }

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; 
        const φ1 = (lat1 * Math.PI) / 180; 
        const φ2 = (lat2 * Math.PI) / 180; 
        const Δφ = ((lat2 - lat1) * Math.PI) / 180; 
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return (R * c);
    };

    const MoveMapComponent =() => {
        const map = useMap()
        if (map && moveDestination) {
            map.panTo([moveDestination.lat, moveDestination.lon]);
        }
        return null
    }

    const toggleCircleVisibility = () => {
        setShowCircle(!showCircle);
        setShowMarker(!showMarker);
    };

    const MapEvents = () => {
        const map = useMap();
        useEffect(() => {
            const handleZoomEnd = () => {
                const newZoom = map.getZoom();
                setZoom(newZoom);
            };
            const handleZoomStart = () => {
                setMoveDestination(null)
            }
            const handleClick = () => {
                setMoveDestination(null)
            }

            map.on('zoomend', handleZoomEnd);
            map.on('zoomstart', handleZoomStart);
            map.on('mousedown', handleClick);
            return () => {
                map.off('zoomend', handleZoomEnd);
                map.off('zoomstart', handleZoomStart);
                map.off('mousedown', handleClick);
            };
        }, [map]);

        return null;
    };
    useEffect(()=> {
        const latRight = myLat;
        const lonRight = myLon + (radius / 111220) / Math.cos(myLat * Math.PI / 180);
        setLine1([[myLat, myLon], [latRight, lonRight]]);
    
        const latFixed = rxLat;
        const lonFixed = rxLon + (radius / 111220) / Math.cos(rxLat * Math.PI / 180);
        setLine2([[rxLat, rxLon], [latFixed, lonFixed]]);

        setMidPoint1([
            (myLat + latRight) / 2,
            (myLon + lonRight) / 2,
        ]);
    
        setMidPoint2([
            (rxLat + latFixed) / 2,
            (rxLon + lonFixed) / 2,
        ]);

        const distance = calculateDistance(myLat, myLon, rxLat, rxLon);
        setDistanceInKm((distance / 1000).toFixed(2));
    }, [myLat, myLon, rxLat, rxLon])

    return {
        showMarker,
        zoom,
        distanceInKm,
        radius,
        line1, line2,
        midPoint1, midPoint2,
        textGenerator,
        MoveMapComponent,
        toggleCircleVisibility,
        MapEvents,
    }
}

export default SeaMapHook