import { useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import Admin from "@/api/Admin";
import { ToastContainer, toast } from "react-toastify";
import NoContent from "@/components/NoContent";
import Loading from "@/components/Loading";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import DefaultLayout from "../../../layout/DefaultLayout";

const Admins = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const key = searchParams.get("keyword");
  const page = searchParams.get("page");
  const [pageNumber, setPageNumber] = useState(page ? page : 1);
  const [totalPage, setTotalPage] = useState(0);
  const [keyword, setKeyword] = useState(key ? key : "");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [searchKey, setSearchKey] = useState(key ? key : "");
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Admin.getAllAdmins(pageNumber, searchKey)
        .then((response) => {
          const { admins, pages } = response.data;
          setData(admins);
          setTotalPage(pages);
          setLoading(false);
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.error
              ? error.response.data.error
              : error.message;
          toast.error(t(message));
          setLoading(false);
        });
    })();
  }, [pageNumber, refresh]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setPageNumber(1);
      await Admin.getAllAdmins(pageNumber, searchKey)
        .then((response) => {
          const { admins, pages } = response.data;
          setData(admins);
          setTotalPage(pages);

          setLoading(false);
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.error
              ? error.response.data.error
              : error.message;
          toast.error(t(message));
          setLoading(false);
        });
    })();
  }, [searchKey]);

  const onSearch = (e) => {
    setKeyword(e.target.value);
  };

  const handleDetail = (id) => {
    navigate(`/admin/admin/${id}`);
  };

  const handleChangePage = (page) => {
    setPageNumber(page);
  };

  const handleSearch = useCallback(() => {
    setSearchKey(keyword);
  }, [keyword]);

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="relative overflow-x-auto py-24 px-10">
        <div className="flex items-center justify-between pb-4 bg-white">
          <div className="relative">
          <h1 className="text-2xl font-bold">{t("List Admin")}</h1>
          </div>
          <button
            onClick={() => navigate("/admin/create-admin")}
            className="px-8 py-4 flex text-xs justify-center items-center hover:underline bg-black text-NoExcuseChallenge font-bold rounded-full shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
          >
            {t("createAdmin")}
          </button>
        </div>
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                Email
              </th>
              <th scope="col" className="px-6 py-3">
                Role
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 &&
              !loading &&
              data.map((ele) => (
                <tr
                  className="bg-white border-b hover:bg-gray-50"
                  key={ele._id}
                >
                  <td className="px-6 py-4">
                    <div className="text-base font-semibold text-gray-900">
                      {ele.email}
                    </div>
                    <div className="font-normal text-gray-500 text-sm">
                      {ele._id}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {ele.role || "admin"}
                      </span>
                      {ele.isRootAdmin && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {t("Root Admin")}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-6">
                      {userInfo?.permissions
                        .find((p) => p.page.path === "/admin/admin/:id")
                        ?.actions.includes("read") && (
                        <button
                          onClick={() => handleDetail(ele._id)}
                          className="font-medium text-gray-500 hover:text-NoExcuseChallenge"
                        >
                          <svg
                            fill="currentColor"
                            className="w-6 h-auto"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M21.92,11.6C19.9,6.91,16.1,4,12,4S4.1,6.91,2.08,11.6a1,1,0,0,0,0,.8C4.1,17.09,7.9,20,12,20s7.9-2.91,9.92-7.6A1,1,0,0,0,21.92,11.6ZM12,18c-3.17,0-6.17-2.29-7.9-6C5.83,8.29,8.83,6,12,6s6.17,2.29,7.9,6C18.17,15.71,15.17,18,12,18ZM12,8a4,4,0,1,0,4,4A4,4,0,0,0,12,8Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,12,14Z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {loading && (
          <div className="w-full flex justify-center my-4">
            <Loading />
          </div>
        )}
        {!loading && data.length === 0 && <NoContent />}
      </div>
    </DefaultLayout>
  );
};

export default Admins;
