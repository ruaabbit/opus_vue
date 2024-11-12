import request from './request'

export async function useDayPrediction(startDate, imagePaths) {
    try {
        // Send request to backend API to fetch day predictions
        const response = await request.post('/day-prediction', {
            data: {
                'start_date': startDate,
                'image_paths': imagePaths
            }
        })

        // Assuming the response has the structure: { data: [{path: '...', date: '...'}, ...] }
        const images = response.data
        return images
    } catch (error) {
        console.error("Error fetching day predictions:", error)
        return []
    }
}

export async function useMonthPrediction(startDate, imagePaths) {
    try {
        // Send request to backend API to fetch day predictions
        const response = await request.post('/month-prediction', {
            data: {
                'start_date': startDate,
                'image_paths': imagePaths
            }
        })

        // Assuming the response has the structure: { data: [{path: '...', date: '...'}, ...] }
        const images = response.data
        return images
    } catch (error) {
        console.error("Error fetching day predictions:", error)
        return []
    }
}