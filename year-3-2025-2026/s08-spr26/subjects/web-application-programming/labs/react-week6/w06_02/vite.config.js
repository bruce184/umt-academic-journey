/*
  - react() để chạy app React
  - tailwindcss() để Vite hiểu Tailwind
  - nếu thiếu tailwindcss() thì class Tailwind sẽ không hoạt động đúng
*/
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});