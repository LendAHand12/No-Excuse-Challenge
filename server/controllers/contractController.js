import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ImageModule from "docxtemplater-image-module-free";
import fs from "fs";
import path from "path";
import axios from "axios";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Config from "../models/configModel.js";
import { numberToVietnameseWords } from "../utils/numberToWords.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to fetch image buffer from URL
const getImageBuffer = async (url) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data, "binary");
};

// @desc    Generate and download contract
// @route   GET /api/contracts/generate/:userId
// @access  Private/Admin
const generateContract = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!user.signatureImage) {
    res.status(400);
    throw new Error("User has not provided a signature yet");
  }

  try {
    // Load the docx template
    const templatePath = path.resolve(__dirname, "../files/contract.docx");
    const content = fs.readFileSync(templatePath, "binary");

    const zip = new PizZip(content);

    // Image module configuration
    const opts = {
      centered: false,
      getImage: async (tagValue) => {
        return await getImageBuffer(tagValue);
      },
      getSize: () => {
        return [150, 75]; // Width, Height in pixels
      },
    };

    const imageModule = new ImageModule(opts);

    const doc = new Docxtemplater(zip, {
      modules: [imageModule],
      paragraphLoop: true,
      linebreaks: true,
    });

    // Data to be injected
    const now = new Date();
    const formatDate = (date) => {
      if (!date) return "";
      const d = new Date(date);
      return `ngày ${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;
    };

    // Get exchange rate from Config
    const usdToVndConfig = await Config.findOne({ label: "USD_TO_VND_SELL" });
    const exchangeRate = usdToVndConfig ? usdToVndConfig.value : 25000; // Default fallback
    const packagePrice = 200 * exchangeRate;

    const data = {
      fullName: user.fullName,
      idCode: user.idCode || user._id,
      currentDate: now.getDate().toString(),
      currentMonth: (now.getMonth() + 1).toString(),
      currentYear: now.getFullYear().toString(),
      phone: user.phone,
      currentAddress: user.currentAddress,
      packagePrice: packagePrice.toLocaleString('vi-VN'), // Format with thousand separators
      packagePriceInWords: numberToVietnameseWords(packagePrice), // Price in Vietnamese words
      signature: `${process.env.BASE_URL}/${user.signatureImage}`, // This will be handled by the image module
    };


    // Render the document
    await doc.renderAsync(data);

    const buffer = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    // Set headers for download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Contract_${user.userId}.docx`
    );

    res.send(buffer);
  } catch (error) {
    console.error("Error generating contract:", error);
    res.status(500);
    throw new Error("Error generating contract");
  }
});

export { generateContract };
