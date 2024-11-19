import AxiosInstances from "./axiosInstance"

export async function login(params: any) {
    try {
        const token = await AxiosInstances.post('/auth/login', params)
        return Promise.resolve(token)
    } catch (error) {
        return Promise.reject(error)
    }
}