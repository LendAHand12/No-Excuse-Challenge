import API from './API';
import { URL_API_USER, URL_API_WITHDRAW, URL_API_ADMIN } from './URL';

const Admin = {
  // Admin authentication
  login: (body) => {
    return API.post(`${URL_API_ADMIN}/login`, body);
  },
  refresh: (body) => {
    return API.post(`${URL_API_ADMIN}/refresh`, body);
  },
  startFaceVerification: (body) => {
    return API.post(`${URL_API_ADMIN}/start-face-verification`, body);
  },
  verifyLogin: (body) => {
    return API.post(`${URL_API_ADMIN}/verify-login`, body);
  },
  startFaceEnrollment: (body) => {
    return API.post(`${URL_API_ADMIN}/start-face-enrollment`, body);
  },
  registerFace: (body) => {
    return API.post(`${URL_API_ADMIN}/register-face`, body);
  },
  setup2FA: (body) => {
    return API.post(`${URL_API_ADMIN}/setup-2fa`, body);
  },
  verifyAndEnable2FA: (body) => {
    return API.post(`${URL_API_ADMIN}/verify-enable-2fa`, body);
  },
  getAdminInfo: () => {
    return API.get(`${URL_API_ADMIN}/me`);
  },
  // Admin management
  createAdmin: (body) => {
    return API.post(`${URL_API_ADMIN}/create`, body);
  },
  getAllAdmins: () => {
    return API.get(`${URL_API_ADMIN}/all`);
  },
  getAdminById: (id) => {
    return API.get(`${URL_API_ADMIN}/${id}`);
  },
  updateAdmin: (id, body) => {
    return API.put(`${URL_API_ADMIN}/${id}`, body);
  },
  deleteAdminById: (id) => {
    return API.delete(`${URL_API_ADMIN}/${id}`);
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
