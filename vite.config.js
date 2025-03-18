import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/seaice/',
  build: {
    rollupOptions: {
      output: {
        sanitizeFileName: (name) => {
          const sanitized = name.replace(/[^a-zA-Z0-9_.-]/g, '_')
          return sanitized.startsWith('_') ? `file${sanitized}` : sanitized
        },
        manualChunks: (id) => {
          // 将 globe.gl 及其依赖拆分成更小的包
          if (id.includes('node_modules/globe.gl')) {
            return 'globe-core'
          }

          if (id.includes('node_modules/three')) {
            return 'three-vendor'
          }

          if (id.includes('node_modules/d3-')) {
            return 'd3-vendor'
          }

          // Element Plus 相关库单独打包
          if (id.includes('node_modules/element-plus') ||
            id.includes('node_modules/@element-plus')) {
            return 'element-plus-vendor'
          }

          // Vue 相关库单独打包
          if (id.includes('node_modules/vue') ||
            id.includes('node_modules/@vue') ||
            id.includes('node_modules/vue-router')) {
            return 'vue-vendor'
          }

          // 其他常用工具库
          if (id.includes('node_modules/axios') ||
            id.includes('node_modules/echarts') ||
            id.includes('node_modules/vue-echarts')) {
            return 'utils-vendor'
          }
        }
      }
    }
  },
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
