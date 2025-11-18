/**
 * Detect user's IP and country from client-side (browser)
 * This is necessary when FE and BE are on the same server
 */

interface IpLocationResult {
  ip: string;
  country: string;
  countryCode: string;
  isVietnam: boolean;
  success: boolean;
}

/**
 * Detect IP and country using ip-api.com as fallback
 * @returns {Promise<IpLocationResult>}
 */
const detectWithIpApi = async (): Promise<IpLocationResult> => {
  try {
    // Use HTTPS for ip-api.com (free tier: 45 requests/minute)
    const response = await fetch(
      'https://ip-api.com/json/?fields=status,message,country,countryCode,query',
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to detect location');
    }

    const data = await response.json();

    if (data.status === 'success') {
      const countryCode = data.countryCode || '';
      const isVietnam = countryCode === 'VN';

      return {
        ip: data.query || 'unknown',
        country: data.country || 'Unknown',
        countryCode: countryCode,
        isVietnam: isVietnam,
        success: true,
      };
    }

    throw new Error(data.message || 'Invalid response');
  } catch (error) {
    throw error;
  }
};

/**
 * Check if running in local/development environment
 * @returns {boolean}
 */
const isLocalEnvironment = (): boolean => {
  const hostname = window.location.hostname;
  // Check if hostname is localhost or 127.0.0.1
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0'
  ) {
    return true;
  }

  // Check if port is common dev port (3000, 5173 for Vite, etc.)
  const port = window.location.port;
  if (port && (port === '3000' || port === '5173' || port === '8080')) {
    return true;
  }

  return false;
};

/**
 * Detect IP and country from client using ipapi.co
 * Falls back to ip-api.com if rate limited
 * In local environment, skip API call and return Vietnam by default
 * @returns {Promise<IpLocationResult>}
 */
export const detectIpLocationFromClient =
  async (): Promise<IpLocationResult> => {
    // Skip API call in local/development environment
    if (isLocalEnvironment()) {
      console.log(
        'Local environment detected: Skipping IP detection, defaulting to Vietnam',
      );
      return {
        ip: 'localhost',
        country: 'Vietnam',
        countryCode: 'VN',
        isVietnam: true,
        success: true,
      };
    }

    try {
      // Try ipapi.co first
      const response = await fetch('https://ipapi.co/json/', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        // If rate limited (429) or other error, try fallback
        if (response.status === 429) {
          console.warn('ipapi.co rate limited, trying fallback API...');
          return await detectWithIpApi();
        }
        throw new Error('Failed to detect location');
      }

      const data = await response.json();

      // Check for error in response (rate limit or other errors)
      if (data.error) {
        // If rate limited, try fallback API
        if (data.reason && data.reason.toLowerCase().includes('rate limit')) {
          console.warn('ipapi.co rate limited, trying fallback API...');
          return await detectWithIpApi();
        }
        throw new Error(data.reason || 'Invalid response');
      }

      const countryCode = data.country_code || '';
      const isVietnam = countryCode === 'VN';

      return {
        ip: data.ip || 'unknown',
        country: data.country_name || 'Unknown',
        countryCode: countryCode,
        isVietnam: isVietnam,
        success: true,
      };
    } catch (error) {
      // If first API fails, try fallback
      try {
        console.warn('Primary API failed, trying fallback...', error);
        return await detectWithIpApi();
      } catch (fallbackError) {
        console.error('All IP detection APIs failed:', fallbackError);
        // Final fallback to Vietnam on error
        return {
          ip: 'unknown',
          country: 'Vietnam',
          countryCode: 'VN',
          isVietnam: true,
          success: false,
        };
      }
    }
  };
