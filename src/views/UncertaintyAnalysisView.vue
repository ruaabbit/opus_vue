<template>
  <div class="uncertainty-container">
    <el-card class="analysis-card">
      <template #header>
        <div class="card-header">
          <h2>北极海冰预测不确定性分析</h2>
          <p class="subtitle">基于多模型集成的不确定性量化</p>
        </div>
      </template>

      <div class="form-section">
        <el-form :model="formData" label-width="120px">
          <el-form-item label="预测类型">
            <el-radio-group v-model="formData.forecastType">
              <el-radio :value="'daily'">逐日预测</el-radio>
              <el-radio :value="'monthly'">逐月预测</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="基准日期">
            <el-date-picker
              v-model="formData.baseDate"
              :type="formData.forecastType === 'daily' ? 'date' : 'month'"
              placeholder="选择基准日期"
              class="date-picker"
            />
          </el-form-item>

          <el-form-item label="预测时长">
            <el-select
              v-model="formData.forecastLength"
              placeholder="请选择预测时长"
              class="length-select"
            >
              <el-option
                v-for="item in forecastLengthOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="generateAnalysis" :loading="isLoading">
              生成分析结果
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <div v-if="isLoading" class="loading-container">
        <LoadingAnimation />
        <p>正在计算不确定性分析结果，请稍候...</p>
      </div>

      <div v-if="showResults && !isLoading" class="results-section">
        <!-- 不确定性可视化部分 -->
        <div class="visualization-tabs">
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <el-tab-pane label="空间不确定性分布" name="spatial">
              <div class="globe-container">
                <GlobeChartEchartsGL
                  class="globe-chart"
                  :baseTexture="baseTexture"
                  :auto-rotate="true"
                  :target-coord="[0, 90]"
                  :distance="250"
                />
                <div class="legend">
                  <div class="legend-title">不确定性强度 (标准差)</div>
                  <div class="legend-gradient"></div>
                  <div class="legend-labels">
                    <span>低</span>
                    <span>高</span>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="时间序列不确定性" name="temporal">
              <div class="chart-container" :class="{ active: activeTab === 'temporal' }">
                <v-chart class="time-series-chart" :option="timeSeriesOption" autoresize />
              </div>
            </el-tab-pane>
            <el-tab-pane label="概率分布" name="distribution">
              <div class="chart-container" :class="{ active: activeTab === 'distribution' }">
                <v-chart class="distribution-chart" :option="distributionOption" autoresize />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <div class="analysis-details">
          <h3>不确定性分析摘要</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="平均不确定性"
              >{{ summaryData.meanUncertainty }}%</el-descriptions-item
            >
            <el-descriptions-item label="最大不确定性区域">{{
              summaryData.maxUncertaintyRegion
            }}</el-descriptions-item>
            <el-descriptions-item label="不确定性趋势">{{
              summaryData.uncertaintyTrend
            }}</el-descriptions-item>
            <el-descriptions-item label="预测置信度"
              >{{ summaryData.confidenceLevel }}%</el-descriptions-item
            >
          </el-descriptions>

          <div class="uncertainty-factors">
            <h4>主要不确定性来源</h4>
            <el-progress
              v-for="(factor, index) in uncertaintyFactors"
              :key="index"
              :percentage="factor.contribution"
              :color="factor.color"
              :stroke-width="16"
              :format="(p) => `${p}%`"
              class="factor-progress"
            >
              <template #default>
                <span class="factor-label">{{ factor.name }}</span>
              </template>
            </el-progress>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import GlobeChartEchartsGL from '../components/GlobeChartEchartsGL.vue'
import LoadingAnimation from '../components/LoadingAnimation.vue'
import VChart from 'vue-echarts'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'

// 注册必要的组件
echarts.use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])

// 基本状态
const formData = reactive({
  forecastType: 'daily',
  baseDate: null,
  forecastLength: 7
})

const isLoading = ref(false)
const showResults = ref(false)
const activeTab = ref('spatial')
const baseTexture = '/seaice/picture/sea_ice_map.png'

// 预测时长选项
const forecastLengthOptions = computed(() => {
  if (formData.forecastType === 'daily') {
    return [
      { value: 7, label: '7天' },
      { value: 14, label: '14天' },
      { value: 30, label: '30天' }
    ]
  } else {
    return [
      { value: 3, label: '3个月' },
      { value: 6, label: '6个月' },
      { value: 12, label: '12个月' }
    ]
  }
})

// 模拟的不确定性分析摘要数据
const summaryData = reactive({
  meanUncertainty: 12.5,
  maxUncertaintyRegion: '北极中央海盆',
  uncertaintyTrend: '随预测时长增加而增大',
  confidenceLevel: 87
})

// 模拟的不确定性来源因素
const uncertaintyFactors = reactive([
  { name: '初始条件不确定性', contribution: 42, color: '#409EFF' },
  { name: '模型结构不确定性', contribution: 28, color: '#67C23A' },
  { name: '边界条件不确定性', contribution: 18, color: '#E6A23C' },
  { name: '数据采样不确定性', contribution: 12, color: '#F56C6C' }
])

// 时间序列图配置
const timeSeriesOption = reactive({
  title: {
    text: '海冰面积预测的时间序列不确定性',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  },
  legend: {
    data: ['预测值', '上限 (95%CI)', '下限 (95%CI)'],
    bottom: 10
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    top: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['1日', '2日', '3日', '4日', '5日', '6日', '7日']
  },
  yAxis: {
    type: 'value',
    name: '海冰面积 (百万平方公里)',
    nameLocation: 'middle',
    nameGap: 30
  },
  series: [
    {
      name: '预测值',
      type: 'line',
      data: [10.2, 10.0, 9.8, 9.5, 9.2, 8.8, 8.5],
      lineStyle: {
        width: 3
      },
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: {
        color: '#409EFF'
      }
    },
    {
      name: '上限 (95%CI)',
      type: 'line',
      data: [10.5, 10.4, 10.3, 10.1, 9.9, 9.7, 9.5],
      lineStyle: {
        width: 2,
        type: 'dashed'
      },
      itemStyle: {
        color: '#67C23A'
      }
    },
    {
      name: '下限 (95%CI)',
      type: 'line',
      data: [9.9, 9.6, 9.3, 8.9, 8.5, 7.9, 7.5],
      lineStyle: {
        width: 2,
        type: 'dashed'
      },
      itemStyle: {
        color: '#F56C6C'
      }
    },
    {
      name: '不确定性范围',
      type: 'line',
      data: [10.5, 10.4, 10.3, 10.1, 9.9, 9.7, 9.5],
      lineStyle: { opacity: 0 },
      areaStyle: {
        opacity: 0.2,
        color: '#409EFF'
      },
      stack: 'confidence-band',
      symbol: 'none'
    },
    {
      name: '下界',
      type: 'line',
      data: [-0.6, -0.8, -1.0, -1.2, -1.4, -1.8, -2.0].map((v) => 10.5 + v),
      lineStyle: { opacity: 0 },
      areaStyle: {
        opacity: 0.2,
        color: '#409EFF'
      },
      stack: 'confidence-band',
      symbol: 'none'
    }
  ]
})

// 概率分布图配置
const distributionOption = reactive({
  title: {
    text: '海冰面积预测的概率分布',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    },
    formatter: '{b}百万平方公里: {c}%'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '12%',
    top: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['7.5-8.0', '8.0-8.5', '8.5-9.0', '9.0-9.5', '9.5-10.0', '10.0-10.5'],
    name: '海冰面积 (百万平方公里)',
    nameLocation: 'middle',
    nameGap: 30
  },
  yAxis: {
    type: 'value',
    name: '概率 (%)',
    nameLocation: 'middle',
    nameGap: 30
  },
  series: [
    {
      type: 'bar',
      data: [5, 12, 25, 35, 18, 5],
      barWidth: '50%',
      itemStyle: {
        color: function (params) {
          const colors = ['#F56C6C', '#E6A23C', '#67C23A', '#409EFF', '#E6A23C', '#F56C6C']
          return colors[params.dataIndex]
        }
      }
    }
  ]
})

// 图表更新的处理
const updateCharts = () => {
  // 不再需要遍历chartInstances中的实例
  // vue-echarts会自动处理图表的更新
  nextTick(() => {
    // 如果正在显示分布图或时间序列图，确保重新渲染
    if (activeTab.value === 'temporal' || activeTab.value === 'distribution') {
      const chartContainers = document.querySelectorAll('.chart-container')
      chartContainers.forEach((container) => {
        if (container.classList.contains('active')) {
          // 触发容器大小变化，确保图表正确渲染
          container.style.height = `${container.offsetHeight}px`
        }
      })
    }
  })
}

// 监听标签页切换
const handleTabChange = (tab) => {
  activeTab.value = tab
  // 切换标签页后，只需更新图表，不需要重新初始化
  nextTick(() => {
    updateCharts()
  })
}

// 生成分析结果
const generateAnalysis = () => {
  if (!formData.baseDate) {
    ElMessage.warning('请选择基准日期')
    return
  }

  isLoading.value = true

  // 模拟API请求延迟
  setTimeout(() => {
    isLoading.value = false
    showResults.value = true

    // 根据选择的预测类型，更新图表数据
    if (formData.forecastType === 'monthly') {
      timeSeriesOption.xAxis.data = ['1月', '2月', '3月', '4月', '5月', '6月']
      timeSeriesOption.series[0].data = [8.2, 7.5, 6.8, 6.2, 5.8, 5.5]
      timeSeriesOption.series[1].data = [8.8, 8.2, 7.6, 7.2, 6.9, 6.7]
      timeSeriesOption.series[2].data = [7.6, 6.8, 6.0, 5.2, 4.7, 4.3]

      // 同时更新这两个系列，它们用于阴影区域
      timeSeriesOption.series[3].data = [8.8, 8.2, 7.6, 7.2, 6.9, 6.7]
      timeSeriesOption.series[4].data = [-1.2, -1.4, -1.6, -2.0, -2.2, -2.4].map((v) => 8.8 + v)

      // 更新分布图数据
      distributionOption.xAxis.data = ['4.0-5.0', '5.0-6.0', '6.0-7.0', '7.0-8.0', '8.0-9.0']
      distributionOption.series[0].data = [8, 20, 40, 25, 7]
    } else {
      timeSeriesOption.xAxis.data = ['1日', '2日', '3日', '4日', '5日', '6日', '7日']
      timeSeriesOption.series[0].data = [10.2, 10.0, 9.8, 9.5, 9.2, 8.8, 8.5]
      timeSeriesOption.series[1].data = [10.5, 10.4, 10.3, 10.1, 9.9, 9.7, 9.5]
      timeSeriesOption.series[2].data = [9.9, 9.6, 9.3, 8.9, 8.5, 7.9, 7.5]

      // 同时更新这两个系列，它们用于阴影区域
      timeSeriesOption.series[3].data = [10.5, 10.4, 10.3, 10.1, 9.9, 9.7, 9.5]
      timeSeriesOption.series[4].data = [-0.6, -0.8, -1.0, -1.2, -1.4, -1.8, -2.0].map(
        (v) => 10.5 + v
      )

      // 重置分布图数据为默认值
      distributionOption.xAxis.data = [
        '7.5-8.0',
        '8.0-8.5',
        '8.5-9.0',
        '9.0-9.5',
        '9.5-10.0',
        '10.0-10.5'
      ]
      distributionOption.series[0].data = [5, 12, 25, 35, 18, 5]
    }

    ElMessage.success('不确定性分析完成')

    // 确保图表在结果显示后更新
    nextTick(() => {
      // 直接更新图表，不需要再初始化
      updateCharts()
    })
  }, 2000)
}

// 组件挂载和卸载时执行
onMounted(() => {
  // 在窗口大小变化时更新图表尺寸
  window.addEventListener('resize', updateCharts, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', updateCharts)
  // 不再需要手动销毁图表实例，vue-echarts会处理
})
</script>

<style scoped>
.uncertainty-container {
  max-width: 1200px;
  margin: 0 auto;
}

.analysis-card {
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-header h2 {
  margin-bottom: 0.5rem;
  color: #303133;
}

.subtitle {
  color: #909399;
  font-size: 0.9rem;
}

.form-section {
  max-width: 600px;
  margin: 0 auto 2rem;
}

.date-picker,
.length-select {
  width: 100%;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

.loading-container p {
  margin-top: 1rem;
  color: #606266;
}

.results-section {
  margin-top: 2rem;
}

.visualization-tabs {
  margin-bottom: 2rem;
}

.globe-container {
  position: relative;
  height: 500px;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
}

.globe-chart {
  width: 100%;
  height: 100%;
}

.legend {
  position: absolute;
  right: 20px;
  bottom: 20px;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 10px;
  border-radius: 6px;
  color: white;
  width: 160px;
}

.legend-title {
  text-align: center;
  margin-bottom: 8px;
  font-size: 12px;
}

.legend-gradient {
  height: 10px;
  background: linear-gradient(to right, #3498db, #f1c40f, #e74c3c);
  border-radius: 3px;
  margin-bottom: 4px;
}

.legend-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}

.chart-container {
  height: 500px;
  min-height: 400px;
  width: 100%;
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  box-sizing: border-box;
  visibility: hidden;
}

.chart-container.active {
  visibility: visible;
}

.time-series-chart,
.distribution-chart {
  width: 100%;
  height: 100%;
  min-height: 350px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.analysis-details {
  margin-top: 2rem;
}

.analysis-details h3 {
  margin-bottom: 1rem;
  color: #303133;
}

.uncertainty-factors {
  margin-top: 2rem;
}

.uncertainty-factors h4 {
  margin-bottom: 1rem;
  color: #303133;
}

.factor-progress {
  margin-bottom: 1rem;
}

.factor-label {
  font-size: 0.9rem;
  color: #606266;
  margin-left: 8px;
}

@media (max-width: 768px) {
  .globe-container {
    height: 350px;
  }

  .chart-container {
    height: 350px;
  }
}
</style>
