import request from './request'

export async function useDayPrediction(startDate, imagePaths) {
  try {
    const response = await request.post('/api/predict/day', {
      start_date: startDate,
      image_paths: imagePaths
    })

    return response
  } catch (error) {
    console.error('Error fetching day predictions:', error)
    throw error
  }
}

export async function getDayPredictionResult(taskId) {
  try {
    const response = await request.get(`/api/predict/day/${taskId}`)
    return response
  } catch (error) {
    console.error('Error fetching day prediction result:', error)
    throw error
  }
}

export async function useMonthPrediction(startDate, imagePaths) {
  try {
    const response = await request.post('/api/predict/month', {
      start_date: startDate,
      image_paths: imagePaths
    })

    return response
  } catch (error) {
    console.error('Error fetching month predictions:', error)
    throw error
  }
}

export async function getMonthPredictionResult(taskId) {
  try {
    const response = await request.get(`/api/predict/month/${taskId}`)
    return response
  } catch (error) {
    console.error('Error fetching month prediction result:', error)
    throw error
  }
}

export async function useRealtimeDayPrediction() {
  try {
    const response = await request.get('/api/realtime/day')
    return response
  } catch (error) {
    console.error('Error fetching realtime day predictions:', error)
    return []
  }
}

export async function useRealtimeMonthPrediction() {
  try {
    const response = await request.get('/api/realtime/month')
    return response
  } catch (error) {
    console.error('Error fetching realtime month predictions:', error)
    return []
  }
}

export async function useDynamicsAnalysis(
  start_time,
  end_time,
  grad_type,
  grad_month,
  x1,
  y1,
  x2,
  y2
) {
  try {
    // 创建基本请求参数
    const params = {
      start_time: start_time,
      end_time: end_time,
      grad_type: grad_type,
      grad_month: grad_month
    }

    // 只有当所有坐标值都不为空时才添加到请求参数中
    if (x1 != null && y1 != null && x2 != null && y2 != null) {
      params.x1 = x1
      params.y1 = y1
      params.x2 = x2
      params.y2 = y2
    }

    const response = await request.post('/api/dynamics/analysis', params)
    return response
  } catch (error) {
    console.error('Error fetching dynamics analysis:', error)
    throw error
  }
}

export async function getDynamicsAnalysisResult(taskId) {
  try {
    const response = await request.get(`/api/dynamics/analysis/${taskId}`)
    return response
  } catch (error) {
    console.error('Error fetching dynamics analysis result:', error)
    throw error
  }
}

export async function useModelInterpreter(start_time, end_time, pred_gap, grad_type, position, variable) {
  try {
    const params = {
      start_time,
      end_time,
      pred_gap,
      grad_type
    }
    
    // 只有当position和variable有值时才添加到请求参数
    if (position) params.position = position
    if (variable) params.variable = variable

    const response = await request.post('/api/model/interpreter', params)
    return response
  } catch (error) {
    console.error('Error fetching model interpreter:', error)
    throw error
  }
}

export async function getModelInterpreter(taskId) {
  try {
    const response = await request.get(`/api/model/interpreter/${taskId}`)
    return response
  } catch (error) {
    console.error('Error fetching model interpreter result:', error)
    throw error
  }
}
