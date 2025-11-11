import API from './API';
import { URL_API_USER, URL_API_WITHDRAW } from './URL';

const Admin = {
  createAdmin: (body) => {
    return API.post(`${URL_API_USER}/admin`, body);
  },
  updateAdmin: (userId, body) => {
    return API.put(`${URL_API_USER}/admin/${userId}`, body);
  },
  getAllAdmins: (pageNumber, keyword) => {
    return API.get(
      `${URL_API_USER}/admin/?pageNumber=${pageNumber}&keyword=${keyword}`,
    );
  },
  getAdminById: (id) => {
    return API.get(`${URL_API_USER}/admin/${id}`);
  },
  deleteAdminById: (id) => {
    return API.delete(`${URL_API_USER}/admin/${id}`);
  },
  deleteUserById: (id) => {
    return API.delete(`${URL_API_USER}/${id}`);
  },
  getProfileAdmin: (id) => {
    return API.get(`${URL_API_USER}/admin/${id}`);
  },
  getAllWithdraws: ({ status, pageNumber, keyword }) => {
    return API.get(
      `${URL_API_WITHDRAW}/?pageNumber=${pageNumber}&status=${status}&keyword=${keyword}`,
    );
  },
  exportWithdraw: (body) => {
    return API.post(`${URL_API_WITHDRAW}/export`, body);
  },
  updateWithdraw: ({ id, hash, status, transferContent, cancelReason }) => {
    const body = { hash, status };
    if (transferContent) body.transferContent = transferContent;
    if (cancelReason) body.cancelReason = cancelReason;
    return API.put(`${URL_API_WITHDRAW}/${id}`, body);
  },
};

export default Admin;
