// GeolocateReport.tsx
import { FC } from 'react';
import styles from '../styles/operate_layer.module.css';
import DataStore from '../stores/data_store';

interface GeolocateReportProps {
    onInputSerialReport: boolean;
}

const GeolocateReport: FC<GeolocateReportProps> = ({ onInputSerialReport }) => {
    const { myTime, myLat, myLon, rxLat, rxLon, rawData, distKim } = DataStore();

    const downloadRawData = () => {
        const data = {
            rawData
        };

        const splitedStrArray = data.rawData.split('\r\n');
        if (splitedStrArray.length > 0) {
            splitedStrArray.pop(); 
        }
        let reassembledStr = '';

        splitedStrArray.forEach((splitedStr) => {
            const [timeStr, ...rest] = splitedStr.split(',');
            const currentRxLat = parseFloat(rest[2]); 
            const currentRxLon = parseFloat(rest[3]); 

            const effectiveDistKim = (currentRxLat === 35.000000 && currentRxLon === 129.000000) ? 0 : distKim;

            const seconds = parseInt(timeStr) % 100;
            const minutes = Math.floor(parseInt(timeStr) / 100) % 100;
            const hours = Math.floor(parseInt(timeStr) / 10000);
            const utcDate = new Date(Date.UTC(0, 0, 0, hours, minutes, seconds));

            const kstOffset = 9 * 60; 
            const kstDate = new Date(utcDate.getTime() + (kstOffset * 60 * 1000));

            const h = String(kstDate.getUTCHours()).padStart(2, '0');
            const m = String(kstDate.getUTCMinutes()).padStart(2, '0');
            const s = String(kstDate.getUTCSeconds()).padStart(2, '0');

            const newStr = `${h} : ${m} : ${s} ${timeStr},${rest[0]},${rest[1]},${rest[2]},${rest[3]},${effectiveDistKim}` + `\r\n`;
            reassembledStr += newStr;
        });

        const blob = new Blob([reassembledStr], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'Data.txt'; 
        a.click();

        URL.revokeObjectURL(url);
    };

    return (
        <div className={styles.operateLayerContainer}>
            <div className={`${styles.container} ${styles.topLeft} ${!onInputSerialReport ? styles.hidden : ''} ${styles.SerialReportBox}`}>
                {myTime !== 0 && (
                    <div className={styles.inforboxContainer}>
                    <div style={{width:'110px',fontWeight:'bold'}}> 합정 세계시 </div>
                    <div className={styles.infoBox}> {myTime}</div>
                    </div>
                )}
                {myLat !== 0 && (
                    <div className={styles.inforboxContainer}>
                    <div style={{width:'110px',fontWeight:'bold'}}> 수신기 위도 </div>
                    <div className={styles.infoBox}> {myLat.toFixed(6)}</div>
                </div>
                )}
                {myLon !== 0 && (
                    <div className={styles.inforboxContainer}>
                        <div style={{width:'110px',fontWeight:'bold'}}> 수신기 경도 </div>
                        <div className={styles.infoBox}> {myLon.toFixed(6)}</div>
                    </div>
                )}
                {rxLat !== 0 && (
                    <div className={styles.inforboxContainer}>
                        <div style={{width:'110px',fontWeight:'bold'}}> 송신기 위도 </div>
                        <div className={styles.infoBox}>{rxLat.toFixed(6)}</div>
                    </div>
                )}
                {rxLon !== 0 && ( 
                    <div className={styles.inforboxContainer}>
                        <div style={{width:'110px',fontWeight:'bold'}}> 송신기 경도 </div>
                        <div className={styles.infoBox}>{rxLon.toFixed(6)}</div>
                    </div>

                )}
                {myLat !== 0 && rxLat !== 0 && (
                    <div className={styles.inforboxContainer}>
                        <div style={{width:'110px',fontWeight:'bold'}}>두 좌표간 거리</div>
                        <div className={styles.infoBox}>{distKim} km</div>
                    </div>
                )}
                
                {myLat !== 0 && rxLat !== 0 && (
                        <button className={styles.downloadButton}  onClick={downloadRawData}>
                            Data Download
                        </button>
                )}
                
            </div>
        </div>
    );
};

export default GeolocateReport;
