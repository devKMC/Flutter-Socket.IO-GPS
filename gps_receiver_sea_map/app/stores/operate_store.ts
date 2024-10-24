import { create } from 'zustand';
interface OperateStoreType {
    onConnectSerialPort: boolean;
    onInputSerialReport: boolean;
    moveDestination: {lat: number, lon: number} | null

    setOnConnectSerialPort: (onConnectSerialPort: boolean) => void;
    setOnInputSerialReport: (onInputSerialReport: boolean) => void;
    setMoveDestination: (moveDestination: {lat: number, lon: number} | null) => void
}

const OperateStore = create<OperateStoreType>()(
    (set) => ({
        onConnectSerialPort: false,
        onInputSerialReport: false,
        moveDestination: null,
        setOnConnectSerialPort(onConnectSerialPort: boolean) {set({onConnectSerialPort: onConnectSerialPort})},
        setOnInputSerialReport(onInputSerialReport: boolean) {set({onInputSerialReport: onInputSerialReport})},
        setMoveDestination(moveDestination: {lat: number, lon: number} | null) {set({moveDestination: moveDestination})},
    })
)

export default OperateStore