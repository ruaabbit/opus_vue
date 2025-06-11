<template>
  <el-dropdown @command="handleLanguageChange" trigger="click" class="language-switcher">
    <el-button text class="language-button">
      <span class="flag">{{ currentLanguage.flag }}</span>
      <span class="language-name">{{ currentLanguage.name }}</span>
      <el-icon class="el-icon--right">
        <ArrowDown />
      </el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="lang in availableLanguages"
          :key="lang.code"
          :command="lang.code"
          :class="{ active: lang.code === currentLocale }"
        >
          <span class="flag">{{ lang.flag }}</span>
          <span class="language-name">{{ lang.name }}</span>
          <el-icon v-if="lang.code === currentLocale" class="check-icon">
            <Check />
          </el-icon>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowDown, Check } from '@element-plus/icons-vue'
import { switchLanguage, availableLanguages } from '@/i18n'

const { locale } = useI18n()

// Current locale
const currentLocale = computed(() => locale.value)

// Current language object
const currentLanguage = computed(() => {
  return availableLanguages.find(lang => lang.code === currentLocale.value) || availableLanguages[0]
})

// Handle language change
const handleLanguageChange = (langCode) => {
  if (langCode !== currentLocale.value) {
    switchLanguage(langCode)
    // Force page refresh to ensure all components update properly
    window.location.reload()
  }
}
</script>

<style scoped>
.language-switcher {
  margin-left: 16px;
}

.language-button {
  color: white !important;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.language-button:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
}

.flag {
  font-size: 16px;
  margin-right: 4px;
}

.language-name {
  font-weight: 500;
}

.el-dropdown-menu {
  min-width: 120px;
}

.el-dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
}

.el-dropdown-item.active {
  background-color: #f0f9ff;
  color: #409eff;
}

.check-icon {
  color: #409eff;
  font-size: 14px;
}

/* Responsive design */
@media (max-width: 768px) {
  .language-name {
    display: none;
  }
  
  .language-button {
    padding: 6px 8px;
  }
}
</style>
