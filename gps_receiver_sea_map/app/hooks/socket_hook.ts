'use client';

import { useEffect } from 'react'
import { io } from 'socket.io-client'
import DataStore from '../stores/data_store'

const SocketHook = () => {
    const {setMobileLat, setMobileLon} = DataStore()
    useEffect(() => {
        const socket = io("http://localhost:3000")
        
        socket.on('connect', () => {
            socket.emit('joinWebClient')
        })

        socket.on('getMobileLocate', (data: {latitude:string, longitude:string}) => {
            console.log(data)
            setMobileLat(data.latitude)
            setMobileLon(data.longitude)
        })

        socket.on('removeMobileLocate', () => {
            setMobileLat(null)
            setMobileLon(null)
        })

        return () => {
            socket.disconnect();
        }
    },[])
}

export default SocketHook