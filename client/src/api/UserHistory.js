import API from './API';
import { URL_API_USER_HISTORY } from './URL';

const UserHistory = {
  getList: ({ pageNumber, keyword, status }) => {
    return API.get(
      `${URL_API_USER_HISTORY}/?pageNumber=${pageNumber}&keyword=${keyword}&status=${status}`,
    );
  },
  update: (body) => {
    return API.put(`${URL_API_USER_HISTORY}`, body);
  },
};

export default UserHistory;
