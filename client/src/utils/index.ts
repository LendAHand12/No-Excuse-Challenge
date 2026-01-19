import moment from 'moment';

export const shortenWalletAddress = (walletAddress: string, length = 20) => {
  if (walletAddress) {
    const startLength = Math.ceil(length / 2);
    const endLength = Math.floor(length / 2);
    const start = walletAddress.substring(0, startLength);
    const end = walletAddress.substring(walletAddress.length - endLength);
    return `${start}...${end}`;
  } else {
    return '';
  }
};
export const getFirstImageSrc = (htmlString: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const img = doc.querySelector('img');
  return img ? img.src : null;
};

export const formatDateDDMM = (datetime: string) => {
  const date = new Date(datetime);
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
  }).format(date);
};

export const formatDateDDMMYYYY = (datetime: string) => {
  const date = new Date(datetime);
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const adjustSales = (arr, targetSales) => {
  const maxLimit = targetSales * 0.4;
  return arr.map((item) => (item > maxLimit ? maxLimit : item));
};

export const isUserExpired = async (dieTime) => {

  // User chỉ hết hạn khi dieTime !== null và dieTime đã quá hạn ngày hiện tại
  if (dieTime === null || dieTime === undefined) {
    return false;
  }

  const todayStart = moment().startOf("day");
  const dieTimeStart = moment(dieTime).startOf("day");

  // Nếu dieTime đã quá hạn (today >= dieTime) thì trả về true
  return todayStart.isSameOrAfter(dieTimeStart);
};

export { formatDateVN, formatDateTimeVN } from './dateFormat';