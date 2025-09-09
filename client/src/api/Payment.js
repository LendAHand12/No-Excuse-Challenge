import API from './API';
import { URL_API_PAYMENT, URL_API_INCOME } from './URL';

const Payment = {
  getPaymentInfo: () => {
    return API.get(`${URL_API_PAYMENT}/info`);
  },
  getPaymentNextTierInfo: (childId) => {
    return API.get(`${URL_API_PAYMENT}/infoNextTier?childId=${childId}`);
  },
  addPayment: (body) => {
    return API.post(`${URL_API_PAYMENT}`, body);
  },
  onDonePayment: (body) => {
    return API.post(`${URL_API_PAYMENT}/done`, body);
  },
  onDoneNextTierPayment: (body) => {
    return API.post(`${URL_API_PAYMENT}/doneNextTier`, body);
  },
  getAllPayments: (pageNumber, keyword, statusSearch, tier) => {
    return API.get(
      `${URL_API_PAYMENT}/user/?pageNumber=${pageNumber}&keyword=${keyword}&status=${statusSearch}&tier=${tier}`,
    );
  },
  getPaymentsOfUser: (pageNumber) => {
    return API.get(`${URL_API_PAYMENT}/?pageNumber=${pageNumber}`);
  },
  getPaymentDetail: (id) => {
    return API.get(`${URL_API_PAYMENT}/${id}`);
  },
  checkCanRefund: (body) => {
    return API.post(`${URL_API_PAYMENT}/checkCanRefund`, body);
  },
  changeToRefunded: (body) => {
    return API.post(`${URL_API_PAYMENT}/changeToRefunded`, body);
  },
  onAdminDoneRefund: (body) => {
    return API.post(`${URL_API_PAYMENT}/onAdminDoneRefund`, body);
  },
  getAllTransForExport: (body) => {
    return API.post(`${URL_API_PAYMENT}/getAllTransForExport`, body);
  },
  getIncomeOfUser: (pageNumber, coin) => {
    return API.get(`${URL_API_INCOME}/?pageNumber=${pageNumber}&coin=${coin}`);
  },
  payWithCash: (body) => {
    return API.post(`${URL_API_PAYMENT}/payWithCash`, body);
  },
  donePayWithCash: (body) => {
    return API.post(`${URL_API_PAYMENT}/donePayWithCash`, body);
  },
};

export default Payment;
