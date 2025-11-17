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
 * Detect IP and country from client using ipapi.co
 * @returns {Promise<IpLocationResult>}
 */
export const detectIpLocationFromClient =
  async (): Promise<IpLocationResult> => {
    try {
      // Call ipapi.co directly from client to get real user IP
      // If no IP provided, it will detect the caller's IP automatically
      const response = await fetch('https://ipapi.co/json/', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to detect location');
      }

      const data = await response.json();

      console.log({ data });

      // Check for error in response
      if (data.error) {
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
      console.error('Error detecting IP location from client:', error);
      // Fallback to Vietnam on error
      return {
        ip: 'unknown',
        country: 'Vietnam',
        countryCode: 'VN',
        isVietnam: true,
        success: false,
      };
    }
  };
