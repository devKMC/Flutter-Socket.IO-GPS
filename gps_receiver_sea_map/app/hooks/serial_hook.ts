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

// Serial 함수 컴포넌트
const SerialHook = () => {
  const [port, setPort] = useState<SerialPort | null>(null); // 포트 상태를 타입으로 명시
  const [reader, setReader] = useState<ReadableStreamDefaultReader<string> | null>(null); // 포트 상태를 타입으로 명시
  const {
    setRawData,
    setMyTime,
    setMyLat,
    setMyLon,
    setRxLat,
    setRxLon,
    setDistKim 
  } = DataStore();
  const { setOnConnectSerialPort } = OperateStore();
  
  var buffer = '';

  const connectPort = async () => {
    try {
      //@ts-ignore
      const selectedPort: SerialPort = await navigator.serial.requestPort(); // 포트 요청
      await selectedPort.open({ baudRate: 115200 }); // 포트 열기
      setPort(selectedPort);

      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = selectedPort.readable.pipeTo(
        textDecoder.writable
      );
      const readerInstance = textDecoder.readable.getReader();
      setReader(readerInstance)
      setOnConnectSerialPort(true);
      // 데이터를 읽는 루프
      while (true) {
        const { value, done } = await readerInstance.read();
        if (done) {
          readerInstance.releaseLock();
          break;
        }

        if (value) {
          buffer += value; // 데이터를 버퍼에 누적
          while (buffer.includes("\r\n")) {
            const packetEnd = buffer.indexOf("\r\n");
            const packet = buffer.slice(0, packetEnd); // \r\n 이전까지의 패킷 추출
            buffer = buffer.slice(packetEnd + 2); // 처리한 패킷을 버퍼에서 제거
            processPacket(packet); // 패킷 처리 함수 호출
          }
        }
      }
      // 스트림이 닫힌 후 처리
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
        const distance = parseFloat(splitValue[6]);



          if (rxLat === 35.000000 && rxLon === 129.000000) { 
              setDistKim(0); 
          } else if (!isNaN(distance)) {
              setDistKim(distance);
          }
      

      if (!isNaN(time) && !isNaN(myLat) && !isNaN(myLon) && !isNaN(rxLat) && !isNaN(rxLon)) {
        setRawData(packet); 
        setMyTime(time);
        setMyLat(myLat);
        setMyLon(myLon);
        setRxLat(rxLat);
        setRxLon(rxLon);

      } 
    } 
  };

  const disconnectPort = async () => {
    try {
      if (port) { // 포트가 연결된 경우에만 수행
        if (reader) {
          await reader.cancel(); // 먼저 리더를 취소하여 스트림 해제
          reader.releaseLock(); // 락 해제
          setReader(null)
          while (port.readable.locked) {
            await new Promise(resolve => setTimeout(resolve, 100)); // 잠시 대기 후 다시 확인
          }
        } // 먼저 리더 락 해제
        await port.close(); // 포트 닫기
        setPort(null) // 포트 상태 초기화
        setOnConnectSerialPort(false); // 연결 상태 false로 설정
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
