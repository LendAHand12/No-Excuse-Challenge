import axios from "axios";

async function getFaceTecData({ userId }) {
    return axios.get(`${process.env.FACETEC_HOST}/api/sessionDetails?externalDatabaseRefID=ID_${userId}&pageNumber=0&pageSize=10&path=/enrollment-3d`);
}

export default getFaceTecData;
