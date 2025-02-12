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

export async function findAllProductDrowdown() {
    try {
        const product = await AxiosInstances.get('/product/drowdown')
        return Promise.resolve(product)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function findOneProduct(id: number) {
    try {
        const product = await AxiosInstances.get(`/product/${id}`)
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

export async function updateProduct(id: number, params: any) {
    try {
        const product = await AxiosInstances.patch(`/product/${id}`, params)
        return Promise.resolve(product)
    } catch (error) {
        return Promise.reject(error)
    }
}


export async function deleteProduct(id: number) {
    try {
        const product = await AxiosInstances.delete(`/product/${id}`)
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

export async function StockInCar(car_id: number) {
    try {
        const product = await AxiosInstances.get(`/product/stock/${car_id}`)
        return Promise.resolve(product.data)
    } catch (error) {
        return Promise.reject(error)
    }

}

