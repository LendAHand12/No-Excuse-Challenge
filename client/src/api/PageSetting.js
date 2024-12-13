import API from "./API";
import { URL_API_PAGE_SETTING } from "./URL";

const PageSetting = {
  getAllPageSetting: () => {
    return API.get(URL_API_PAGE_SETTING);
  },
  updatePageSetting: (body) => {
    return API.put(`${URL_API_PAGE_SETTING}`, body);
  },
};

export default PageSetting;
