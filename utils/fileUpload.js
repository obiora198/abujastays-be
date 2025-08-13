const path = require("path");
const { uploadBufferToCloudinary } = require("./cloudinaryUploader");
const { v2: cloudinary } = require("cloudinary");

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];

const handleFileUpload = async (file, subDirectory = "") => {
  try {
    const { createReadStream, filename, mimetype } = await file;

    if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
      throw new Error(
        `Invalid file type: ${mimetype}. Only images and PDFs are allowed.`
      );
    }

    const stream = createReadStream();
    const chunks = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    if (!buffer.length) {
      throw new Error(`Upload failed: File ${filename} is empty.`);
    }

    const { url, publicId } = await uploadBufferToCloudinary(
      buffer,
      subDirectory,
      mimetype,
      filename // pass filename to aid in .pdf detection
    );

    return { url, publicId };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

const deleteFile = async (publicId, resourceType = "image") => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result !== "ok") {
      console.warn("Cloudinary delete warning:", result);
      throw new Error("Failed to delete file from Cloudinary");
    }

    console.log("File deleted from Cloudinary:", publicId);
    return true;
  } catch (error) {
    console.error("Error deleting Cloudinary file:", error);
    throw new Error("File deletion failed");
  }
};

module.exports = {
  handleFileUpload,
  deleteFile,
};
