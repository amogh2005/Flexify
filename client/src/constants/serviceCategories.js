// Standardized service categories used across the application
export const serviceCategories = {
  'driver': {
    name: 'Transportation',
    icon: '🚗',
    basePrice: 250,
    skills: ['City Driving', 'Highway Driving', 'Luxury Cars', 'Commercial Vehicles', 'Emergency Transport'],
    description: 'Safe and reliable transportation services'
  },
  'cook': {
    name: 'Cooking & Catering',
    icon: '👨‍🍳',
    basePrice: 400,
    skills: ['Indian Cuisine', 'International Cuisine', 'Vegan Cooking', 'Party Catering', 'Dietary Specialties'],
    description: 'Professional cooking and catering services'
  },
  'plumber': {
    name: 'Plumbing Services',
    icon: '🔧',
    basePrice: 300,
    skills: ['Pipe Repair', 'Drain Cleaning', 'Fixture Installation', 'Water Heater', 'Emergency Repair'],
    description: 'Expert plumbing and water system services'
  },
  'electrician': {
    name: 'Electrical Services',
    icon: '⚡',
    basePrice: 350,
    skills: ['Wiring', 'Fixture Installation', 'Safety Inspection', 'Emergency Repair', 'Smart Home Setup'],
    description: 'Certified electrical installation and repair'
  },
  'cleaner': {
    name: 'Specialized Cleaning',
    icon: '🧽',
    basePrice: 250,
    skills: ['Carpet Cleaning', 'Window Cleaning', 'Deep Cleaning', 'Post-Construction', 'Commercial Cleaning'],
    description: 'Specialized cleaning and maintenance services'
  },
  'maid': {
    name: 'Housekeeping & Cleaning',
    icon: '🧹',
    basePrice: 200,
    skills: ['Deep Cleaning', 'Laundry', 'Cooking', 'Pet Care', 'Elder Care'],
    description: 'Professional housekeeping and cleaning services'
  },
  'gardener': {
    name: 'Gardening Services',
    icon: '🌱',
    basePrice: 300,
    skills: ['Lawn Care', 'Plant Care', 'Landscaping', 'Tree Trimming', 'Garden Design'],
    description: 'Professional gardening and landscaping services'
  },
  'mechanic': {
    name: 'Automotive Services',
    icon: '🔧',
    basePrice: 400,
    skills: ['Engine Repair', 'Brake Service', 'Oil Change', 'Diagnostics', 'Emergency Repair'],
    description: 'Professional automotive repair and maintenance'
  },
  'other': {
    name: 'Other Services',
    icon: '🛠️',
    basePrice: 300,
    skills: ['Custom Services', 'Consultation', 'Specialized Work', 'Emergency Services'],
    description: 'Custom and specialized services'
  }
}

// Helper function to get category by key
export const getCategoryByKey = (key) => {
  return serviceCategories[key] || serviceCategories['other']
}

// Helper function to get all category keys
export const getAllCategoryKeys = () => {
  return Object.keys(serviceCategories)
}

// Helper function to get category options for select dropdowns
export const getCategoryOptions = () => {
  return Object.entries(serviceCategories).map(([key, category]) => ({
    value: key,
    label: category.name,
    icon: category.icon
  }))
}



