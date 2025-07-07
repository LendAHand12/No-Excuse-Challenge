import API from './API';
import { URL_API_MOVE_SYSTEM } from './URL';

const MoveSystem = {
  register: (body) => {
    return API.post(`${URL_API_MOVE_SYSTEM}/register`, body);
  },
  list: ({pageNumber, status, keyword}) => {
    return API.get(
      `${URL_API_MOVE_SYSTEM}/?pageNumber=${pageNumber}&keyword=${keyword}&status=${status}`,
    );
  },
  approve: (body) => {
    return API.put(`${URL_API_MOVE_SYSTEM}`, body);
  },
};

export default MoveSystem;
