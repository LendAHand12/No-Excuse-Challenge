import API from './API';
import { URL_API_PRE_TIER_2 } from './URL';

const PreTier2 = {
  getAllUsersPreTier2s: () => {
    return API.get(URL_API_PRE_TIER_2);
  },
  payment: () => {
    return API.get(`${URL_API_PRE_TIER_2}/payment`);
  },
  approve: (id) => {
    return API.put(`${URL_API_PRE_TIER_2}/${id}`);
  },
  achieveUserTier2: (id) => {
    return API.put(`${URL_API_PRE_TIER_2}/achieve-user/${id}`);
  },
  donePayment: (body) => {
    return API.post(`${URL_API_PRE_TIER_2}/done-payment`, body);
  },
  getAllUsersPreTier2: (pageNumber, keyword, statusSearch) => {
    return API.get(
      `${URL_API_PRE_TIER_2}/?pageNumber=${pageNumber}&keyword=${keyword}&status=${statusSearch}`,
    );
  },
  getAllUsersPassed: (pageNumber, keyword) => {
    return API.get(
      `${URL_API_PRE_TIER_2}/pre-tier-2-passed-list?pageNumber=${pageNumber}&keyword=${keyword}`,
    );
  },
  getUsersPreTier2: (pageNumber, keyword) => {
    return API.get(
      `${URL_API_PRE_TIER_2}/pre-tier-2-list?pageNumber=${pageNumber}&keyword=${keyword}`,
    );
  },
  changeOrder: (body) => {
    return API.post(`${URL_API_PRE_TIER_2}/change-order`, body);
  },
  onDonePayment: (body) => {
    return API.post(`${URL_API_PRE_TIER_2}/done-payment-tier-2`, body);
  },
  getPaymentTier2Info: (childId) => {
    return API.get(
      `${URL_API_PRE_TIER_2}/payment-tier-2-info?childId=${childId}`,
    );
  },
  getPoolInfo: (pageNumber, keyword) => {
    return API.get(
      `${URL_API_PRE_TIER_2}/pool?pageNumber=${pageNumber}&keyword=${keyword}`,
    );
  },
  adminAddToPool: (body) => {
    return API.post(`${URL_API_PRE_TIER_2}/add-pool`, body);
  },
  createBankOrder: (totalAmount) => {
    return API.post(`${URL_API_PRE_TIER_2}/createBankOrder`, { totalAmount });
  },
  checkOrderStatus: (orderId) => {
    return API.get(`${URL_API_PRE_TIER_2}/checkOrder/${orderId}`);
  },
};

export default PreTier2;
