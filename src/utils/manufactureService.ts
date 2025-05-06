import { format } from "date-fns"
import AxiosInstances from "./axiosInstance"

export async function createManufacture(params: any) {
    try {
        const manufacture = await AxiosInstances.post('/manufacture', params)
        return Promise.resolve(manufacture)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function findAllManufacture(date: any) {
    try {
        const manufactures = await AxiosInstances.get('/manufacture', {
            params: {
                date: format(date, 'yyyy-MM-dd')
            }
        })
        return Promise.resolve(manufactures)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function deleteManufacture(id: number) {
    try {
        const response = await AxiosInstances.delete(`/manufacture/${id}`);
        return Promise.resolve(response);
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function updateManufacture(params: any) {
    try {
      const manufacture = await AxiosInstances.put('/manufacture', params);
      return Promise.resolve(manufacture);
    } catch (error) {
      return Promise.reject(error);
    }
  }
  

export async function findOneManufacture(id: number) {
    try {
        const manufacture = await AxiosInstances.get(`/manufacture/${id}`);
        return Promise.resolve(manufacture);
    } catch (error) {
        return Promise.reject(error);
    }
}
