import AxiosInstances from "./axiosInstance"


export async function findAllOrder() {
    try {
        const withdraw = await AxiosInstances.get('/withdraw')
        return Promise.resolve(withdraw)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function findAllOrderWithDay(date: string) {
    try {
        const withdraw = await AxiosInstances.get(`/withdraw`, {
            params: {
                date
            }
        })
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

export async function createOrderVip(data: any) {
    try {
        const withdraw = await AxiosInstances.post('/withdraw/vip', data)
        return Promise.resolve(withdraw)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function getNewCustomer() {
    try {
        const customer = await AxiosInstances.get('/withdraw/new-id')
        return Promise.resolve(customer)
    } catch (error) {
        return Promise.reject(error)
    }

}

export async function findAllOrderVip() {
    try {
        const withdraw = await AxiosInstances.get('/withdraw/vip')
        return Promise.resolve(withdraw)
    } catch (error) {
        return Promise.reject(error)
    }
}

export const findOrderVipByCarId = async (carId: number) => {
    try {
        const withdraw = await AxiosInstances.get(`/withdraw/vip-order/${carId}`)
        return Promise.resolve(withdraw)
    } catch (error) {
        return Promise.reject(error)
    }
};


export async function removeOrderVip(customer_id: number) {
    try {
        const withdraw = await AxiosInstances.delete(`/withdraw/vip/${customer_id}`)
        return Promise.resolve(withdraw)
    } catch (error) {
        return Promise.reject(error)
    }
}
