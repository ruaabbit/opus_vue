import request from './request'

export async function useDayPrediction(startDate, imagePaths) {
  try {
    // Send request to backend API to fetch day predictions
    const response = await request.post('/day-prediction', {
      data: {
        start_date: startDate,
        image_paths: imagePaths
      }
    })

    return response.data
  } catch (error) {
    console.error('Error fetching day predictions:', error)
    throw error
  }
}

export async function useMonthPrediction(startDate, imagePaths) {
  try {
    // Send request to backend API to fetch month predictions
    const response = await request.post('/month-prediction', {
      data: {
        start_date: startDate,
        image_paths: imagePaths
      }
    })

    return response.data
  } catch (error) {
    console.error('Error fetching month predictions:', error)
    throw error
  }
}

export async function getDayPredictionResult(taskId) {
  try {
    const response = await request.get(`/day-prediction/${taskId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching day prediction result:', error)
    throw error
  }
}

export async function getMonthPredictionResult(taskId) {
  try {
    const response = await request.get(`/month-prediction/${taskId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching month prediction result:', error)
    throw error
  }
}

export async function useRealtimeMonthPrediction() {
  try {
    const response = await request.get('/realtime-month-prediction')
    const data = response.data
    return data
  } catch (error) {
    console.error('Error fetching realtime month predictions:', error)
    return []
  }
}

export async function useRealtimeDayPrediction() {
  try {
    const response = await request.get('/realtime-day-prediction')
    const data = response.data
    return data
  } catch (error) {
    console.error('Error fetching realtime day predictions:', error)
    return []
  }
}

export async function useDynamicsAnalysis(start_time, end_time, grad_type, grad_month) {
  try {
    const response = await request.post('/dynamics-analysis', {
      data: {
        start_time: start_time,
        end_time: end_time,
        grad_type: grad_type,
        grad_month: grad_month
      }
    })
    const data = response.data
    return data
  } catch (error) {
    console.error('Error fetching dynamics analysis:', error)
    return []
  }
}
