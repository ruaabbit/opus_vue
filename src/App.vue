<template>
  <ConfigProvider :locale="zhCN">
    <a-layout style="min-height: 100vh">
      <!-- Sider -->
      <a-layout-sider
        v-model:collapsed="collapsed"
        :trigger="null"
        collapsible
        breakpoint="lg"
        collapsed-width="0"
      >
        <div class="logo">
          <img src="@/assets/logo_01.svg" />
          <strong>OUC AI GROUP</strong>
        </div>
        <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
          <a-menu-item key="/">
            <router-link to="/">
              <home-outlined />
              <span>实时逐日预报</span>
            </router-link>
          </a-menu-item>
          <a-menu-item key="/real-time-monthly-forecast">
            <router-link to="/real-time-monthly-forecast">
              <calendar-outlined />
              <span>实时逐月预报</span>
            </router-link>
          </a-menu-item>
          <a-menu-item key="/daily-forecast-predict">
            <router-link to="/daily-forecast-predict">
              <line-chart-outlined />
              <span>逐日预报测试</span>
            </router-link>
          </a-menu-item>
          <a-menu-item key="/monthly-forecast-predict">
            <router-link to="/monthly-forecast-predict">
              <bar-chart-outlined />
              <span>逐月预报测试</span>
            </router-link>
          </a-menu-item>
          <a-menu-item key="/uncertainty-analysis">
            <router-link to="/uncertainty-analysis">
              <experiment-outlined />
              <span>不确定性分析</span>
            </router-link>
          </a-menu-item>
          <a-menu-item key="/dynamics-analysis">
            <router-link to="/dynamics-analysis">
              <thunderbolt-outlined />
              <span>动力学分析</span>
            </router-link>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>

      <a-layout>
        <!-- Header -->
        <a-layout-header style="background: #001a54; padding: 0; height: auto">
          <a-row type="flex" justify="space-between" align="middle" class="px-4 py-2">
            <a-col>
              <menu-unfold-outlined
                v-if="collapsed"
                class="trigger text-white text-2xl"
                @click="() => (collapsed = !collapsed)"
              />
              <menu-fold-outlined
                v-else
                class="trigger text-white text-2xl"
                @click="() => (collapsed = !collapsed)"
              />
            </a-col>
            <a-col flex="auto" class="text-center">
              <h1 class="text-white text-2xl font-bold m-0">
                北极海冰时空多尺度预报基础模型 MetaICE
              </h1>
              <p class="text-white text-lg m-0">
                MetaICE: Foundation Model for Arctic Sea Ice Spatio-Temporal Multi-Scale Forecasting
              </p>
            </a-col>
            <a-col>
              <a-button
                type="link"
                href="https://kmrvyozrlx.k.topthink.com/@oucaigroup/readme.html"
                target="_blank"
              >
                关于我们
              </a-button>
            </a-col>
          </a-row>
        </a-layout-header>

        <!-- Content -->
        <a-layout-content style="margin: 24px 16px 0">
          <div style="padding: 24px; background: #fff; min-height: 360px">
            <router-view></router-view>
          </div>
        </a-layout-content>

        <!-- Footer -->
        <a-layout-footer style="text-align: center">
          OUC AI GROUP ©2024 Copyright by 中国海洋大学人工智能研究院
        </a-layout-footer>
      </a-layout>
    </a-layout>
  </ConfigProvider>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  HomeOutlined,
  CalendarOutlined,
  LineChartOutlined,
  BarChartOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons-vue'
import { ConfigProvider } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')

const route = useRoute()
const selectedKeys = ref([route.path])
const collapsed = ref(false)

// 监听路由变化，更新选中的菜单项
watch(
  () => route.path,
  (newPath) => {
    selectedKeys.value = [newPath]
  }
)
</script>

<style scoped>
.logo {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 64px;
  margin: 16px;
  border-radius: 4px;
}

.logo strong {
  color: #ffffff; /* 白色字体 */
}

.logo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.ant-layout-sider-children .ant-menu-item a {
  color: rgba(255, 255, 255, 0.65);
}

.ant-layout-sider-children .ant-menu-item-selected a,
.ant-layout-sider-children .ant-menu-item a:hover {
  color: #fff;
}

.trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.ant-layout-header .ant-btn-link {
  color: white;
}

.ant-layout-header .ant-btn-link:hover {
  color: #40a9ff;
}
</style>
