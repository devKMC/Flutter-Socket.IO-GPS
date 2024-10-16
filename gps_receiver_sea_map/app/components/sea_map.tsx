'use client';

import { LayersControl, MapContainer, TileLayer } from "react-leaflet";
import styles from '../styles/sea_map.module.css';

function SeaMap() {
  const { BaseLayer, Overlay } = LayersControl;

  return (
    <div className={styles.mapContainer}> 
      <MapContainer
        center={[35.2116549, 129.0257783]}
        zoom={11}
        className={styles.fullMap}  
      >
        <LayersControl position="topright">
          {/* 기본 지도 레이어 */}
          <BaseLayer checked name="openseamap">
            <TileLayer
              url="https://t2.openseamap.org/tile/{z}/{x}/{y}.png"
              attribution=""
            />
          </BaseLayer>

          {/* 항공 사진 레이어 */}

          {/* OpenSeaMap 해상 표식 */}
          <Overlay checked name="Sea Marks">
            <TileLayer
              url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors'
            />
          </Overlay>

          {/* 오버레이로 표시할 레이어 추가 */}
          <Overlay name="Coordinate Grid">
            <TileLayer
              url="https://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://maps.stamen.com/">Stamen</a> contributors'
            />
          </Overlay>
        </LayersControl>
      </MapContainer>
    </div>
  );
}

export default SeaMap;
