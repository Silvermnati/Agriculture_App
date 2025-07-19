// Mock data for frontend development

// Mock Users
export const mockUsers = [
  // Demo accounts - These are the accounts that can be used to log in
  {
    id: "farmer1",
    name: "John Farmer",
    email: "farmer@example.com", // Use this email to log in as a farmer
    password: "password", // In mock mode, any password works, but this is the suggested one
    role: "farmer",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    farmSize: "5 hectares",
    farmingExperience: "10 years",
    farmingType: "organic",
    location: "Nairobi, Kenya"
  },
  {
    id: "expert1",
    name: "Sarah Expert",
    email: "expert@example.com", // Use this email to log in as an expert
    password: "password", // In mock mode, any password works, but this is the suggested one
    role: "expert",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    specializations: ["Crop Disease", "Soil Health"],
    yearsExperience: 8,
    location: "Mombasa, Kenya"
  },
  {
    id: "supplier1",
    name: "Michael Supplier",
    email: "supplier@example.com", // Use this email to log in as a supplier
    password: "password", // In mock mode, any password works, but this is the suggested one
    role: "supplier",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    businessName: "AgriSupplies Ltd",
    productsOffered: ["Seeds", "Fertilizers", "Tools"],
    location: "Kisumu, Kenya"
  },
  {
    id: "admin1",
    name: "Admin User",
    email: "admin@example.com", // Use this email to log in as an admin
    password: "password", // In mock mode, any password works, but this is the suggested one
    role: "admin",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    location: "Nairobi, Kenya"
  },
  // Other users for display purposes
  {
    id: "user1",
    name: "David Researcher",
    email: "david@example.com",
    role: "researcher",
    avatar: "https://randomuser.me/api/portraits/men/5.jpg",
    specializations: ["Crop Genetics", "Plant Breeding"],
    yearsExperience: 12,
    location: "Eldoret, Kenya"
  },
  {
    id: "user2",
    name: "Emily Student",
    email: "emily@example.com",
    role: "student",
    avatar: "https://randomuser.me/api/portraits/women/6.jpg",
    fieldOfStudy: "Agricultural Science",
    university: "University of Nairobi",
    location: "Nairobi, Kenya"
  },
  {
    id: "currentUser",
    name: "Current User",
    email: "me@example.com",
    role: "farmer",
    avatar: "https://randomuser.me/api/portraits/men/7.jpg",
    farmSize: "2 hectares",
    farmingExperience: "3 years",
    farmingType: "mixed",
    location: "Nakuru, Kenya"
  }
];

// Mock Communities
export const mockCommunities = [
  {
    id: "comm1",
    name: "Organic Corn Farmers",
    description: "A community for organic corn farmers to share knowledge and best practices for sustainable farming.",
    image_url: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=800",
    member_count: 1243,
    posts_count: 85,
    admin_count: 3,
    focus_crops: ["Corn", "Maize", "Sweet Corn"],
    location: {
      city: "Nairobi",
      country: "Kenya"
    },
    is_private: false,
    community_type: "Crop-Specific",
    recent_activity: true,
    created_at: "2023-05-15T10:30:00Z",
    is_member: true
  },
  {
    id: "comm2",
    name: "Kenyan Coffee Growers",
    description: "Connect with coffee farmers across Kenya to discuss cultivation techniques, market prices, and export opportunities.",
    image_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
    member_count: 876,
    posts_count: 120,
    admin_count: 2,
    focus_crops: ["Coffee", "Arabica", "Robusta"],
    location: {
      city: "Nyeri",
      country: "Kenya"
    },
    is_private: false,
    community_type: "Regional",
    recent_activity: true,
    created_at: "2023-06-22T14:15:00Z",
    is_member: false
  },
  {
    id: "comm3",
    name: "Urban Farming Innovators",
    description: "Urban farmers sharing space-efficient techniques, hydroponics, and rooftop gardening innovations for city agriculture.",
    image_url: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800",
    member_count: 542,
    posts_count: 67,
    admin_count: 2,
    focus_crops: ["Vegetables", "Herbs", "Microgreens"],
    location: {
      city: "Mombasa",
      country: "Kenya"
    },
    is_private: false,
    community_type: "Urban",
    recent_activity: false,
    created_at: "2023-07-10T09:45:00Z",
    is_member: true
  },
  {
    id: "comm4",
    name: "Sustainable Rice Cultivation",
    description: "Dedicated to sustainable rice farming practices that conserve water and reduce environmental impact.",
    image_url: "https://images.unsplash.com/photo-1568897451406-94d12e0dff9e?w=800",
    member_count: 921,
    posts_count: 103,
    admin_count: 4,
    focus_crops: ["Rice", "Paddy"],
    location: {
      city: "Kisumu",
      country: "Kenya"
    },
    is_private: true,
    community_type: "Crop-Specific",
    recent_activity: true,
    created_at: "2023-04-05T11:20:00Z",
    is_member: false
  },
  {
    id: "comm5",
    name: "Agricultural Technology Enthusiasts",
    description: "Exploring the latest in agritech innovations, from IoT sensors to drone monitoring and automated irrigation systems.",
    image_url: "https://images.unsplash.com/photo-1586771107445-d3ca888129ce?w=800",
    member_count: 734,
    posts_count: 92,
    admin_count: 3,
    focus_crops: ["Various"],
    location: {
      city: "",
      country: "Kenya"
    },
    is_private: false,
    community_type: "Professional",
    recent_activity: true,
    created_at: "2023-08-18T16:30:00Z",
    is_member: true
  }
];

// Mock Community Posts
export const mockCommunityPosts = [
  {
    id: "post1",
    title: "Best practices for organic corn pest management",
    content: "I've been struggling with corn borers this season and wanted to share some organic solutions that have worked for me. I've found that introducing beneficial insects like ladybugs and lacewings has significantly reduced the pest population without chemicals.\n\nHas anyone tried neem oil spray? What concentration works best?",
    author: {
      id: "user1",
      name: "John Farmer",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      role: "farmer"
    },
    communityId: "comm1",
    timestamp: "2023-09-15T08:30:00Z",
    likes: 24,
    comments: 7,
    images: [
      "https://images.unsplash.com/photo-1601329098116-4b987a33f1a2?w=800",
      "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=800"
    ],
    tags: ["pest-control", "organic", "corn"],
    crops: ["Corn", "Maize"],
    season: "Summer",
    location: "Nairobi Region",
    userHasLiked: true
  },
  {
    id: "post2",
    title: "Water conservation techniques for the dry season",
    content: "With the dry season approaching, I wanted to share some water conservation techniques that have helped me maintain crop health while reducing water usage:\n\n1. Mulching around plants to retain moisture\n2. Drip irrigation instead of sprinklers\n3. Watering during early morning or evening to reduce evaporation\n\nWhat other methods are you using to conserve water?",
    author: {
      id: "user3",
      name: "Michael Supplier",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
      role: "supplier"
    },
    communityId: "comm1",
    timestamp: "2023-09-10T14:45:00Z",
    likes: 31,
    comments: 12,
    images: [
      "https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=800"
    ],
    tags: ["water-conservation", "irrigation", "drought"],
    crops: ["Various"],
    season: "Dry Season",
    location: "Kenya",
    userHasLiked: false
  },
  {
    id: "post3",
    title: "Soil health analysis results - Need advice",
    content: "I just received my soil analysis results and I'm concerned about the low nitrogen levels. The pH is 6.2 which seems okay, but phosphorus is also on the lower side.\n\nCan anyone recommend organic amendments to improve these levels before planting? I'm trying to avoid synthetic fertilizers if possible.",
    author: {
      id: "user2",
      name: "Sarah Expert",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      role: "expert"
    },
    communityId: "comm1",
    timestamp: "2023-09-05T11:20:00Z",
    likes: 18,
    comments: 9,
    images: [
      "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=800"
    ],
    tags: ["soil-health", "organic", "fertilizer"],
    crops: ["Corn", "Vegetables"],
    season: "Pre-planting",
    location: "Mombasa Region",
    userHasLiked: true
  },
  {
    id: "post4",
    title: "New corn variety trial results",
    content: "I've been testing three drought-resistant corn varieties this season and wanted to share my results. The 'Resilient Gold' variety has shown the best performance with 15% higher yield despite the reduced rainfall.\n\nI've attached some photos comparing the three varieties at 10 weeks. The difference in cob development is quite noticeable.",
    author: {
      id: "currentUser",
      name: "Current User",
      avatar: "https://randomuser.me/api/portraits/men/4.jpg",
      role: "farmer"
    },
    communityId: "comm1",
    timestamp: "2023-09-01T09:15:00Z",
    likes: 42,
    comments: 15,
    images: [
      "https://images.unsplash.com/photo-1551283279-41e5d10ae6e7?w=800",
      "https://images.unsplash.com/photo-1591329857535-127f8f93c4c2?w=800",
      "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?w=800"
    ],
    tags: ["corn-varieties", "drought-resistant", "yield"],
    crops: ["Corn", "Maize"],
    season: "Growing Season",
    location: "Nakuru Region",
    userHasLiked: false
  }
];

// Mock Comments
export const mockComments = [
  {
    id: "comment1",
    postId: "post1",
    content: "I've had great success with neem oil at a 0.5% concentration. Make sure to apply it in the evening to avoid harming beneficial insects!",
    author: {
      id: "user2",
      name: "Sarah Expert",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      role: "expert"
    },
    timestamp: "2023-09-15T10:45:00Z",
    isEdited: false
  },
  {
    id: "comment2",
    postId: "post1",
    content: "Have you tried companion planting? I plant basil and marigolds between my corn rows and it's significantly reduced pest issues.",
    author: {
      id: "user3",
      name: "Michael Supplier",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
      role: "supplier"
    },
    timestamp: "2023-09-15T12:30:00Z",
    isEdited: false
  },
  {
    id: "comment3",
    postId: "post1",
    content: "Thanks for sharing! I'm going to try introducing ladybugs in my field next week.",
    author: {
      id: "currentUser",
      name: "Current User",
      avatar: "https://randomuser.me/api/portraits/men/4.jpg",
      role: "farmer"
    },
    timestamp: "2023-09-16T08:15:00Z",
    isEdited: true
  },
  {
    id: "comment4",
    postId: "post2",
    content: "I've installed rainwater harvesting systems that have been a game-changer during dry seasons. Happy to share details if anyone's interested.",
    author: {
      id: "user1",
      name: "John Farmer",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      role: "farmer"
    },
    timestamp: "2023-09-10T16:20:00Z",
    isEdited: false
  },
  {
    id: "comment5",
    postId: "post2",
    content: "Timing is everything! I've switched to night irrigation and seen a 30% reduction in water usage with the same crop health.",
    author: {
      id: "user2",
      name: "Sarah Expert",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      role: "expert"
    },
    timestamp: "2023-09-11T07:45:00Z",
    isEdited: false
  }
];

// Mock Experts
export const mockExperts = [
  {
    id: "expert1",
    name: "Dr. Sarah Johnson",
    title: "Agricultural Scientist",
    avatar_url: "https://randomuser.me/api/portraits/women/2.jpg",
    specializations: ["Soil Health", "Crop Disease", "Sustainable Farming"],
    rating: 4.9,
    review_count: 124,
    hourly_rate: 50,
    currency: "USD",
    service_areas: ["Kenya", "Tanzania", "Uganda"],
    availability_status: "Available",
    languages_spoken: ["English", "Swahili"]
  },
  {
    id: "expert2",
    name: "Prof. David Mwangi",
    title: "Irrigation Specialist",
    avatar_url: "https://randomuser.me/api/portraits/men/5.jpg",
    specializations: ["Water Management", "Drip Irrigation", "Drought Mitigation"],
    rating: 4.7,
    review_count: 98,
    hourly_rate: 45,
    currency: "USD",
    service_areas: ["Kenya", "Ethiopia"],
    availability_status: "Busy",
    languages_spoken: ["English", "Swahili", "Amharic"]
  },
  {
    id: "expert3",
    name: "Dr. Emily Ochieng",
    title: "Plant Pathologist",
    avatar_url: "https://randomuser.me/api/portraits/women/6.jpg",
    specializations: ["Plant Diseases", "Pest Management", "Organic Solutions"],
    rating: 4.8,
    review_count: 112,
    hourly_rate: 55,
    currency: "USD",
    service_areas: ["Kenya", "Rwanda", "Burundi"],
    availability_status: "Available",
    languages_spoken: ["English", "Swahili", "French"]
  }
];

// Helper function to get comments for a specific post
export const getCommentsForPost = (postId) => {
  return mockComments.filter(comment => comment.postId === postId);
};

// Helper function to get posts for a specific community
export const getPostsForCommunity = (communityId) => {
  return mockCommunityPosts.filter(post => post.communityId === communityId);
};

// Helper function to get a specific community by ID
export const getCommunityById = (communityId) => {
  return mockCommunities.find(community => community.id === communityId);
};

// Helper function to get a specific post by ID
export const getPostById = (postId) => {
  return mockCommunityPosts.find(post => post.id === postId);
};

// Helper function to get a specific user by ID
export const getUserById = (userId) => {
  return mockUsers.find(user => user.id === userId);
};

// Helper function to get the current user
export const getCurrentUser = () => {
  return mockUsers.find(user => user.id === "currentUser");
};