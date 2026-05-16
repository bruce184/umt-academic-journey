import "dotenv/config";

export const env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || 5000,
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
    WEB_BASE_URL: process.env.WEB_BASE_URL,
    API_BASE_URL: process.env.API_BASE_URL,
    CORS_ORIGINS: process.env.CORS_ORIGINS,
};
