import API from "./API";
import { URL_API_PERMISSIONS } from "./URL";

const Permission = {
  getAllPermissions: () => {
    return API.get(`${URL_API_PERMISSIONS}`);
  },
  createPermission: (body) => {
    return API.post(`${URL_API_PERMISSIONS}`, body);
  },
  updatePermission: (id, body) => {
    return API.put(`${URL_API_PERMISSIONS}/${id}`, body);
  },
  getPermissionById: (id) => {
    return API.get(`${URL_API_PERMISSIONS}/${id}`);
  },
};

export default Permission;
