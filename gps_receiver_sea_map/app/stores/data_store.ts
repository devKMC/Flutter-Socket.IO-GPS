import { create } from 'zustand';

interface DataStoreType {
    rawData: string;
    myTime: number;
    myLat: number;
    myLon: number;
    rxLat: number;
    rxLon: number;
    distKim: number; 

    mobileLat: string|null;
    mobileLon: string|null;

    setRawData: (rawData: string) => void; 
    setMyTime: (myTime: number) => void;
    setMyLat: (myLat: number) => void;
    setMyLon: (myLon: number) => void;
    setRxLat: (rxLat: number) => void;
    setRxLon: (rxLon: number) => void;
    setDistKim: (distKim: number) => void; 

    setMobileLat: (mobileLat: string|null) => void;
    setMobileLon: (mobileLon: string|null) => void;
}

const DataStore = create<DataStoreType>()(
    (set) => ({
        rawData: '',
        myTime: 0,
        myLat: 0,
        myLon: 0,
        rxLat: 0,
        rxLon: 0,
        distKim: 0,
        mobileLat: null,
        mobileLon: null,

        setRawData(rawData: string) { 
            set((state) => {
                var splittedRawData = rawData.split(',')
                if (state.mobileLat && splittedRawData[4] === '35.000000') {
                    splittedRawData[4] = state.mobileLat
                }
                if (state.mobileLon && splittedRawData[5] === '129.000000') {
                    splittedRawData[5] = state.mobileLon
                }
                rawData = splittedRawData.join();
                return {rawData: state.rawData + rawData + '\r\n'}
            });
        },
        setMyTime(myTime: number) { set({ myTime: myTime }) },
        setMyLat(myLat: number) { set({ myLat: myLat }) },
        setMyLon(myLon: number) { set({ myLon: myLon }) },
        setRxLat(rxLat: number) { 
            set((state)=>{ 
                if(state.mobileLat && rxLat === 35.000000) {
                    rxLat = parseFloat(state.mobileLat)
                }
                return { rxLat: rxLat }
            }) 
        },
        setRxLon(rxLon: number) { 
            set((state)=>{ 
                if(state.mobileLon && rxLon === 129.000000) {
                    rxLon = parseFloat(state.mobileLon)
                }
                return { rxLon: rxLon }
            }) 
        },
        setDistKim(distKim: number) { set({ distKim: distKim }) },

        setMobileLat(mobileLat: string|null) { set({ mobileLat: mobileLat }) },
        setMobileLon(mobileLon: string|null) { set({ mobileLon: mobileLon }) }
    })
);

export default DataStore;
