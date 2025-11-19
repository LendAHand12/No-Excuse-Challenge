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
  adminCreateWildCard: (userId, cardType, sourceInfo) => {
    return API.post(URL_API_WILDCARD + '/admin/create', {
      userId,
      cardType,
      sourceInfo,
    });
  },
};

export default WildCard;

