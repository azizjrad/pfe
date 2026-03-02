// Agencies data extracted from vehiclesData
export const agenciesData = {
  1: {
    id: 1,
    slug: "elite-drive-centre-ville",
    name: "Elite Drive Centre-Ville",
    location: "Tunis",
    address: "45 Avenue Habib Bourguiba, Tunis 1000",
    phone: "+216 71 234 567",
    email: "tunis@elitedrive.tn",
    hours: "Lun-Sam: 8h00-19h00, Dim: 9h00-17h00",
    description:
      "Notre agence principale située au cœur de Tunis, sur la célèbre Avenue Habib Bourguiba. Nous offrons une large gamme de véhicules de luxe et économiques pour tous vos besoins de location.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    rating: 4.8,
    totalReviews: 234,
    features: [
      "Parking gratuit",
      "Service 24/7",
      "Livraison à domicile",
      "Assistance routière",
    ],
    coordinates: {
      lat: 36.8065,
      lng: 10.1815,
    },
  },
  2: {
    id: 2,
    slug: "elite-drive-la-marsa",
    name: "Elite Drive La Marsa",
    location: "La Marsa",
    address: "Boulevard Mohamed Bouazizi, La Marsa 2070",
    phone: "+216 71 345 678",
    email: "marsa@elitedrive.tn",
    hours: "Lun-Sam: 8h00-19h00, Dim: 9h00-17h00",
    description:
      "Située dans le quartier huppé de La Marsa, notre agence vous propose des véhicules haut de gamme dans un cadre moderne et accueillant. Profitez de notre service premium près de la mer.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    rating: 4.9,
    totalReviews: 189,
    features: [
      "Vue sur mer",
      "Parking sécurisé",
      "Café & WiFi gratuit",
      "Service VIP",
    ],
    coordinates: {
      lat: 36.8781,
      lng: 10.3247,
    },
  },
  3: {
    id: 3,
    slug: "elite-drive-sousse",
    name: "Elite Drive Sousse",
    location: "Sousse",
    address: "Route de la Corniche, Sousse 4000",
    phone: "+216 73 456 789",
    email: "sousse@elitedrive.tn",
    hours: "Lun-Sam: 8h00-19h00, Dim: 9h00-17h00",
    description:
      "Notre agence de Sousse est idéalement située sur la corniche, parfaite pour démarrer vos aventures le long de la côte tunisienne. Découvrez notre collection de véhicules sport et SUV.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    rating: 4.7,
    totalReviews: 156,
    features: [
      "Accès plage",
      "Parking gratuit",
      "Service rapide",
      "Location longue durée",
    ],
    coordinates: {
      lat: 35.8256,
      lng: 10.6369,
    },
  },
};

// Helper function to get all agencies as array
export const getAllAgencies = () => {
  return Object.values(agenciesData);
};

// Helper function to get agency by ID
export const getAgencyById = (id) => {
  return agenciesData[id];
};

// Helper function to get agency by slug
export const getAgencyBySlug = (slug) => {
  return Object.values(agenciesData).find((agency) => agency.slug === slug);
};
