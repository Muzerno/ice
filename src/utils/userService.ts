import { ICreateUser } from "@/interface/user";
import AxiosInstances from "./axiosInstance";
import { UUID } from "crypto";

export async function findAllUser() {
    try {
        const users = await AxiosInstances.get('/user')
        return Promise.resolve(users.data)
    } catch (error) {
        return Promise.reject(error)
    }

}

export async function createUser(params: ICreateUser) {
    try {
        const user = await AxiosInstances.post('/user', params)
        return Promise.resolve(user)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function updateUser(uuid: UUID, params: any) {
    try {
        const user = await AxiosInstances.put(`/user/${uuid}`, params)
        return Promise.resolve(user)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function deleteUser(uuid: UUID) {
    try {
        const user = await AxiosInstances.delete(`/user/${uuid}`)
        return Promise.resolve(user)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function countUser() {
    try {
        const user = await AxiosInstances.get('/user/count')
        return Promise.resolve(user.data)
    } catch (error) {
        return Promise.reject(error)
    }
}