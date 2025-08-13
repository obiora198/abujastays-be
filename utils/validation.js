const validateService = (input) => {
  const errors = [];

  // Title validation
  if (!input.title) {
    errors.push("Title is required");
  } else if (input.title.length < 3) {
    errors.push("Title must be at least 3 characters long");
  } else if (input.title.length > 100) {
    errors.push("Title must not exceed 100 characters");
  }

  // Description validation
  if (!input.description) {
    errors.push("Description is required");
  } else if (input.description.length < 20) {
    errors.push("Description must be at least 20 characters long");
  } else if (input.description.length > 1000) {
    errors.push("Description must not exceed 1000 characters");
  }

  // Category validation
  if (!input.category) {
    errors.push("Category is required");
  }

  // Rate validation
  if (typeof input.rate !== 'number' || input.rate < 0) {
    errors.push("Rate must be a positive number");
  }

  // Location validation
  if (!input.location) {
    errors.push("Location is required");
  }

  // Availability validation
  if (!input.availability) {
    errors.push("Availability is required");
  }

  // Images validation
  if (input.images && !Array.isArray(input.images)) {
    errors.push("Images must be an array");
  }

  // Tags validation
  if (input.tags) {
    if (!Array.isArray(input.tags)) {
      errors.push("Tags must be an array");
    } else {
      input.tags.forEach((tag, index) => {
        if (typeof tag !== 'string') {
          errors.push(`Tag at position ${index + 1} must be a string`);
        }
        if (tag.length > 30) {
          errors.push(`Tag at position ${index + 1} must not exceed 30 characters`);
        }
      });
    }
  }

  // Experience validation
  if (input.experience && input.experience.length > 500) {
    errors.push("Experience description must not exceed 500 characters");
  }

  // Requirements validation
  if (input.requirements && input.requirements.length > 500) {
    errors.push("Requirements must not exceed 500 characters");
  }

  // Cancellation Policy validation
  if (input.cancellationPolicy && input.cancellationPolicy.length > 500) {
    errors.push("Cancellation policy must not exceed 500 characters");
  }

  return errors;
};

module.exports = {
  validateService,
}; 