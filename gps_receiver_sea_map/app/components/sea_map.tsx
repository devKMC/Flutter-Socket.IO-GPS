'use client';

import { useEffect, useState } from 'react';
import { LayersControl, MapContainer, TileLayer, Circle, CircleMarker, Polyline, Marker, Pane} from "react-leaflet";
import { divIcon } from 'leaflet';

import styles from '../styles/sea_map.module.css';
import DataStore from '../stores/data_store';
import SeaMapHook from '../hooks/sea_map_hook';

function SeaMap() {
    const { BaseLayer } = LayersControl;
    const { myLat, myLon, rxLat, rxLon } = DataStore(); // DateStore에서 좌표 불러옴
    const tiles = {
        'Open SeaMap': "https://t2.openseamap.org/tile/{z}/{x}/{y}.png",
        'Sea Marks': "https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
    }

    const myCoordStyle = {
        coordCircleColor: "#006d77",  // 짙은 청록색 외곽선
        fillColor: "#83c5be",         // 밝은 민트색 채움색
        tenKmCircleColor: "rgba(0, 109, 119, 0.7)",  // 같은 계열의 청록색 (반지름 원)
        radiusLineColor: "#83c5be"    // 밝은 민트색 (반지름 선)
    };
    
    const rxCoordStyle = {
        coordCircleColor: '#4b0082',  // 짙은 보라색 외곽선
        fillColor: "#9f86ff",         // 연보라색 채움색
        tenKmCircleColor: "rgba(75, 0, 130, 0.7)",  // 같은 계열의 보라색 (반지름 원)
        radiusLineColor: "#9f86ff"    // 연보라색 (반지름 선)
    };

    const {
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
    } = SeaMapHook();

    return (
        <div className={styles.mapContainer}>
            <MapContainer
                center={[myLat || 35.2116549, myLon || 129.0257783]}
                zoom={zoom}
                className={styles.fullMap}
            >
                <MoveMapComponent/>
                <LayersControl position="topright">
                <MapEvents />
                <>
                    {Object.entries(tiles).map(([name, url]) => (
                        <BaseLayer checked name={name}>
                            <TileLayer
                                url={url}
                                attribution=""
                            />
                        </BaseLayer>
                    ))} 
                </>
                </LayersControl>

                {myLat && myLon && !isNaN(myLat) && !isNaN(myLon) && (
                    <>
                        {/*----------- 거리 선 -----------*/}
                        {rxLat !== 35.000000 && rxLon !== 129.000000 && (
                        <Polyline
                            positions={[[myLat, myLon], [rxLat, rxLon]]}
                            color="#192880"
                            weight={2}   
                            opacity={1} 
                            dashArray="5,5" 
                        />)}

                        {showMarker && zoom >= 10 && (
                            <Pane name="radiusPane" style={{ zIndex: 500 }}>
                                {/*----------- 큰 원 위치 -----------*/}
                                <Circle
                                    weight={1.3}
                                    center={[myLat, myLon]}
                                    radius={radius}
                                    color={myCoordStyle.tenKmCircleColor}
                                    fillOpacity={0.15}
                                    eventHandlers={{
                                        click: toggleCircleVisibility
                                    }}
                                    pane='radiusPane'
                                />
                                {rxLat !== 35.000000 && rxLon !== 129.000000 && (
                                <Circle
                                    weight={1.3}
                                    center={[rxLat, rxLon]}
                                    radius={radius}
                                    color={rxCoordStyle.tenKmCircleColor}
                                    fillOpacity={0.15}
                                    eventHandlers={{
                                        click: toggleCircleVisibility
                                    }}
                                    pane='radiusPane'
                                />)}
                                {/*----------- 반지름 길이 선 -----------*/}
                                {line1 && line2 && (
                                <>
                                    <Polyline
                                        positions={line1}
                                        color={myCoordStyle.radiusLineColor}
                                        weight={2}
                                        opacity={0.5}
                                        pane='radiusPane'
                                    />
                                    {rxLat !== 35.000000 && rxLon !== 129.000000 && (
                                    <Polyline
                                        positions={line2}
                                        color={rxCoordStyle.radiusLineColor}
                                        weight={2}
                                        opacity={0.5}
                                        pane='radiusPane'
                                    />)}
                                </>)}
                                {/*----------- 거리 TEXT -----------*/}
                                {midPoint1 && midPoint2 && (
                                <>
                                    <Marker
                                        position={midPoint1}
                                        icon={divIcon({
                                            className: 'custom-div-icon',
                                            html: textGenerator(`${radius / 1000}`),
                                            iconSize: [100, 40]
                                        })}
                                    />
                                    {rxLat !== 35.000000 && rxLon !== 129.000000 && (
                                    <>
                                        <Marker
                                            position={midPoint2}
                                            icon={divIcon({
                                                className: 'custom-div-icon',
                                                html: textGenerator(`${radius / 1000}`),
                                                iconSize: [100, 40]
                                            })}
                                        />
                                        <Marker
                                            position={[(myLat + rxLat) / 2, (myLon + rxLon) / 2]}
                                            icon={divIcon({
                                                className: 'custom-div-icon',
                                                html: textGenerator(`${distanceInKm}`),
                                                iconSize: [100, 40]
                                            })}
                                        />
                                    </>)}
                                </>)}
                            </Pane>
                        )}

                        <Pane name="coordPane" style={{ zIndex: 600 }}>
                        {/*----------- 좌표 위치 -----------*/}
                            <CircleMarker
                                weight={1}
                                center={[myLat, myLon]}
                                radius={5}
                                color={myCoordStyle.coordCircleColor}
                                fillColor={myCoordStyle.fillColor}
                                fillOpacity={1}
                                eventHandlers={{
                                    click: toggleCircleVisibility
                                }}
                                pane='coordPane'

                            />
                            {rxLat !== 35.000000 && rxLon !== 129.000000 && (
                            <CircleMarker
                                weight={1}
                                center={[rxLat, rxLon]}
                                radius={5}
                                color={rxCoordStyle.coordCircleColor}
                                fillColor={rxCoordStyle.fillColor}
                                fillOpacity={1}
                                eventHandlers={{
                                    click: toggleCircleVisibility
                                }}
                                pane='coordPane'
                            />)}
                        </Pane>
                    </>
                )}
            </MapContainer>
        </div>
    );
}

export default SeaMap;
