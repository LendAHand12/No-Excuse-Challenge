import API from './API';
import { URL_API_WILDCARD } from './URL';

const WildCard = {
  getUserWildCards: () => {
    return API.get(URL_API_WILDCARD);
  },
  useWildCard: (cardId, targetUserId = null) => {
    return API.post(URL_API_WILDCARD + '/use', {
      cardId,
      targetUserId,
    });
  },
  // Admin only
  adminGetUserWildCards: (userId) => {
    return API.get(`${URL_API_WILDCARD}/admin/${userId}`);
  },
  adminCreateWildCard: (userId, days, targetTier) => {
    return API.post(URL_API_WILDCARD + '/admin/create', {
      userId,
      days,
      targetTier,
    });
  },
  adminDeleteWildCard: (cardId) => {
    return API.delete(`${URL_API_WILDCARD}/admin/delete/${cardId}`);
  },
};

export default WildCard;
