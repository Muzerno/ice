import { format } from "date-fns"
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
        const dashboard = await AxiosInstances.get(`/dashboard/money`, {
            params: {
                date_time: format(new Date(date), 'yyyy-MM-dd')
            }
        })
        return Promise.resolve(dashboard.data)
    } catch (error) {
        return Promise.reject(error)
    }
}

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