import AxiosInstances from "./axiosInstance"


export async function findAllDashboard() {
    try {
        const dashboard = await AxiosInstances.get('/dashboard')
        return Promise.resolve(dashboard.data)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function moneyPage() {
    try {
        const dashboard = await AxiosInstances.get('/dashboard/money')
        return Promise.resolve(dashboard.data)
    } catch (error) {
        return Promise.reject(error)
    }
}