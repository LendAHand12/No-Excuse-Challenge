import axios from "axios";

/**
 * Get client IP address from request
 * @param {Object} req - Express request object
 * @returns {String} - IP address
 */
export const getClientIp = (req) => {
  console.log({ headers: req.headers });
  // Check various headers for IP address (in case of proxies/load balancers)
  const forwarded = req.headers["x-forwarded-for"];
  const realIp = req.headers["x-real-ip"];
  const cfConnectingIp = req.headers["cf-connecting-ip"]; // Cloudflare

  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(",")[0].trim();
  }
  if (realIp) {
    return realIp;
  }
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  // Fallback to connection remote address
  return req.connection?.remoteAddress || req.socket?.remoteAddress || req.ip || "unknown";
};

/**
 * Detect country from IP address using ipapi.co (free service)
 * @param {String} ip - IP address
 * @returns {Promise<Object>} - { country, countryCode, success }
 */
export const detectCountryFromIp = async (ip) => {
  console.log({ ip });
  // Skip detection for localhost/private IPs
  if (
    !ip ||
    ip === "unknown" ||
    ip.startsWith("127.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.")
  ) {
    return {
      country: "Vietnam",
      countryCode: "VN",
      success: true,
    };
  }

  try {
    // Using ipapi.co free service (no API key required, 1000 requests/day limit)
    // Response format: { country_name, country_code, ... }
    const response = await axios.get(`https://ipapi.co/${ip}/json/`, {
      timeout: 5000, // 5 second timeout
    });

    if (response.data && response.data.country_code) {
      // Check for error in response (ipapi.co returns error field if IP is invalid)
      if (response.data.error) {
        throw new Error(response.data.reason || "Invalid IP address");
      }

      return {
        country: response.data.country_name || "Unknown",
        countryCode: response.data.country_code || "",
        success: true,
      };
    }

    // Fallback to Vietnam if API response is invalid
    return {
      country: "Vietnam",
      countryCode: "VN",
      success: false,
    };
  } catch (error) {
    console.error("Error detecting country from IP:", error.message);
    // Fallback to Vietnam on error
    return {
      country: "Vietnam",
      countryCode: "VN",
      success: false,
    };
  }
};

/**
 * Check if country is Vietnam
 * @param {String} countryCode - Country code (e.g., "VN", "US")
 * @returns {Boolean}
 */
export const isVietnam = (countryCode) => {
  return countryCode === "VN";
};
