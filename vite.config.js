import { defineConfig } from 'vite';
import vitePluginPages from 'vite-plugin-pages';
import vitePluginSitemap from 'vite-plugin-sitemap';

export default defineConfig({
  plugins: [
    vitePluginPages(), // Auto-generates routes based on the file structure
    vitePluginSitemap({
      hostname: 'https://suikagame.pro', // Replace with your actual website URL
      routes: (paths) => paths.map((path) => ({ path })), // Adjust if necessary
    }),
  ],
});
