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

export async function updateCar(id: number | null | undefined, params: any) {
    try {
        const car = await AxiosInstances.put(`/transportation/car/${id}`, params)
        return Promise.resolve(car)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function deleteCar(id: number) {
    try {
        const car = await AxiosInstances.delete(`/transportation/car/${id}`)
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

export async function addCustomersToLine(params: any) {
    try {
      const res = await AxiosInstances.post('/transportation/line/add-customers', params);
      return Promise.resolve({
        status: res.status,
        data: res.data,
      });
    } catch (error: any) {
      return Promise.reject(error?.response ?? error);
    }
  }
  
  

export async function updateTransportationLine(id: number, params: any) {
    try {
        const transportationLine = await AxiosInstances.put(`/transportation/${id}`, params)
        return Promise.resolve(transportationLine)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function deleteTransportationLineWithIds(id: number[]) {
    try {
        const transportationLine = await AxiosInstances.patch(`/transportation/delete`, {
            ids: id
        })
        return Promise.resolve(transportationLine)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function deleteTransportationLine(id: number) {
    try {
        const transportationLine = await AxiosInstances.delete(`/transportation/${id}`)
        return Promise.resolve(transportationLine)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function getDeliveryByCarId(carId: number, date: string) {
    try {
        const delivery = await AxiosInstances.get(`/transportation/line/byCar/${carId}`, { params: { date } })
        return Promise.resolve(delivery.data)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function updateDeliveryStatus(id: number, body: any) {
    try {
        const delivery = await AxiosInstances.patch(`/transportation/update/DeliveryStatus/${id}`, body)
        return Promise.resolve(delivery)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function updateLocation(id: number, params: any) {
    try {
        const delivery = await AxiosInstances.patch(`/transportation/update/location/${id}`, params)
        return Promise.resolve(delivery)
    } catch (error) {
        return Promise.reject(error)
    }
}