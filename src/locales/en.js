export default {
  // Application title and navigation
  app: {
    title: 'MetaICE: Foundation Model for Arctic Sea Ice Spatio-Temporal Multi-Scale Forecasting',
    subtitle:
      'MetaICE: Foundation Model for Arctic Sea Ice Spatio-Temporal Multi-Scale Forecasting',
    aboutUs: 'About Us',
    copyright: 'OUC AI GROUP 2025 Copyright by Ocean University of China AI Group'
  },

  // Menu items
  menu: {
    realTimeDailyForecast: 'Real-time Daily Forecast',
    realTimeMonthlyForecast: 'Real-time Monthly Forecast',
    dailyForecastTest: 'Daily Forecast Test',
    monthlyForecastTest: 'Monthly Forecast Test',
    uncertaintyAnalysis: 'Uncertainty Analysis',
    modelInterpreter: 'Daily Model Interpretability',
    dynamicsAnalysis: 'Monthly Dynamics Analysis'
  },

  // Image upload component
  imageUpload: {
    title: 'Image Upload',
    uploaded: 'Uploaded',
    uploadHint: 'Please upload {count} PNG format images',
    dateHint: 'The selected date will be used as the date for the first image',
    clickUpload: 'Click to Upload',
    onlyPNG: 'PNG format only',
    uploadComplete: 'Upload Complete',
    analyzing: 'Analyzing...',
    submitAnalysis: 'Submit Analysis',
    back: 'Back',
    selectDate: 'Select Date',
    noDate: 'No date set',
    uploadSuccess: 'Upload successful',
    uploadFailed: 'Upload failed',
    needMoreImages: 'Need to upload {count} more images',
    onlyPNGSupported: 'Only PNG files supported',
    limitReached: 'Reached limit of {count} images',
    selectedImages: 'Successfully selected {count} images',
    analyzingImages: 'Analyzing your images, please wait...',
    getPredictionSuccess: 'Prediction results obtained successfully',
    getPredictionFailed: 'Failed to get prediction results',
    submitRequestFailed: 'Failed to submit prediction request',
    requestTimeout: 'Request timeout, please check results later',
    noResults: 'No prediction results available',
    uploadToViewResults: 'Please upload images and select date to view prediction results',
    imagePreview: 'Image Preview'
  },

  // Cesium globe component
  globe: {
    loading: 'Loading images...',
    switching: 'Switching...',
    play: 'Play',
    pause: 'Pause',
    interval: 'Interval',
    seconds: 'seconds'
  },

  // Common buttons and actions
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    reset: 'Reset',
    submit: 'Submit',
    loading: 'Loading...',
    noData: 'No Data',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    developing: 'Under Development'
  },

  // Model Interpreter
  modelInterpreter: {
    dataRange: 'Data Range',
    selectStartDate: 'Select Start Date',
    selectEndDate: 'Select End Date',
    to: 'to',
    predictionInterval: 'Prediction Interval (Days)',
    predictionIntervalPlaceholder: 'Prediction interval days',
    analysisTarget: 'Analysis Target',
    mean: 'Mean',
    distribution: 'Distribution',
    selectedPosition: 'Selected Position',
    selectedVariable: 'Selected Variable',
    seaIceConcentration: 'Sea Ice Concentration (SIC)',
    seaIceUComponent: 'Sea Ice U Component (SI_U)',
    seaIceVComponent: 'Sea Ice V Component (SI_V)',
    temperature2m: '2m Temperature (T2M)',
    wind10mU: '10m U Wind (U10M)',
    wind10mV: '10m V Wind (V10M)',
    cancelSelection: 'Cancel Selection',
    analyzing: 'Analyzing...',
    submitAnalysis: 'Submit Analysis',
    startDateRange: 'Start date must be within 1979-2023 range',
    endDateRange: 'End date must be within 1979-2023 range',
    minimumDays: 'End date must be at least 13 days after start date',
    fillRequiredParams: 'Please fill in required analysis parameters',
    dateRangeError: 'Date range does not meet requirements',
    analysisComplete: 'Analysis completed',
    dataFormatError: 'Incorrect data format returned',
    taskProcessing: 'Task processing, continuing polling...',
    taskFailed: 'Task processing failed',
    getResultsFailed: 'Failed to get analysis results',
    submitRequestFailed: 'Failed to submit analysis request',
    submitRequestFailedRetry: 'Failed to submit analysis request, please retry'
  },

  // Dynamics Analysis
  dynamicsAnalysis: {
    startMonth: 'Start Month',
    endMonth: 'End Month',
    selectStartMonth: 'Select Start Month',
    selectEndMonth: 'Select End Month',
    forecastPeriod: 'Forecast Lead Time',
    forecastPeriodPlaceholder: 'Enter lead time (months)',
    targetMonth: 'Target Month',
    targetMonthPlaceholder: 'Target month determined by data range and forecast lead time',
    analysisRange: 'Analysis Range',
    analysisTarget: 'Analysis Target',
    seaIceArea: 'Sea Ice Area',
    seaIceVariation: 'Sea Ice Variation',
    analyzing: 'Analyzing...',
    submitAnalysis: 'Submit Analysis',
    fillCompleteParams: 'Please fill in complete analysis parameters',
    analysisComplete: 'Analysis completed',
    getResultsFailed: 'Failed to get analysis results',
    submitRequestFailed: 'Failed to submit analysis request',
    submitRequestFailedRetry: 'Failed to submit analysis request, please retry'
  },

  // Date formatting
  date: {
    format: 'YYYY-MM-DD',
    shortFormat: 'YYYY/MM/DD',
    selectDate: 'Select Date',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow'
  },

  // Arctic Sea Ice Viewer
  arcticSeaIceViewer: {
    altText: 'Arctic Sea Ice Prediction',
    tooltipText: 'Click image to enlarge',
    prevImage: 'Previous',
    nextImage: 'Next',
    resume: 'Resume',
    pause: 'Pause',
    playbackSpeed: 'Playback speed: {interval}s'
  },

  // Dynamics Analysis Viewer
  dynamicsAnalysisViewer: {
    title: 'Dynamics Analysis Results Heatmap',
    imageAlt: '{date} - Dynamics Analysis Result',
    noResults: 'No analysis results available',
    modalImageAlt: 'Enlarge'
  },

  // Image Selector
  imageSelector: {
    altText: 'Selectable Image',
    lastSelectionSize: 'Last Selection Size:',
    width: 'Width',
    height: 'Height',
    cornerCoordinates: 'Corner Coordinates:',
    topLeft: 'Top Left',
    topRight: 'Top Right',
    bottomLeft: 'Bottom Left',
    bottomRight: 'Bottom Right',
    clearSelection: 'Clear Selection'
  },

  // Model Interpreter Viewer
  modelInterpreterViewer: {
    title: 'Daily Model Interpretability Analysis Results Heatmap',
    imageAlt: 'Interpretability Analysis Result {index}',
    noResults: 'No analysis results available',
    modalImageAlt: 'Enlarge',
    imageLoadError: 'Image failed to load'
  }
}
