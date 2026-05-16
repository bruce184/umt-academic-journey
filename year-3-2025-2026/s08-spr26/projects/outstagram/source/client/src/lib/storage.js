import { supabase } from "./supabase";
import { getPublicConfigValue } from "./publicConfig";

const BUCKET_NAME = "post-media";

/**
 * Uploads a file to Supabase Storage.
 * @param {File} file - The file object to upload.
 * @returns {Promise<{publicUrl: string, path: string}>}
 */
export async function uploadPostMedia(file) {
    // 1. Validate User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 2. Validate File
    if (!file.type.startsWith("image/")) {
        throw new Error("Only image files are allowed");
    }
    const maxUploadSizeMb = Number(await getPublicConfigValue("max_upload_size_mb", 10)) || 10;
    const MAX_SIZE = maxUploadSizeMb * 1024 * 1024;
    if (file.size > MAX_SIZE) {
        throw new Error(`File size must be less than ${maxUploadSizeMb}MB`);
    }

    // 3. Generate Path
    // Ext
    const ext = file.name.split(".").pop();
    // Path: userId/Timestamp-Random.ext to satisfy RLS (auth.uid() folder)
    const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

    // 4. Upload
    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }

    // 5. Get Public URL
    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return {
        publicUrl: data.publicUrl,
        path: filePath,
    };
}
