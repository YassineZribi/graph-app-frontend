import { API } from "../axios-config";

const ENDPOINT = '/api/auth'

class UserService {
    login = (data) => {
        return API.post(ENDPOINT + "/login", data)
    }
    register = (data) => {
        return API.post(ENDPOINT + "/register", data)
    }
    getProfile = () => {
        return API.get(ENDPOINT + "/profile")
    }
}

export default new UserService()