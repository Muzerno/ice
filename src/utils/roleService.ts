import { UUID } from "crypto"
import AxiosInstances from "./axiosInstance"

export async function createRole(params: any) {
    try {
        const role = await AxiosInstances.post('/roles', params)
        return Promise.resolve(role)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function findAllRole() {
    try {
        const role = await AxiosInstances.get('/roles')
        return Promise.resolve(role)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function updateRole(id: number, params: any) {
    try {
        const role = await AxiosInstances.put(`/roles/${id}`, params)
        return Promise.resolve(role)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function deleteRole(id: number) {
    try {
        const role = await AxiosInstances.delete(`/roles/${id}`)
        return Promise.resolve(role)
    } catch (error) {
        return Promise.reject(error)
    }
}