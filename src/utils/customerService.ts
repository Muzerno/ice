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

export async function getNewCustomer() {
    try {
        const customer = await AxiosInstances.get('/customer/new-id')
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

export async function deleteCustomer(customer_id: number) {
    try {
        const customer = await AxiosInstances.delete(`/customer/${customer_id}`)
        return Promise.resolve(customer)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function findOneCustomer(id: number) {
    try {
        const customer = await AxiosInstances.get(`/customer/${id}`)
        return Promise.resolve(customer)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function updateCustomer(customer_id?: number | null | undefined, params?: any) {
    try {
        const customer = await AxiosInstances.patch(`/customer/${customer_id}`, params)
        return Promise.resolve(customer)
    } catch (error) {
        return Promise.reject(error)
    }
}