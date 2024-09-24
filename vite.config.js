import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
// import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
// import viteCompression from 'vite-plugin-compression'


// https://vitejs.dev/config/
export default defineConfig({
  base: '/seaice/',
  plugins: [
    vue(),
    // AutoImport({
    //   resolvers: [ElementPlusResolver()],
    // }),
    Components({
      resolvers: [
        // ElementPlusResolver(),
        AntDesignVueResolver({
          importStyle: false, // css in js
        }),],
    }),
    // viteCompression({
    //   filter: /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i, // 需要压缩的文件
    //   threshold: 10, // 文件容量大于这个值进行压缩
    //   algorithm: 'gzip', // 压缩方式
    //   ext: 'gz', // 后缀名
    //   deleteOriginFile: true, // 压缩后是否删除压缩源文件
    // })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
