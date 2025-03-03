<template>
  <el-config-provider :locale="zhCn">
    <el-container class="container-full-height">
      <!-- Sider with dark theme -->
      <el-aside
        :width="isCollapse ? '64px' : '200px'"
        class="sidebar-transition dark-bg sidebar-overflow"
      >
        <div class="sidebar-container">
          <div class="logo-container">
            <img src="@/assets/logo_01.svg" class="logo-image" alt="OUC AI GROUP" />
            <strong v-show="!isCollapse" class="logo-text">OUC AI GROUP</strong>
          </div>

          <el-menu
            :collapse="isCollapse"
            class="menu-container"
            :default-active="activeRoute"
            @select="handleSelect"
            background-color="#001529"
            text-color="#ffffff"
            active-text-color="#409EFF"
          >
            <el-menu-item index="/">
              <el-icon><House /></el-icon>
              <template #title>实时逐日预报</template>
            </el-menu-item>

            <el-menu-item index="/real-time-monthly-forecast">
              <el-icon><Calendar /></el-icon>
              <template #title>实时逐月预报</template>
            </el-menu-item>

            <el-menu-item index="/daily-forecast-predict">
              <el-icon><TrendCharts /></el-icon>
              <template #title>逐日预报测试</template>
            </el-menu-item>

            <el-menu-item index="/monthly-forecast-predict">
              <el-icon><Histogram /></el-icon>
              <template #title>逐月预报测试</template>
            </el-menu-item>

            <el-menu-item index="/uncertainty-analysis">
              <el-icon><Share /></el-icon>
              <template #title>不确定性分析</template>
            </el-menu-item>

            <el-menu-item index="/dynamics-analysis">
              <el-icon><Lightning /></el-icon>
              <template #title>动力学分析</template>
            </el-menu-item>
          </el-menu>
        </div>
      </el-aside>

      <el-container>
        <!-- Header -->
        <el-header class="header">
          <div class="header-container">
            <el-button
              aria-label="Collapse Menu"
              @click="toggleCollapse"
              class="collapse-btn"
              :class="{ 'rotate-180': !isCollapse }"
            >
              <el-icon :size="20" class="btn-icon">
                <component :is="isCollapse ? Expand : Fold" />
              </el-icon>
            </el-button>

            <div class="header-title">
              <h1 class="main-title">北极海冰时空多尺度预报基础模型 MetaICE</h1>
              <p class="sub-title">
                MetaICE: Foundation Model for Arctic Sea Ice Spatio-Temporal Multi-Scale Forecasting
              </p>
            </div>
            <a
              href="https://kmrvyozrlx.k.topthink.com/@oucaigroup/readme.html"
              target="_blank"
              class="about-link"
            >
              关于我们
            </a>
          </div>
        </el-header>

        <!-- Content -->
        <el-main class="main-content">
          <div class="content-container">
            <router-view></router-view>
          </div>
        </el-main>

        <!-- Footer -->
        <el-footer class="footer">
          OUC AI GROUP 2024 Copyright by 中国海洋大学人工智能研究院
        </el-footer>
      </el-container>
    </el-container>
  </el-config-provider>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  House,
  Calendar,
  TrendCharts,
  Histogram,
  Share,
  Lightning,
  Expand,
  Fold
} from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const route = useRoute()
const router = useRouter()
const activeRoute = ref(route.path)
const isCollapse = ref(false)

watch(
  () => route.path,
  (newPath) => {
    activeRoute.value = newPath
  }
)

const handleSelect = (key) => {
  router.push(key)
}

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<style>
/* 容器相关样式 */
.container-full-height {
  min-height: 100vh;
}

/* 侧边栏样式 */
.sidebar-transition {
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.5, 1); /* 使用更平滑的贝塞尔曲线 */
  will-change: width; /* 提示浏览器提前做好变化准备 */
  overflow-x: hidden; /* 防止内容溢出 */
}

.dark-bg {
  background-color: #001529;
}

.sidebar-overflow {
  overflow: hidden;
}

.sidebar-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Logo 区域样式 */
.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 4rem;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  flex-shrink: 0;
  padding: 0 10px;
}

.logo-image {
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5));
}

.logo-text {
  color: white;
  margin-left: 0.5rem;
  transition: opacity 0.2s ease; /* 添加不透明度过渡 */
}

/* 菜单容器样式 */
.menu-container {
  flex: 1;
  border: none;
  height: auto !important;
  padding: 4px;
}

/* 菜单项样式在元素样式部分 */

/* 头部样式 */
.header {
  background: linear-gradient(135deg, #001529, #003192);
  padding: 0;
  box-shadow: 0 4px 10px -1px rgba(0, 0, 0, 0.15);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  height: 70px !important;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  height: 100%;
}

/* 折叠按钮样式 */
.collapse-btn {
  background-color: rgba(255, 255, 255, 0.15) !important;
  transform-origin: center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1) !important; /* 更平滑的过渡 */
  padding: 0.5rem !important;
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(4px);
  will-change: transform; /* 提示浏览器准备变换 */
}

.collapse-btn:hover {
  background-color: rgba(255, 255, 255, 0.25) !important;
  transform: scale(1.05);
}

.collapse-btn.rotate-180 {
  transform: rotate(180deg);
}

.btn-icon {
  color: white;
}

/* 标题样式 */
.header-title {
  text-align: center;
  flex: 1;
}

.main-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.sub-title {
  color: rgba(255, 255, 255, 0.85);
  font-size: 1rem;
  margin: 0;
  font-weight: 400;
}

/* 关于我们链接 */
.about-link {
  color: white;
  font-size: 1.125rem;
  font-weight: 500;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.about-link:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.15);
}

/* 内容区域 */
.main-content {
  padding: 1.5rem;
  background-color: #f5f7fa;
  transition: all 0.3s ease;
}

.content-container {
  background-color: white;
  padding: 1.5rem;
  min-height: 360px;
  border-radius: 0.75rem;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.05),
    0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 页脚 */
.footer {
  text-align: center;
  color: #606266;
  padding-top: 1rem;
  padding-bottom: 1rem;
  font-size: 0.9rem;
  border-top: 1px solid #ebeef5;
}

/* 深色主题菜单样式 */
.el-menu {
  border-right: none;
}

.el-menu-item {
  height: 50px;
  line-height: 50px;
  margin: 4px 8px; /* 保持左右对称间距 */
  padding: 0 16px !important; /* 强制固定内边距 */
  border-radius: 8px;
  transition:
    all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1),
    padding 0.3s ease; /* 添加 padding 过渡 */
  display: flex !important;
  align-items: center;
}

/* 悬停状态 */
.el-menu-item:hover {
  background-color: rgba(24, 144, 255, 0.8) !important;
  transform: translateX(5px);
}

/* 激活状态 */
.el-menu-item.is-active {
  background-color: #1890ff !important;
  color: #ffffff !important;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.el-menu--collapse .el-menu-item {
  padding: 0 16px !important; /* 保持与展开状态相同的左右 padding */
  margin: 4px 8px; /* 保持与展开状态相同的 margin */
  justify-content: center;
}

/* 调整菜单容器高度 */
.el-menu--collapse {
  width: 64px;
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.el-menu--collapse .el-icon {
  margin-right: 0 !important; /* 折叠时移除右边距 */
}

/* 调整内容区域的过渡效果 */
.el-main {
  transition: all 0.3s ease;
}

.el-menu-item .el-icon {
  flex-shrink: 0;
  width: 24px; /* 固定图标容器宽度 */
  margin-right: 12px !important; /* 固定图标右边距 */
  display: flex;
  justify-content: center;
}

.el-menu-item > span {
  transition:
    opacity 0.3s ease,
    visibility 0.3s ease;
  visibility: visible;
  opacity: 1;
}

.el-menu--collapse .el-menu-item > span {
  opacity: 0;
  visibility: hidden;
  position: absolute;
}

/* 响应式设计优化 */
@media (max-width: 768px) {
  .main-title {
    font-size: 1.2rem;
  }

  .sub-title {
    font-size: 0.8rem;
  }

  .header-container {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  .content-container {
    padding: 1rem;
  }
}
</style>
