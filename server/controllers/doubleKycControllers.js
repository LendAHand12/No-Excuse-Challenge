import asyncHandler from "express-async-handler";
import { removeAccents } from "../utils/methods.js";
import DoubleKyc from "../models/doubleKycModel.js";
import User from "../models/userModel.js";

const getAllDoubleKyc = asyncHandler(async (req, res) => {
  let { pageNumber, keyword } = req.query;
  const page = Number(pageNumber) || 1;
  const pageSize = 10;

  const userMatchQuery = keyword
    ? {
        userId: { $regex: removeAccents(keyword), $options: "i" },
      }
    : {};

  // Tìm danh sách _id của user thỏa keyword
  const matchedUsers = await User.find(userMatchQuery, "_id").lean();
  const matchedUserIds = matchedUsers.map((u) => u._id);

  // Tạo query để lọc DoubleKyc
  const doubleKycQuery = keyword
    ? {
        $or: [
          { userIdFrom: { $in: matchedUserIds } },
          { userIdTo: { $in: matchedUserIds } },
        ],
      }
    : {};

  // Phân trang
  const skip = (page - 1) * pageSize;

  // Tổng số bản ghi
  const total = await DoubleKyc.countDocuments(doubleKycQuery);

  // Lấy dữ liệu
  const doubleKycs = await DoubleKyc.find(doubleKycQuery)
    .populate("userIdFrom", "userId email status")
    .populate("userIdTo", "userId email status")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .lean();

  res.json({
    doubleKycs,
    pages: Math.ceil(total / pageSize),
  });
});

export { getAllDoubleKyc };
