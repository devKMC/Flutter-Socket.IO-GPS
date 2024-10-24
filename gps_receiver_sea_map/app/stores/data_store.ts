import { create } from 'zustand';

interface DataStoreType {
    rawData: string;
    myTime: number | null;
    myLat: number | null;
    myLon: number | null;
    rxLat: number | null;
    rxLon: number | null;
    distKim: number | null;
    mobileLat: string|null;
    mobileLon: string|null;

    setRawData: (rawData: string) => void; 
    setMyTime: (myTime: number | null) => void;
    setMyLat: (myLat: number | null) => void;
    setMyLon: (myLon: number | null) => void;
    setMobileLat: (mobileLat: string|null) => void;
    setMobileLon: (mobileLon: string|null) => void;
    serialDisconnect: () => void
}

const DataStore = create<DataStoreType>()(
    (set) => ({
        rawData: '',
        myTime: null,
        myLat: null,
        myLon: null,
        rxLat: null,
        rxLon: null,
        distKim: null,
        mobileLat: null,
        mobileLon: null,

        setRawData(rawData: string) { 
            set((state) => {
                var splittedRawData = rawData.split(',')
                const rxDisconnect = splittedRawData[4] === '35.000000' && splittedRawData[5] === '129.000000'
                var rxLat: number | null = parseFloat(splittedRawData[4]);
                var rxLon: number | null = parseFloat(splittedRawData[5]);
                var distKim: number | null = parseFloat(splittedRawData[6]);
                if (rxDisconnect){
                    rxLat = null;
                    rxLon = null;
                    distKim = null;
                    if (state.mobileLat && state.mobileLon) {
                        splittedRawData[4] = state.mobileLat
                        splittedRawData[5] = state.mobileLon
                        const distance = calculateDistance(splittedRawData);
                        splittedRawData[6] = (distance / 1000).toFixed(6);

                        rxLat = parseFloat(splittedRawData[4])
                        rxLon = parseFloat(splittedRawData[5])
                        distKim = parseFloat(splittedRawData[6])
                    }
                }
                rawData = splittedRawData.join();
                return {
                    rawData: state.rawData + rawData + '\r\n', 
                    distKim,
                    rxLat,
                    rxLon,
                }
            });
        },

        setMyTime(myTime: number | null) { set({ myTime: myTime }) },
        setMyLat(myLat: number | null) { set({ myLat: myLat }) },
        setMyLon(myLon: number | null) { set({ myLon: myLon }) },
        setMobileLat(mobileLat: string|null) { set({ mobileLat: mobileLat }) },
        setMobileLon(mobileLon: string|null) { set({ mobileLon: mobileLon }) },
        serialDisconnect() {set({ 
            rawData: '',
            myTime: null,
            myLat: null,
            myLon: null,
            rxLat: null,
            rxLon: null,
            distKim: null,
        })},
    })
);

const calculateDistance = (data: string[]) => {
    const lat1 = parseFloat(data[2]);
    const lon1 = parseFloat(data[3]);
    const lat2 = parseFloat(data[4]);
    const lon2 = parseFloat(data[5]);
    const R = 6371e3; 
    const φ1 = (lat1 * Math.PI) / 180; 
    const φ2 = (lat2 * Math.PI) / 180; 
    const Δφ = ((lat2 - lat1) * Math.PI) / 180; 
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c);
};

export default DataStore;
