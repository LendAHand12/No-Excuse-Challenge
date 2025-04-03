import API from './API';
import { URL_API_USER, URL_API_DREAMPOOL } from './URL';

const User = {
  update: (userId, body) => {
    return API.put(`${URL_API_USER}/${userId}`, body, {
      customContentType: 'multipart/form-data',
    });
  },
  getAllUsers: (pageNumber, keyword, statusSearch) => {
    return API.get(
      `${URL_API_USER}/?pageNumber=${pageNumber}&keyword=${keyword}&status=${statusSearch}`,
    );
  },
  getUserById: (id) => {
    return API.get(`${URL_API_USER}/${id}`);
  },
  getUserInfo: () => {
    return API.get(`${URL_API_USER}/info`);
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
    return API.post(`${URL_API_USER}/create`, body);
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
  removeLastUserInTier: (body) => {
    return API.post(`${URL_API_USER}/removeLastUserInTier`, body);
  },
  getDreamPool: () => {
    return API.get(`${URL_API_DREAMPOOL}`);
  },
  adminChangeWalletUser: (body) => {
    return API.put(`${URL_API_USER}/change-wallet`, body);
  },
};

export default User;
