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

export async function updateRole(uuid: UUID, params: any) {
    try {
        const role = await AxiosInstances.put(`/roles/${uuid}`, params)
        return Promise.resolve(role)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function deleteRole(uuid: UUID) {
    try {
        const role = await AxiosInstances.delete(`/roles/${uuid}`)
        return Promise.resolve(role)
    } catch (error) {
        return Promise.reject(error)
    }
}