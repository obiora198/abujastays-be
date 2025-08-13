const { v2: cloudinary } = require("cloudinary");
const { Readable } = require("stream");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadBufferToCloudinary = (buffer, folder, mimetype, filename = "") => {
  return new Promise((resolve, reject) => {
    if (!buffer || !Buffer.isBuffer(buffer)) {
      return reject(new Error("Invalid or missing file buffer"));
    }

    const isPDF =
      mimetype === "application/pdf" ||
      filename.toLowerCase().endsWith(".pdf");

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: isPDF ? "raw" : "image", // Critical for PDFs
        format: isPDF ? "pdf" : undefined,
        use_filename: true,
        unique_filename: true,
        discard_original_filename: false,
        type: "upload", // Important for direct file access
      },
      (error, result) => {
        if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
          });
        } else {
          reject(error || new Error("Cloudinary upload failed"));
        }
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};


module.exports = { uploadBufferToCloudinary };
