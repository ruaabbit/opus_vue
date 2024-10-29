import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// import viteCompression from 'vite-plugin-compression'


const INVALID_CHAR_REGEX = /[\u0000-\u001F"#$&*+,:;<=>?[\]^`{|}\u007F]/g
const DRIVE_LETTER_REGEX = /^[a-z]:/i

// https://vitejs.dev/config/
export default defineConfig({
  base: '/seaice/',
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    // viteCompression({
    //   filter: /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i, // 需要压缩的文件
    //   threshold: 10, // 文件容量大于这个值进行压缩
    //   algorithm: 'gzip', // 压缩方式
    //   ext: 'gz', // 后缀名
    //   deleteOriginFile: true, // 压缩后是否删除压缩源文件
    // })
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    // 消除打包大小超过500kb警告
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: {
        index: 'index.html'
      },
      // 静态资源分类打包
      output: {
        chunkFileNames: 'static/js/[name]-[hash].js',
        entryFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
        // TODO: 处理GitHub Pages 部署 *plugin-vue*export-helper.js 404
        // https://github.com/rollup/rollup/blob/master/src/utils/sanitizeFileName.ts
        sanitizeFileName(name) {
          const match = DRIVE_LETTER_REGEX.exec(name)
          const driveLetter = match ? match[0] : ''
          // A `:` is only allowed as part of a windows drive letter (ex: C:\foo)
          // Otherwise, avoid them because they can refer to NTFS alternate data streams.
          return driveLetter + name.slice(driveLetter.length).replace(INVALID_CHAR_REGEX, '')
        },
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const match = id.toString().match(/\/node_modules\/(?!.pnpm)(?<moduleName>[^\/]*)\//)
            return match?.groups?.moduleName ?? 'vender'
          }
        }
        // Alternative simpler implementation:
        // manualChunks(id) {
        //   if (id.includes('node_modules')) {
        //     return id.toString().split('node_modules/')[1].split('/')[0].toString()
        //   }
        // }
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
