import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {         // <-- ลบทิ้งทั้งหมด
  //   port: 3000,    // <-- ลบทิ้ง
  //   proxy: {       // <-- ลบทิ้ง
  //     '/api': {    // <-- ลบทิ้ง
  //       target: process.env.VITE_API_URL || 'http://localhost:8080', // <-- ลบทิ้ง
  //       changeOrigin: true, // <-- ลบทิ้ง
  //       secure: false, // <-- ลบทิ้ง
  //     }            // <-- ลบทิ้ง
  //   }              // <-- ลบทิ้ง
  // }                // <-- ลบทิ้ง
});