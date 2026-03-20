import http from "./http";

const normalizeVehicle = (vehicle) => {
  const specifications = [
    `${vehicle.year || "-"}`,
    `${vehicle.transmission || "-"}`,
    `${vehicle.fuel_type || "-"}`,
    `${vehicle.seating_capacity || "-"} places`,
  ];

  return {
    id: vehicle.id,
    name:
      vehicle.name || `${vehicle.brand || ""} ${vehicle.model || ""}`.trim(),
    description: vehicle.description || "",
    image:
      vehicle.image_url ||
      vehicle.image ||
      "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1400&q=80",
    category: vehicle.type || "Véhicule",
    price: Number(vehicle.daily_rate ?? vehicle.daily_price ?? 0),
    transmission: vehicle.transmission || "-",
    fuel: vehicle.fuel_type || vehicle.fuel || "-",
    seats: Number(vehicle.seating_capacity ?? vehicle.seats ?? 0),
    year: Number(vehicle.year ?? 0),
    mileage: Number(vehicle.mileage ?? 0),
    status: vehicle.status,
    specifications,
    features: vehicle.features || [],
    agency: vehicle.agency
      ? {
          id: vehicle.agency.id,
          name: vehicle.agency.name,
          location: vehicle.agency.location || "Tunis",
          address: vehicle.agency.location || "Tunis",
          phone: vehicle.agency.phone || "N/A",
          email: vehicle.agency.email || "N/A",
          hours: vehicle.agency.hours || "Lun-Sam 08:00 - 18:00",
        }
      : null,
  };
};

const extractCollection = (payload) => {
  const collection = payload?.data;
  if (Array.isArray(collection)) {
    return collection;
  }
  if (collection && Array.isArray(collection.data)) {
    return collection.data;
  }
  return [];
};

/**
 * Public vehicle service — handles public vehicle browsing without authentication
 */
const publicVehicleService = {
  /**
   * Get all available vehicles with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} perPage - Items per page (default: 12)
   * @returns {Promise}
   */
  getAll: async (page = 1, perPage = 12) => {
    try {
      const response = await http.get("/public/vehicles", {
        params: { page, per_page: perPage },
      });
      const vehicles = extractCollection(response.data).map(normalizeVehicle);

      return {
        ...response.data,
        data: vehicles,
      };
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
      throw error;
    }
  },

  /**
   * Get vehicle details by ID
   * @param {number} id - Vehicle ID
   * @returns {Promise}
   */
  getById: async (id) => {
    try {
      const response = await http.get(`/public/vehicles/${id}`);
      return {
        ...response.data,
        data: response.data?.data ? normalizeVehicle(response.data.data) : null,
      };
    } catch (error) {
      console.error(`Failed to fetch vehicle ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get all vehicles for a specific agency
   * @param {number} agencyId - Agency ID
   * @returns {Promise}
   */
  getByAgency: async (agencyId) => {
    try {
      const response = await http.get(`/public/vehicles/agency/${agencyId}`);
      const vehicles = extractCollection(response.data).map(normalizeVehicle);

      return {
        ...response.data,
        data: vehicles,
      };
    } catch (error) {
      console.error(`Failed to fetch vehicles for agency ${agencyId}:`, error);
      throw error;
    }
  },
};

export default publicVehicleService;
