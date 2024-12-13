import API from "./API";
import { URL_API_PAGE, URL_API_PAGE_PREVIEW } from "./URL";

const Page = {
  getAllPages: () => {
    return API.get(URL_API_PAGE);
  },
  getPageDetailByPageName: (pageName, mode) => {
    return API.get(
      `${mode === "preview" ? URL_API_PAGE_PREVIEW : URL_API_PAGE}/${pageName}`
    );
  },
  updatePage: (pageName, body, mode) => {
    return API.put(
      `${mode === "preview" ? URL_API_PAGE_PREVIEW : URL_API_PAGE}/${pageName}`,
      body
    );
  },
};

export default Page;
