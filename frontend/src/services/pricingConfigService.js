import http from "./http";

/**
 * Pricing Configuration Service
 *
 * Fetches pricing constants from backend /api/pricing-config endpoint.
 * This allows dynamic pricing updates without frontend redeployment.
 */

let pricingCache = null;

export const pricingConfigService = {
  /**
   * Fetch pricing configuration from backend
   *
   * Caches the configuration in memory to avoid repeated requests.
   * The configuration includes:
   * - Currency information
   * - Add-on prices (insurance, delivery services, after-hours pickup)
   * - Commission rates for agencies
   *
   * @returns {Promise<Object>} Pricing configuration object
   * @throws {Error} If API request fails
   */
  async getPricingConfig() {
    // Return cached config if available
    if (pricingCache) {
      return pricingCache;
    }

    try {
      const response = await http.get("/pricing-config");

      if (response.data.success && response.data.data) {
        pricingCache = response.data.data;
        return pricingCache;
      }

      throw new Error("Invalid pricing config response");
    } catch (error) {
      console.error("Failed to fetch pricing configuration:", error);
      throw error;
    }
  },
};
