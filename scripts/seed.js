require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Property = require("../models/Property");
const bcrypt = require("bcryptjs");

const sampleUsers = [
  {
    name: "John Traveler",
    email: "traveler@example.com",
    password: "password123",
    role: "traveler",
    isEmailVerified: true,
  },
  {
    name: "Sarah Manager",
    email: "manager@example.com",
    password: "password123",
    role: "manager",
    isEmailVerified: true,
  },
];

const sampleProperties = [
  {
    name: "Luxury Hotel Abuja",
    location: "Wuse Zone 2, Abuja",
    description:
      "A luxurious 5-star hotel in the heart of Abuja with world-class amenities and stunning city views.",
    pricePerNight: 50000,
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
    ],
  },
  {
    name: "Business Center Hotel",
    location: "Central Business District, Abuja",
    description:
      "Perfect for business travelers with conference facilities and high-speed internet.",
    pricePerNight: 35000,
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    ],
  },
  {
    name: "Abuja Resort & Spa",
    location: "Gwarinpa, Abuja",
    description:
      "Peaceful resort with spa facilities, swimming pool, and beautiful gardens.",
    pricePerNight: 75000,
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
    ],
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Property.deleteMany({});
    console.log("✅ Cleared existing data");

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = await User.create({
        ...userData,
      });
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.email}`);
    }

    // Create properties (assign to manager)
    const manager = createdUsers.find((user) => user.role === "manager");
    for (const propertyData of sampleProperties) {
      const property = await Property.create({
        ...propertyData,
        owner: manager._id,
      });
      console.log(`✅ Created property: ${property.name}`);
    }

    console.log("\n🎉 Database seeded successfully!");
    console.log("\nSample accounts:");
    console.log("Traveler: traveler@example.com / password123");
    console.log("Manager: manager@example.com / password123");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

// Run the seed function
seedDatabase();
