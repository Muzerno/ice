import { UUID } from "crypto"
import AxiosInstances from "./axiosInstance"

export async function findAllCar() {
    try {
        const car = await AxiosInstances.get('/transportation/car')
        return Promise.resolve(car.data)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function updateCar(uuid: UUID | null | undefined, params: any) {
    try {
        const car = await AxiosInstances.put(`/transportation/car/${uuid}`, params)
        return Promise.resolve(car)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function deleteCar(uuid: UUID) {
    try {
        const car = await AxiosInstances.delete(`/transportation/car/${uuid}`)
        return Promise.resolve(car)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function createCar(params: any) {
    try {
        const car = await AxiosInstances.post('/transportation/car', params)
        return Promise.resolve(car)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function createTransportationLine(params: any) {
    try {
        const transportationLine = await AxiosInstances.post('/transportation', params)
        return Promise.resolve(transportationLine)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function findAllTransportationLine() {
    try {
        const transportationLine = await AxiosInstances.get('/transportation')
        return Promise.resolve(transportationLine.data)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function updateTransportationLine(uuid: UUID, params: any) {
    try {
        const transportationLine = await AxiosInstances.put(`/transportation/${uuid}`, params)
        return Promise.resolve(transportationLine)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function deleteTransportationLine(uuid: UUID) {
    try {
        const transportationLine = await AxiosInstances.delete(`/transportation/${uuid}`)
        return Promise.resolve(transportationLine)
    } catch (error) {
        return Promise.reject(error)
    }
}