'use client';

import styles from '../styles/operate_layer.module.css';
import { useState, useEffect, useRef } from 'react';
import SerialHook from '../hooks/serial_hook';
import DataStore from '../stores/data_store';
import GeolocateReport from './geolocate_report';
import OperateStore from '../stores/operate_store';
import SocketService from "../hooks/socket_hook"



const OperateLayer = () => {
    const { connectPort, disconnectPort, port } = SerialHook();
    const containerRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
    const { rawData, myLat, myLon, rxLat, rxLon, distKim } = DataStore(); 
    const { onConnectSerialPort, onInputSerialReport, moveDestination,setOnInputSerialReport, setMoveDestination } = OperateStore();
    
    const [showSelectBoxes, setShowSelectBoxes] = useState<boolean>(false);
    SocketService()
    const handleScroll = () => {
        if (containerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
            setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 5);
        }
    };

    useEffect(() => {
        if (isAtBottom && containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [rawData, isAtBottom]);

    const handleConnect = () => {
        if (!port) {
            connectPort().catch((error) => {
                console.error("Serial connection failed", error);
            });
        }
    };

    const handleInputSerialReport = (isReportEnabled: boolean) => {
        setOnInputSerialReport(!onInputSerialReport); 
        if (!isReportEnabled) { 
            const dataArray = rawData.split(',');
            dataArray.forEach(data => {
                const [key, value] = data.split(':');
                if (key === 'lat') {
                    DataStore.getState().setMyLat(parseFloat(value)); 
                } else if (key === 'myTime') {
                    DataStore.getState().setMyTime(parseInt(value)); 
                } else if (key === 'lng') {
                    DataStore.getState().setMyLon(parseFloat(value)); 
                } else if (key === 'rxLat') {
                    DataStore.getState().setRxLat(parseFloat(value));
                } else if (key === 'rxLon') { 
                    DataStore.getState().setRxLon(parseFloat(value));
                } else if (key === 'distKim') {
                    DataStore.getState().setDistKim(parseFloat(value));
                }
            });
        }
    };

    const moveMapTo = (lat: number, lon: number) => {
        setMoveDestination({lat, lon})
    };

    const handleMoveToReceiver = () => {
        if(rxLat === 35.000000 && rxLon === 129.00000) {
            return;
        }
        moveMapTo(rxLat, rxLon);
    };

    const handleMoveToTransmitter = () => {
        moveMapTo(myLat, myLon);
    };

    const toggleSelectBoxes = () => {
        setShowSelectBoxes(prevState => !prevState);
    };
    
    return (
        <div className={styles.operateLayerContainer}>
            <button 
                className={`${styles.button} ${styles.buttonTopLeft} ${onConnectSerialPort && styles.onButton}`} 
                onClick={onConnectSerialPort ? disconnectPort : handleConnect}>
                Module Connect
            </button>
            <button 
                className={`${styles.button} ${styles.buttonTopLeft} ${onInputSerialReport && styles.onButton}`} 
                onClick={() => handleInputSerialReport(!onInputSerialReport)}>
                Input Serial Report
            </button>
            <button 
                className={`${styles.button} ${styles.buttonTopLeft} ${moveDestination && styles.onButton}`} 
                onClick={toggleSelectBoxes}>
                GPS Move Location
            </button>

            {showSelectBoxes && (
                <div className={styles.selectContainer}>
                    <button 
                        onClick={handleMoveToReceiver} 
                        className={styles.selectBox}
                    >
                        Move to Receiver
                    </button>
                    <button 
                        onClick={handleMoveToTransmitter} 
                        className={styles.selectBox}
                    >
                        Move to Transmitter
                    </button>
                </div>
            )}

            <GeolocateReport onInputSerialReport={onInputSerialReport} />

            <div className={`${styles.container} ${styles.bottomRight}`} ref={containerRef} onScroll={handleScroll}>
                <div className={styles.textLog} id="textLog">
                    {rawData}
                </div>
            </div>
        </div>
    );
};

export default OperateLayer;
