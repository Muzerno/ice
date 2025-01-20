import axios from "axios";

export async function getTrueLocation(lat: number, long: number) {
    try {
        const response = await axios.get('https://api.longdo.com/map/services/address', {
            params: {
                lon: long,
                lat: lat,
                noelevation: 1,
                key: "2ba9a608e02eda6c9ec146d9f2e97fdc"  // Replace with your actual API key
            }
        });
        return response.data
    } catch (error) {
        console.error('Error fetching address:', error);
        return Promise.reject(error);
    }
}