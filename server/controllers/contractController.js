import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ImageModule from "docxtemplater-image-module-free";
import fs from "fs";
import path from "path";
import axios from "axios";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
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
    const data = {
      full_name: user.userId,
      id_code: user.idCode || user._id,
      current_date: now.getDate().toString(),
      current_month: (now.getMonth() + 1).toString(),
      signature: `http://localhost:5000${user.signatureImage}`, // This will be handled by the image module
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

// @desc    Preview contract data (returns JSON with data that will be in the contract)
// @route   GET /api/contracts/preview-data/:userId
// @access  Private/Admin
const getPreviewData = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const now = new Date();
  res.json({
    full_name: user.userId,
    id_code: user.idCode || user._id,
    current_date: now.getDate().toString(),
    current_month: (now.getMonth() + 1).toString(),
    hasSignature: !!user.signatureImage,
    signatureUrl: user.signatureImage,
  });

});

export { generateContract, getPreviewData };
