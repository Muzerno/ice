
import AxiosInstances from "./axiosInstance"


export async function findAllDashboard() {
    try {
        const dashboard = await AxiosInstances.get('/dashboard')
        return Promise.resolve(dashboard.data)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function moneyPage(date: string) {
    try {
        // ตอนนี้ date ถูกส่งมาถูก format แล้ว (YYYY-MM-DD)
        const dashboard = await AxiosInstances.get(`/dashboard/money`, {
            params: {
                date_time: date,
            },
        });
        return Promise.resolve(dashboard.data);
    } catch (error) {
        return Promise.reject(error);
    }
}

export const updateMoneyStatus = async (money_id: number, status: string) => {
    try {
        const response = await AxiosInstances.patch(`/dashboard/money/status/${money_id}`, {
            status,
        });
        return response.data;
    } catch (err) {
        console.error("Error updating money status:", err);
        throw err;
    }
};

export async function updateLocaltion(car_id: number, body: { latitude: number, longitude: number }) {
    try {
        const car = await AxiosInstances.patch(`/dashboard/location/${car_id}`, body)
        return Promise.resolve(car)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function getLocationCar() {
    try {
        const car = await AxiosInstances.get(`/dashboard/car/location`)
        return Promise.resolve(car.data)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function getExportData(dateFrom: string, dateTo: string, type: string, line: string | null) {
    try {
        const exportData = await AxiosInstances.patch(`/dashboard/export`, {
            type: type,
            date_from: dateFrom,
            date_to: dateTo,
            line: line,
        })
        return Promise.resolve(exportData.data)
    } catch (error) {
        return Promise.reject(error)
    }
}