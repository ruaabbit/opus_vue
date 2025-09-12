export default {
  // 应用标题和导航
  app: {
    title: '“寒冰”北极海冰时空多尺度预报基础模型',
    subtitle:
      'Foundation Model for Arctic Sea Ice Spatio-Temporal Multi-Scale Forecasting',
    aboutUs: '关于我们',
    copyright: 'OUC AI Lab 2025 Copyright by 中国海洋大学人工智能研究院'
  },

  // 菜单项
  menu: {
    realTimeDailyForecast: '实时逐日预报',
    realTimeMonthlyForecast: '实时逐月预报',
    dailyForecastTest: '逐日预报测试',
    monthlyForecastTest: '逐月预报测试',
    uncertaintyAnalysis: '不确定性分析',
    modelInterpreter: '逐日模型可解释性',
    dynamicsAnalysis: '逐月动力学分析'
  },

  // 图片上传组件
  imageUpload: {
    title: '图片上传',
    uploaded: '已上传',
    uploadHint: '请上传{count}张PNG格式图片',
    dateHint: '选择的日期将作为第一张图片的日期',
    clickUpload: '点击上传',
    onlyPNG: '仅支持PNG格式',
    uploadComplete: '上传完成',
    analyzing: '分析中...',
    submitAnalysis: '提交分析',
    back: '返回',
    selectDate: '选择日期',
    noDate: '未设置日期',
    uploadSuccess: '上传成功',
    uploadFailed: '上传失败',
    needMoreImages: '还需上传{count}张图片',
    onlyPNGSupported: '仅支持PNG文件',
    limitReached: '已达到{count}张图片上限',
    selectedImages: '已成功选择{count}张图片',
    analyzingImages: '正在分析您的图片，请稍候...',
    getPredictionSuccess: '获取预测结果成功',
    getPredictionFailed: '获取预测结果失败',
    submitRequestFailed: '提交预测请求失败',
    requestTimeout: '请求超时，请稍后查看结果',
    noResults: '暂无预测结果',
    uploadToViewResults: '请上传图片并选择日期以查看预测结果',
    imagePreview: '图片预览'
  },

  // Cesium 地球组件
  globe: {
    loading: '图片加载中...',
    switching: '切换中...',
    play: '播放',
    pause: '暂停',
    interval: '间隔',
    seconds: '秒'
  },

  // 通用按钮和操作
  common: {
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    search: '搜索',
    reset: '重置',
    submit: '提交',
    loading: '加载中...',
    noData: '暂无数据',
    error: '错误',
    success: '成功',
    warning: '警告',
    info: '信息',
    developing: '正在开发中'
  },

  // 模型解释器
  modelInterpreter: {
    dataRange: '数据范围',
    selectStartDate: '选择开始日期',
    selectEndDate: '选择结束日期',
    to: '至',
    predictionInterval: '预测间隔(天)',
    predictionIntervalPlaceholder: '预测间隔天数',
    analysisTarget: '分析目标',
    mean: '均值',
    distribution: '分布',
    selectedPosition: '选定位置',
    selectedVariable: '选定变量',
    seaIceConcentration: '海冰密集度(SIC)',
    seaIceUComponent: '海冰U分量(SI_U)',
    seaIceVComponent: '海冰V分量(SI_V)',
    temperature2m: '2米温度(T2M)',
    wind10mU: '10米U风(U10M)',
    wind10mV: '10米V风(V10M)',
    cancelSelection: '取消选择',
    analyzing: '分析中...',
    submitAnalysis: '提交分析',
    startDateRange: '开始日期必须在1979-2023范围内',
    endDateRange: '结束日期必须在1979-2023范围内',
    minimumDays: '结束日期至少需要比开始日期晚13天',
    fillRequiredParams: '请填写必填的分析参数',
    dateRangeError: '日期范围不符合要求',
    analysisComplete: '分析完成',
    dataFormatError: '返回数据格式不正确',
    taskProcessing: '任务处理中，继续轮询...',
    taskFailed: '任务处理失败',
    getResultsFailed: '获取分析结果失败',
    submitRequestFailed: '提交分析请求失败',
    submitRequestFailedRetry: '提交分析请求失败，请重试'
  },

  // 动力学分析
  dynamicsAnalysis: {
    startMonth: '开始月份',
    endMonth: '结束月份',
    selectStartMonth: '选择开始月份',
    selectEndMonth: '选择结束月份',
    forecastPeriod: '预报提前期',
    forecastPeriodPlaceholder: '请输入提前期（月）',
    targetMonth: '目标月份',
    targetMonthPlaceholder: '目标月份由数据范围和预报提前期决定',
    analysisRange: '分析范围',
    analysisTarget: '分析目标',
    seaIceArea: '海冰面积',
    seaIceVariation: '海冰变化',
    analyzing: '分析中...',
    submitAnalysis: '提交分析',
    fillCompleteParams: '请填写完整的分析参数',
    analysisComplete: '分析完成',
    taskFailed: '分析任务失败',
    getResultsFailed: '获取分析结果失败',
    submitRequestFailed: '提交分析请求失败',
    submitRequestFailedRetry: '提交分析请求失败，请重试'
  },

  // 日期格式化
  date: {
    format: 'YYYY年MM月DD日',
    shortFormat: 'YYYY/MM/DD',
    selectDate: '选择日期',
    today: '今天',
    yesterday: '昨天',
    tomorrow: '明天'
  },

  // 北极海冰查看器
  arcticSeaIceViewer: {
    altText: '北极海冰预测',
    tooltipText: '点击图片可以放大查看',
    prevImage: '上一张',
    nextImage: '下一张',
    resume: '点击继续',
    pause: '点击暂停',
    playbackSpeed: '图片播放速度: {interval}s'
  },

  // 动力学分析查看器
  dynamicsAnalysisViewer: {
    title: '动力学分析结果热图',
    imageAlt: '{date} - 动力学分析结果',
    noResults: '暂无分析结果',
    modalImageAlt: '放大查看'
  },

  // 图片选择器
  imageSelector: {
    altText: '可选图片',
    lastSelectionSize: '最后选择区域尺寸:',
    width: '宽度',
    height: '高度',
    cornerCoordinates: '角坐标:',
    topLeft: '左上',
    topRight: '右上',
    bottomLeft: '左下',
    bottomRight: '右下',
    clearSelection: '清除选择'
  },

  // 模型解释器查看器
  modelInterpreterViewer: {
    title: '逐日模型可解释性分析结果热图',
    imageAlt: '可解释性分析结果 {index}',
    noResults: '暂无分析结果',
    modalImageAlt: '放大查看',
    imageLoadError: '图片加载失败'
  }
}
