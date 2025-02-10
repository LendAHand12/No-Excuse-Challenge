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
  const doc = parser.parseFromString(htmlString, "text/html");
  const img = doc.querySelector("img");
  return img ? img.src : null;
}

export const formatDateDDMM = (datetime: string) => {
  const date = new Date(datetime);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export const formatDateDDMMYYYY = (datetime: string) => {
  const date = new Date(datetime);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

