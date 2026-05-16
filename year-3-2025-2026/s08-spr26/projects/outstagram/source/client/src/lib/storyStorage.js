import { supabase } from "./supabase";
import { getPublicConfigValue } from "./publicConfig";

const BUCKET_NAME = "story-media";

/**
 * Uploads a file (image or video) to Supabase Storage for stories.
 * @param {File} file - The file object to upload.
 * @returns {Promise<{publicUrl: string, path: string, mediaType: string}>}
 */
export async function uploadStoryMedia(file) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Validate file type
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
        throw new Error("Only image or video files are allowed");
    }

    const maxUploadSizeMb = Number(await getPublicConfigValue("max_upload_size_mb", 10)) || 10;
    const MAX_SIZE = maxUploadSizeMb * 1024 * 1024;
    if (file.size > MAX_SIZE) {
        throw new Error(`File size must be less than ${maxUploadSizeMb}MB`);
    }

    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }

    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return {
        publicUrl: data.publicUrl,
        path: filePath,
        mediaType: isVideo ? "video" : "image",
    };
}
