<template>
  <el-config-provider :locale="currentElementLocale">
    <el-container class="container-full-height">
      <!-- Sider with dark theme -->
      <el-aside width="220px" class="dark-bg sidebar-overflow sidebar-transition">
        <div class="sidebar-container">
          <div class="logo-container">
            <img src="@/assets/logo_01.svg" class="logo-image" alt="OUC AI GROUP" />
            <strong class="logo-text">OUC AI GROUP</strong>
          </div>

          <el-menu
            class="menu-container"
            :default-active="activeRoute"
            @select="handleSelect"
            background-color="#001529"
            text-color="rgba(255, 255, 255, 0.85)"
            active-text-color="#ffffff"
          >
            <el-menu-item index="/">
              <el-icon><House /></el-icon>
              <template #title
                ><span class="menu-item-text">{{
                  $t('menu.realTimeDailyForecast')
                }}</span></template
              >
            </el-menu-item>

            <el-menu-item index="/real-time-monthly-forecast">
              <el-icon><Calendar /></el-icon>
              <template #title
                ><span class="menu-item-text">{{
                  $t('menu.realTimeMonthlyForecast')
                }}</span></template
              >
            </el-menu-item>

            <el-menu-item index="/daily-forecast-predict">
              <el-icon><TrendCharts /></el-icon>
              <template #title
                ><span class="menu-item-text">{{ $t('menu.dailyForecastTest') }}</span></template
              >
            </el-menu-item>

            <el-menu-item index="/monthly-forecast-predict">
              <el-icon><Histogram /></el-icon>
              <template #title
                ><span class="menu-item-text">{{ $t('menu.monthlyForecastTest') }}</span></template
              >
            </el-menu-item>

            <el-menu-item index="/uncertainty-analysis">
              <el-icon><Share /></el-icon>
              <template #title
                ><span class="menu-item-text">{{ $t('menu.uncertaintyAnalysis') }}</span></template
              >
            </el-menu-item>

            <el-menu-item index="/model-interpreter">
              <el-icon><Lightning /></el-icon>
              <template #title
                ><span class="menu-item-text">{{ $t('menu.modelInterpreter') }}</span></template
              >
            </el-menu-item>

            <el-menu-item index="/dynamics-analysis">
              <el-icon><Lightning /></el-icon>
              <template #title
                ><span class="menu-item-text">{{ $t('menu.dynamicsAnalysis') }}</span></template
              >
            </el-menu-item>
          </el-menu>
        </div>
      </el-aside>

      <el-container>
        <!-- Header -->
        <el-header class="header">
          <div class="header-container">
            <div class="header-title">
              <h1 class="main-title">{{ $t('app.title') }}</h1>
              <p class="sub-title">
                {{ $t('app.subtitle') }}
              </p>
            </div>
            <div class="header-right">
              <a href="https://oucai.club/" target="_blank" class="about-link">
                {{ $t('app.aboutUs') }}
              </a>
              <LanguageSwitcher />
            </div>
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
          {{ $t('app.copyright') }}
        </el-footer>
      </el-container>
    </el-container>
  </el-config-provider>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { House, Calendar, TrendCharts, Histogram, Share, Lightning } from '@element-plus/icons-vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { getElementLocale } from '@/i18n'

useI18n()
const route = useRoute()
const router = useRouter()
const activeRoute = ref(route.path)

// Get current Element Plus locale
const currentElementLocale = computed(() => getElementLocale())

watch(
  () => route.path,
  (newPath) => {
    activeRoute.value = newPath
  }
)

const handleSelect = (key) => {
  router.push(key)
}
</script>

<style>
/* 容器相关样式 */
.container-full-height {
  min-height: 100vh;
}

/* 侧边栏样式 */
.dark-bg {
  background-color: #001529;
}

.sidebar-overflow {
  overflow-y: auto; /* Allow vertical scroll if content overflows */
  overflow-x: hidden; /* Hide horizontal scrollbar */
}

.sidebar-transition {
  transition: width 0.3s ease; /* Smooth transition for width changes */
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
  height: 60px; /* Adjusted height */
  margin-top: 1rem;
  margin-bottom: 1rem;
  flex-shrink: 0;
  padding: 0 16px; /* Adjusted padding */
}

.logo-image {
  height: 32px; /* Fixed height for logo */
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.6));
}

.logo-text {
  color: #ffffff;
  margin-left: 10px; /* Adjusted margin */
  font-weight: 600;
  font-size: 1.15rem;
  letter-spacing: 0.3px;
  white-space: nowrap; /* Prevent text wrapping */
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 菜单容器样式 */
.menu-container {
  flex: 1;
  border-right: none !important; /* Ensure no border from el-menu itself */
  height: auto !important;
  padding: 0 8px; /* Padding around menu items */
}

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

/* 头部右侧区域 */
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 内容区域 */
.main-content {
  padding: 1.5rem;
  background-color: #f5f7fa;
  transition: all 0.3s ease;
}

.content-container {
  background-color: white;
  padding: 0; /* 移除内边距使router-view可以完全填充 */
  min-height: 360px;
  border-radius: 0.75rem;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.05),
    0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden; /* 确保子元素不会溢出圆角边界 */
  display: flex; /* 使用flex布局让router-view填充 */
  flex-direction: column; /* 垂直方向排列 */
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
  height: 48px; /* Slightly reduced height */
  line-height: 48px;
  margin: 8px 0; /* Vertical margin, no horizontal */
  padding: 0 16px !important; /* Ensure padding is applied */
  border-radius: 6px; /* Slightly smaller border-radius */
  transition:
    background-color 0.2s ease-in-out,
    color 0.2s ease-in-out,
    transform 0.2s ease-in-out;
  display: flex !important;
  align-items: center;
  /* Text overflow handling will be on a child span for better control */
}

.menu-item-text {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 10px; /* Space between icon and text */
}

/* 悬停状态 */
.el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1) !important; /* Lighter hover for dark theme */
  color: #ffffff !important;
  /* transform: translateX(3px); Optional: subtle hover effect */
}

/* 激活状态 */
.el-menu-item.is-active {
  background-color: #1677ff !important; /* Element Plus primary blue */
  color: #ffffff !important;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.el-menu-item .el-icon {
  flex-shrink: 0; /* Prevent icon from shrinking */
  font-size: 18px; /* Consistent icon size */
  width: 18px; /* Explicit width for icon container */
  /* margin-right is removed, use margin-left on menu-item-text instead */
  display: flex;
  align-items: center; /* Vertically center icon */
  justify-content: center;
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
