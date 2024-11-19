import AxiosInstances from "./axiosInstance";
import { UUID } from "crypto";

export async function createCustomer(params: any) {
    try {
        const customer = await AxiosInstances.post('/customer', params)
        return Promise.resolve(customer)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function findAllCustomer() {
    try {
        const customers = await AxiosInstances.get('/customer')
        return Promise.resolve(customers.data)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function deleteCustomer(uuid: UUID) {
    try {
        const customer = await AxiosInstances.delete(`/customer/${uuid}`)
        return Promise.resolve(customer)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function findOneCustomer(uuid: UUID) {
    try {
        const customer = await AxiosInstances.get(`/customer/${uuid}`)
        return Promise.resolve(customer)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function updateCustomer(uuid: UUID, params: any) {
    try {
        const customer = await AxiosInstances.put(`/customer/${uuid}`, params)
        return Promise.resolve(customer)
    } catch (error) {
        return Promise.reject(error)
    }
}