import { API } from "../axios-config";

const ENDPOINT = '/api/graph'

class GraphService {
    saveGraph = (graph) => {
        return API.post(ENDPOINT, graph)
    }
    deleteGraph = () => {
        return API.delete(ENDPOINT)
    }
    loadGraph = () => {
        return API.get(ENDPOINT)
    }
}

export default new GraphService()