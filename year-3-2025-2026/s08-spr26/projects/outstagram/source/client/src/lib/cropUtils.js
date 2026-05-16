/**
 * Creates an Image element from a URL
 */
export const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.setAttribute("crossOrigin", "anonymous"); // needed to avoid CORS issues for cross-origin images
        image.src = url;
    });

/**
 * Returns the new cropped image blob/file
 */
export default async function getCroppedImg(imageSrc, pixelCrop) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        return null;
    }

    // set canvas size to match the bounding box
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // draw the image
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    // As Blob
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            // You might want to cast this to a File if your upload logic demands 'File' properties (name, lastModified)
            // or just handle Blob in upload.
            resolve(blob);
        }, "image/jpeg", 1); // high quality
    });
}
