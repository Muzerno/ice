import AxiosInstances from "./axiosInstance"


export async function findAllOrder() {
    try {
        const withdraw = await AxiosInstances.get('/withdraw')
        return Promise.resolve(withdraw)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function createOrder(data: any) {
    try {
        const withdraw = await AxiosInstances.post('/withdraw', data)
        return Promise.resolve(withdraw)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function updateOrder(id: number, data: any) {
    try {
        const withdraw = await AxiosInstances.put(`/withdraw/${id}`, data)
        return Promise.resolve(withdraw)
    } catch (error) {
        return Promise.reject(error)
    }
}


export async function deleteOrder(id: number) {
    try {
        const withdraw = await AxiosInstances.delete(`/withdraw/${id}`)
        return Promise.resolve(withdraw)
    } catch (error) {
        return Promise.reject(error)
    }
}
