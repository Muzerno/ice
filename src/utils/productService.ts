import { UUID } from "crypto"
import AxiosInstances from "./axiosInstance"

export async function findAllProduct() {
    try {
        const product = await AxiosInstances.get('/product')
        return Promise.resolve(product)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function findOneProduct(uuid: UUID) {
    try {
        const product = await AxiosInstances.get(`/product/${uuid}`)
        return Promise.resolve(product)
    } catch (error) {
        return Promise.reject(error)
    }
}


export async function createProduct(params: any) {
    try {
        const product = await AxiosInstances.post('/product', params)
        return Promise.resolve(product)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function updateProduct(uuid: UUID, params: any) {
    try {
        const product = await AxiosInstances.patch(`/product/${uuid}`, params)
        return Promise.resolve(product)
    } catch (error) {
        return Promise.reject(error)
    }
}


export async function deleteProduct(uuid: UUID) {
    try {
        const product = await AxiosInstances.delete(`/product/${uuid}`)
        return Promise.resolve(product)
    } catch (error) {
        return Promise.reject(error)
    }
}


export async function countProduct() {
    try {
        const product = await AxiosInstances.get('/product/count')
        return Promise.resolve(product.data)
    } catch (error) {
        return Promise.reject(error)
    }
}

