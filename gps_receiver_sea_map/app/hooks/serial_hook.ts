"use client";

import { useState } from "react";
import OperateStore from "../stores/operate_store";
import DataStore from "../stores/data_store";

interface SerialPort {
  readable: ReadableStream<any>;
  writable: WritableStream<any>;
  open: (options: { baudRate: number }) => Promise<void>;
  close: () => Promise<void>;
}

const SerialHook = () => {
  const [port, setPort] = useState<SerialPort | null>(null); 
  const [reader, setReader] = useState<ReadableStreamDefaultReader<string> | null>(null); 
  const {
    setRawData,
    setMyTime,
    setMyLat,
    setMyLon,
    serialDisconnect,
  } = DataStore();
  const { setOnConnectSerialPort } = OperateStore();
  
  var buffer = '';

  const connectPort = async () => {
    try {
      //@ts-ignore
      const selectedPort: SerialPort = await navigator.serial.requestPort(); 
      await selectedPort.open({ baudRate: 115200 }); 
      setPort(selectedPort);

      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = selectedPort.readable.pipeTo(
        textDecoder.writable
      );
      const readerInstance = textDecoder.readable.getReader();
      setReader(readerInstance)
      setOnConnectSerialPort(true);
      
      while (true) {
        const { value, done } = await readerInstance.read();
        if (done) {
          readerInstance.releaseLock();
          break;
        }

        if (value) {
          buffer += value; 
          while (buffer.includes("\r\n")) {
            const packetEnd = buffer.indexOf("\r\n");
            const packet = buffer.slice(0, packetEnd); 
            buffer = buffer.slice(packetEnd + 2); 
            processPacket(packet); 
          }
        }
      }
      
      await readableStreamClosed;
      setOnConnectSerialPort(false);
      console.log("Readable stream successfully closed");
    } catch (err) {
      console.error("포트 연결 실패 또는 스트림 오류", err);
    }
  };

  const processPacket = (packet: string) => {
    const splitValue = packet.split(',');

    if (splitValue.length >= 7 && splitValue[0] === '3001') {
        const time = parseFloat(splitValue[1]);
        const myLat = parseFloat(splitValue[2]);
        const myLon = parseFloat(splitValue[3]);
        const rxLat = parseFloat(splitValue[4]);
        const rxLon = parseFloat(splitValue[5]);

      if (!isNaN(time) && !isNaN(myLat) && !isNaN(myLon) && !isNaN(rxLat) && !isNaN(rxLon)) {
        setRawData(packet); 
        setMyTime(time);
        setMyLat(myLat);
        setMyLon(myLon);
      } 
    } 
  };

  const disconnectPort = async () => {
    try {
      if (port) { 
        if (reader) {
          await reader.cancel(); 
          reader.releaseLock(); 
          setReader(null)
          while (port.readable.locked) {
            await new Promise(resolve => setTimeout(resolve, 100)); 
          }
        } 
        await port.close(); 
        setPort(null) 
        setOnConnectSerialPort(false); 
        serialDisconnect();
      } else {
        console.log("No port is currently connected");
      }
    } catch (err) {
      console.error("Failed to disconnect the port", err);
    }
  };

  return {
    connectPort,
    disconnectPort,
    port
  };
};

export default SerialHook;
