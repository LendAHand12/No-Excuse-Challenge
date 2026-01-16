import mammoth from "mammoth";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import fs from "fs";
import path from "path";
import asyncHandler from "express-async-handler";
import { fileURLToPath } from "url";
import User from "../models/userModel.js";
import Config from "../models/configModel.js";
import { numberToVietnameseWords } from "../utils/numberToWords.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get contract template content as HTML with user data (for frontend display)
// @route   GET /api/contracts/content/:userId
// @access  Protected
const getContractContent = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const templatePath = path.resolve(__dirname, "../files/contract-preview.docx");

    // Check if file exists
    if (!fs.existsSync(templatePath)) {
      res.status(404);
      throw new Error("Contract template not found");
    }

    // Load the docx template for data population
    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Prepare data to inject (same as generateContract but without signature)
    const now = new Date();

    // Get exchange rate from Config
    const usdToVndConfig = await Config.findOne({ label: "USD_TO_VND_SELL" });
    const exchangeRate = usdToVndConfig ? usdToVndConfig.value : 25000;
    const packagePrice = 200 * exchangeRate;

    const data = {
      fullName: user.fullName || "",
      idCode: user.idCode || user._id.toString(),
      currentDate: now.getDate().toString(),
      currentMonth: (now.getMonth() + 1).toString(),
      currentYear: now.getFullYear().toString(),
      phone: user.phone || "",
      currentAddress: user.currentAddress || "",
      packagePrice: packagePrice.toLocaleString('vi-VN'),
      packagePriceInWords: numberToVietnameseWords(packagePrice),
      signature: "",
    };

    // Render the document with user data
    doc.render(data);

    // Get the populated docx buffer
    const buffer = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    // Enhanced Mammoth options for better formatting preservation
    const options = {
      styleMap: [
        "p[style-name='Heading 1'] => h1.contract-h1:fresh",
        "p[style-name='Heading 2'] => h2.contract-h2:fresh",
        "p[style-name='Heading 3'] => h3.contract-h3:fresh",
        "p[style-name='Heading 4'] => h4.contract-h4:fresh",
        "p[style-name='Title'] => h1.contract-title:fresh",
        "p[style-name='Subtitle'] => h2.contract-subtitle:fresh",
        "p[style-name='Normal'] => p.contract-normal",
        "p[style-name='Body Text'] => p.contract-body",
        "p[style-name='List Paragraph'] => p.contract-list",
        "b => strong",
        "i => em",
        "u => u",
        "table => table.contract-table",
      ],
      convertImage: mammoth.images.imgElement(function (image) {
        return image.read("base64").then(function (imageBuffer) {
          return {
            src: "data:" + image.contentType + ";base64," + imageBuffer
          };
        });
      }),
      includeDefaultStyleMap: true,
      includeEmbeddedStyleMap: true,
      ignoreEmptyParagraphs: false,
      preserveEmptyParagraphs: true,
    };

    const result = await mammoth.convertToHtml({
      buffer: buffer,
      ...options
    });

    const html = result.value;

    // Define comprehensive CSS for Word document formatting
    const css = `
      /* Base styles */
      .contract-content {
        font-family: 'Times New Roman', Times, serif;
        font-size: 14px;
        line-height: 1.8;
        color: #333;
      }
      
      /* Headings */
      .contract-content h1,
      .contract-h1 {
        font-size: 24px;
        font-weight: bold;
        color: #1a1a1a;
        margin: 24px 0 16px 0;
        text-align: center;
        text-transform: uppercase;
        border-bottom: 2px solid #333;
        padding-bottom: 8px;
      }
      
      .contract-content h2,
      .contract-h2 {
        font-size: 20px;
        font-weight: bold;
        color: #2c3e50;
        margin: 20px 0 12px 0;
        border-left: 4px solid #3498db;
        padding-left: 12px;
      }
      
      .contract-content h3,
      .contract-h3 {
        font-size: 18px;
        font-weight: bold;
        color: #34495e;
        margin: 16px 0 10px 0;
      }
      
      .contract-content h4,
      .contract-h4 {
        font-size: 16px;
        font-weight: bold;
        color: #555;
        margin: 14px 0 8px 0;
      }
      
      /* Paragraphs - preserve alignment from Word */
      .contract-content p {
        margin: 8px 0;
        text-align: justify;
      }
      
      /* Remove text-indent for centered and right-aligned paragraphs */
      .contract-content p[style*="text-align: center"],
      .contract-content p[style*="text-align:center"] {
        text-align: center !important;
        text-indent: 0 !important;
      }
      
      .contract-content p[style*="text-align: right"],
      .contract-content p[style*="text-align:right"] {
        text-align: right !important;
        text-indent: 0 !important;
      }
      
      .contract-content p[style*="text-align: left"],
      .contract-content p[style*="text-align:left"] {
        text-align: left !important;
      }
      
      /* Lists */
      .contract-content ul, 
      .contract-content ol {
        margin: 12px 0;
        padding-left: 40px;
      }
      
      .contract-content li {
        margin: 6px 0;
        line-height: 1.8;
        text-align: justify;
      }
      
      /* Text formatting */
      .contract-content strong, 
      .contract-content b {
        font-weight: bold;
        color: #1a1a1a;
      }
      
      .contract-content em, 
      .contract-content i {
        font-style: italic;
      }
      
      .contract-content u {
        text-decoration: underline;
      }
      
      /* Tables - preserve Word table formatting */
      .contract-content table,
      .contract-table {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;
        border: 1px solid #000;
      }
      
      .contract-content table td, 
      .contract-content table th {
        border: 1px solid #000;
        padding: 8px 12px;
        vertical-align: top;
        text-align: left;
      }
      
      .contract-content table th {
        background-color: #f0f0f0;
        font-weight: bold;
      }
      
      /* Preserve table cell alignment */
      .contract-content table td[style*="text-align: center"],
      .contract-content table th[style*="text-align: center"] {
        text-align: center !important;
      }
      
      .contract-content table td[style*="text-align: right"],
      .contract-content table th[style*="text-align: right"] {
        text-align: right !important;
      }
      
      /* Preserve inline styles from Word */
      .contract-content [style] {
        /* Allow all inline styles to work */
      }
      
      /* Line breaks */
      .contract-content br {
        line-height: 1.8;
      }
      
      /* Preserve spacing */
      .contract-content > *:first-child {
        margin-top: 0;
      }
      
      .contract-content > *:last-child {
        margin-bottom: 0;
      }
    `;

    // Return HTML and CSS separately
    res.json({
      success: true,
      content: html,
      css: css,
      messages: result.messages,
      userData: {
        fullName: user.fullName,
        phone: user.phone,
        currentAddress: user.currentAddress,
      }
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Error loading contract content: ${error.message}`);
  }
});

// @desc    Preview contract template as HTML
// @route   GET /api/contracts/preview
// @access  Private/Admin
const previewContractTemplate = asyncHandler(async (req, res) => {
  try {
    const templatePath = path.resolve(__dirname, "../files/contract-preview.docx");

    // Check if file exists
    if (!fs.existsSync(templatePath)) {
      res.status(404);
      throw new Error("Contract template not found");
    }

    // Convert .docx to HTML using mammoth
    const result = await mammoth.convertToHtml({ path: templatePath });
    const html = result.value;
    const messages = result.messages;

    // Create a complete HTML page with styling
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contract Template Preview</title>
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
            background-color: #f5f5f5;
            line-height: 1.6;
          }
          .container {
            background-color: white;
            padding: 60px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            min-height: 100vh;
          }
          h1, h2, h3 {
            color: #333;
            margin-top: 20px;
          }
          p {
            margin-bottom: 12px;
            text-align: justify;
          }
          .header {
            background-color: #007bff;
            color: white;
            padding: 20px;
            margin: -60px -60px 40px -60px;
            text-align: center;
          }
          .messages {
            background-color: #f8f9fa;
            padding: 10px;
            margin-bottom: 20px;
            border-left: 4px solid #007bff;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📄 Contract Template Preview</h1>
            <p>No Excuse Challenge - Member Agreement</p>
          </div>
          ${messages.length > 0 ? `
            <div class="messages">
              <strong>Conversion Notes:</strong>
              <ul>
                ${messages.map(m => `<li>${m.message}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          <div class="content">
            ${html}
          </div>
        </div>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(fullHtml);
  } catch (error) {
    res.status(500);
    throw new Error(`Error previewing contract: ${error.message}`);
  }
});

export { previewContractTemplate, getContractContent };
