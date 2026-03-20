import http from "./http";

const normalizeReview = (review) => ({
  id: review.id,
  user_name: review.user_name || review.user?.name || "Client",
  rating: Number(review.rating ?? 0),
  comment: review.comment || "",
  created_at: review.created_at,
});

const normalizeAgencyVehicle = (vehicle, agency) => ({
  id: vehicle.id,
  name: vehicle.name || `${vehicle.brand || ""} ${vehicle.model || ""}`.trim(),
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
  status: vehicle.status,
  agency: {
    id: agency.id,
    name: agency.name,
    location: agency.location || "Tunisie",
    address: agency.address || agency.location || "Tunisie",
    phone: agency.phone || "N/A",
    email: agency.email || "N/A",
    hours: agency.hours || "Lun-Sam 08:00 - 18:00",
  },
});

const normalizeAgency = (agency) => {
  const features = Array.isArray(agency.features) ? agency.features : [];

  return {
    id: agency.id,
    name: agency.name,
    description: agency.description || "",
    location: agency.location || "Tunisie",
    address: agency.address || agency.location || "Tunisie",
    phone: agency.phone || "N/A",
    email: agency.email || "N/A",
    rating: Number(agency.rating ?? 0),
    totalReviews: Number(agency.total_reviews ?? agency.totalReviews ?? 0),
    image:
      agency.cover_image ||
      agency.logo_url ||
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1400&q=80",
    hours: agency.hours || "Lun-Sam 08:00 - 18:00",
    features,
    vehicles: Array.isArray(agency.vehicles)
      ? agency.vehicles.map((vehicle) =>
          normalizeAgencyVehicle(vehicle, agency),
        )
      : [],
    reviews: Array.isArray(agency.reviews)
      ? agency.reviews.map(normalizeReview)
      : [],
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
 * Public agency service — handles public agency browsing without authentication
 */
const publicAgencyService = {
  /**
   * Get all agencies with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} perPage - Items per page (default: 12)
   * @returns {Promise}
   */
  getAll: async (page = 1, perPage = 12) => {
    try {
      const response = await http.get("/public/agencies", {
        params: { page, per_page: perPage },
      });
      const agencies = extractCollection(response.data).map(normalizeAgency);

      return {
        ...response.data,
        data: agencies,
      };
    } catch (error) {
      console.error("Failed to fetch agencies:", error);
      throw error;
    }
  },

  /**
   * Get agency details by ID
   * @param {number} id - Agency ID
   * @returns {Promise}
   */
  getById: async (id) => {
    try {
      const response = await http.get(`/public/agencies/${id}`);
      return {
        ...response.data,
        data: response.data?.data ? normalizeAgency(response.data.data) : null,
      };
    } catch (error) {
      console.error(`Failed to fetch agency ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get agency details by slug
   * @param {string} slug - Agency slug
   * @returns {Promise}
   */
  getBySlug: async (slug) => {
    try {
      const response = await http.get(`/public/agencies/slug/${slug}`);
      return {
        ...response.data,
        data: response.data?.data ? normalizeAgency(response.data.data) : null,
      };
    } catch (error) {
      console.error(`Failed to fetch agency with slug ${slug}:`, error);
      throw error;
    }
  },
};

export default publicAgencyService;
