import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'), // entry point utils-frontend
      name: 'UtilsFrontend',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: ['react-syntax-highlighter'],
      output: {
        globals: {
          'react-syntax-highlighter': 'ReactSyntaxHighlighter'
        }
      }
    }
  }
});