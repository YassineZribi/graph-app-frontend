import { API } from "../axios-config";

const ENDPOINT = '/api/dijekstra'

class DijekstraService {
    calculateShortestPath = (data) => {
        return API.post(ENDPOINT, data)
    }
}

export default new DijekstraService()