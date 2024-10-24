'use client';

import styles from '../styles/operate_layer.module.css';
import { useState, useEffect, useRef } from 'react';
import SerialHook from '../hooks/serial_hook';
import DataStore from '../stores/data_store';
import GeolocateReport from './geolocate_report';
import OperateStore from '../stores/operate_store';
import SocketService from "../hooks/socket_hook"



const OperateLayer = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    
    const { rawData, myLat, myLon, rxLat, rxLon, distKim } = DataStore(); 
    const { onConnectSerialPort, onInputSerialReport, moveDestination,setOnInputSerialReport, setMoveDestination } = OperateStore();
    
    const [showSelectBoxes, setShowSelectBoxes] = useState<boolean>(false);
    const [isAtBottom, setIsAtBottom] = useState<boolean>(true);

    const { connectPort, disconnectPort, port } = SerialHook();
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

    const moveMapTo = (lat: number, lon: number) => {
        setMoveDestination({lat, lon})
    };

    const handleMoveToTransmitter = () => {
        if(rxLat && rxLon) {
            moveMapTo(rxLat, rxLon);
        }
    };

    const handleMoveToReceiver = () => {
        if(myLat && myLon) {
            moveMapTo(myLat, myLon);
        }
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
                onClick={() => setOnInputSerialReport(!onInputSerialReport)}>
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
