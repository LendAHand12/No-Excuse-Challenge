import API from './API';
import { URL_API_USER, URL_API_DREAMPOOL, URL_API_WITHDRAW } from './URL';

const User = {
  update: (userId, body) => {
    return API.put(`${URL_API_USER}/${userId}`, body, {
      customContentType: 'multipart/form-data',
    });
  },
  getAllUsers: (pageNumber, keyword, statusSearch, coin) => {
    return API.get(
      `${URL_API_USER}/?pageNumber=${pageNumber}&keyword=${keyword}&status=${statusSearch}&coin=${coin}`,
    );
  },
  getAllUsersPreTier2: (pageNumber, keyword, status) => {
    return API.get(
      `${URL_API_USER}/getAllUsersPreTier2?pageNumber=${pageNumber}&keyword=${keyword}&status=${status}`,
    );
  },
  getAllUsersOver45: (pageNumber, keyword) => {
    return API.get(
      `${URL_API_USER}/over45?pageNumber=${pageNumber}&keyword=${keyword}`,
    );
  },
  getAllUsersTier2: (pageNumber) => {
    return API.get(`${URL_API_USER}/tiers/2?pageNumber=${pageNumber}`);
  },
  getUserById: (id, tier) => {
    const tierParam = tier ? `?tier=${tier}` : '';
    return API.get(`${URL_API_USER}/${id}${tierParam}`);
  },
  getUserInfo: (tier) => {
    const tierParam = tier ? `?tier=${tier}` : '';
    return API.get(`${URL_API_USER}/info${tierParam}`);
  },
  getUserAssets: () => {
    return API.get(`${URL_API_USER}/assets`);
  },
  deleteUserById: (id) => {
    return API.delete(`${URL_API_USER}/${id}`);
  },
  getProfile: () => {
    return API.get(`${URL_API_USER}/profile`);
  },
  changeStatus: (body) => {
    return API.put(`${URL_API_USER}/status`, body);
  },
  getTree: () => {
    return API.get(`${URL_API_USER}/tree`);
  },
  getChildsOfUserForTree: (body) => {
    return API.post(`${URL_API_USER}/treeNode`, body);
  },
  getListChild: () => {
    return API.get(`${URL_API_USER}/listChild`);
  },
  getListChildSubUser: () => {
    return API.get(`${URL_API_USER}/listChildSubUser`);
  },
  getListChildLteBranch: () => {
    return API.get(`${URL_API_USER}/listChildLteBranch`);
  },
  getTreeOfUser: (id) => {
    return API.get(`${URL_API_USER}/tree/${id}`);
  },
  getAllUsersWithKeyword: (body) => {
    return API.post(`${URL_API_USER}/getAllUsersWithKeyword`, body);
  },
  changeSystem: (body) => {
    return API.post(`${URL_API_USER}/changeSystem`, body);
  },
  getChildrenList: () => {
    return API.get(`${URL_API_USER}/getChildrenList`);
  },
  getAllDeletedUsers: (pageNumber, keyword) => {
    return API.get(
      `${URL_API_USER}/getAllDeletedUsers/?pageNumber=${pageNumber}&keyword=${keyword}`,
    );
  },
  getAllUsersForExport: (body) => {
    return API.post(`${URL_API_USER}/getAllUsersForExport`, body);
  },
  getMailChangeWallet: () => {
    return API.get(`${URL_API_USER}/changeWallet`);
  },
  changeWallet: (body) => {
    return API.post(`${URL_API_USER}/changeWallet`, body);
  },
  adminUpdateUser: (id, body) => {
    return API.post(`${URL_API_USER}/update/${id}`, body, {
      customContentType: 'multipart/form-data',
    });
  },

  checkIncreaseTier: (body) => {
    return API.post(`${URL_API_USER}/tier/increase`, body);
  },

  createUser: (body) => {
    return API.post(`${URL_API_USER}/create`, body, {
      customContentType: 'multipart/form-data',
    });
  },

  getListNextUserTier: (body) => {
    return API.post(`${URL_API_USER}/listNextUserTier`, body);
  },
  getUsersWithTier: (body) => {
    return API.post(`${URL_API_USER}/getUsersWithTier`, body);
  },
  changeNextUserTier: (body) => {
    return API.post(`${URL_API_USER}/changeNextUserTier`, body);
  },
  getLastUserInTier: (body) => {
    return API.post(`${URL_API_USER}/getLastUserInTier`, body);
  },
  getListChildForCreateAdmin: () => {
    return API.get(`${URL_API_USER}/listChildForCreateAdmin`);
  },
  removeLastUserInTier: (body) => {
    return API.post(`${URL_API_USER}/removeLastUserInTier`, body);
  },
  getDreamPool: ({ tier }) => {
    return API.get(`${URL_API_DREAMPOOL}?tier=${tier}`);
  },
  getNotHonorUsers: () => {
    return API.get(`${URL_API_DREAMPOOL}/notHonors`);
  },
  updateDreamPool: (body) => {
    return API.post(`${URL_API_DREAMPOOL}`, body);
  },
  exportDreamPool: (body) => {
    return API.post(`${URL_API_DREAMPOOL}/export`, body);
  },
  adminChangeWalletUser: (body) => {
    return API.put(`${URL_API_USER}/change-wallet`, body);
  },
  withdraws: () => {
    return API.get(`${URL_API_WITHDRAW}/user`);
  },
  getSubInfo: () => {
    return API.post(`${URL_API_USER}/sub-info`);
  },
  checkAbnormalIncome: (id) => {
    return API.get(`${URL_API_USER}/${id}/check-abnormal-income`);
  },
  uploadSignature: (formData) => {
    return API.post(`${URL_API_USER}/signature`, formData, {
      customContentType: 'multipart/form-data',
    });
  },
  uploadCCCD: (formData) => {
    return API.post(`${URL_API_USER}/cccd/upload`, formData, {
      customContentType: 'multipart/form-data',
    });
  },
  downloadCCCDImages: (id) => {
    return API.get(`${URL_API_USER}/${id}/cccd/download`, {
      responseType: 'blob',
    });
  },
};

export default User;
