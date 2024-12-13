import API from "./API";
import { URL_API_POSTS } from "./URL";

const Posts = {
  getAllPosts: (pageNumber, keyword, category, statusSearch) => {
    return API.get(
      `${URL_API_POSTS}/?pageNumber=${pageNumber}&keyword=${keyword}&category=${category}&status=${statusSearch}`
    );
  },
  createPost: (body) => {
    return API.post(`${URL_API_POSTS}`, body, {
      customContentType: "multipart/form-data",
    });
  },
  updatePost: (id, body) => {
    return API.put(`${URL_API_POSTS}/${id}`, body);
  },
  getPostsById: (id) => {
    return API.get(`${URL_API_POSTS}/${id}`);
  },
  deletePostsById: (id) => {
    return API.delete(`${URL_API_POSTS}/${id}`);
  },
};

export default Posts;
