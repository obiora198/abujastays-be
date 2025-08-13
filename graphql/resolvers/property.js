const Property = require('../../models/Property');
const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { handleFileUpload } = require('../../utils/fileUpload');

module.exports = {
  Query: {
    properties: async (_, { location, maxPrice }) => {
      const query = {};
      
      if (location) {
        query.location = { $regex: location, $options: 'i' };
      }
      
      if (maxPrice) {
        query.pricePerNight = { $lte: maxPrice };
      }
      
      return Property.find(query)
        .populate('owner')
        .populate({
          path: 'reviews',
          select: 'id rating'
        });
    },
    property: (_, { id }) => Property.findById(id).populate('owner'),
    propertiesByOwner: (_, { ownerId }) => Property.find({ owner: ownerId }),
  },

  Mutation: {
    createProperty: async (_, args, { user }) => {
      if (!user || user.role !== 'manager') throw new AuthenticationError('Only managers can create properties');

      const { name, location, description, pricePerNight, images } = args;

      // Upload images (assumes images are base64 strings or file uploads)
      const uploadedImages = [];

      if (images && images.length) {
        for (const image of images) {
          const { url } = await handleFileUpload(image, 'properties');
          uploadedImages.push(url);
        }
      }

      const property = await Property.create({
        name,
        location,
        description,
        pricePerNight,
        images: uploadedImages,
        owner: user.userId,
      });

      return property;
    },

    updateProperty: async (_, { id, ...updates }, { user }) => {
      const property = await Property.findById(id);
      if (!property) throw new UserInputError('Property not found');
      if (String(property.owner) !== user.userId) throw new AuthenticationError('Forbidden');

      if (updates.images) {
        const uploadedImages = [];
        for (const image of updates.images) {
          const { url } = await handleFileUpload(image, 'properties');
          uploadedImages.push(url);
        }
        updates.images = uploadedImages;
      }

      Object.assign(property, updates);
      await property.save();

      return property;
    },

    deleteProperty: async (_, { id }, { user }) => {
      const property = await Property.findById(id);
      if (!property) throw new UserInputError('Property not found');
      if (String(property.owner) !== user.userId) throw new AuthenticationError('Forbidden');

      await property.deleteOne();
      return true;
    },
  },

  Property: {
    owner: (parent) => require('../../models/User').findById(parent.owner),
    bookings: (parent) => require('../../models/Booking').find({ property: parent._id }),
    reviews: (parent) => require('../../models/Review').find({ property: parent._id }),
  },
};
