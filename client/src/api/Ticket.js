import API from './API';
import { URL_API_TICKET } from './URL';

const Ticket = {
  create: (formData) => {
    return API.post(URL_API_TICKET, formData, {
      customContentType: 'multipart/form-data',
    });
  },
  getUserTickets: (pageNumber, status) => {
    const params = new URLSearchParams();
    if (pageNumber) params.append('pageNumber', pageNumber);
    if (status) params.append('status', status);
    return API.get(`${URL_API_TICKET}/user?${params.toString()}`);
  },
  getAllTickets: (pageNumber, status, keyword) => {
    const params = new URLSearchParams();
    if (pageNumber) params.append('pageNumber', pageNumber);
    if (status) params.append('status', status);
    if (keyword) params.append('keyword', keyword);
    return API.get(`${URL_API_TICKET}?${params.toString()}`);
  },
  getTicketById: (id) => {
    return API.get(`${URL_API_TICKET}/${id}`);
  },
  replyTicket: (id, adminResponse) => {
    return API.put(`${URL_API_TICKET}/${id}/reply`, { adminResponse });
  },
  markResolved: (id) => {
    return API.put(`${URL_API_TICKET}/${id}/resolve`);
  },
  closeTicket: (id) => {
    return API.put(`${URL_API_TICKET}/${id}/close`);
  },
};

export default Ticket;

