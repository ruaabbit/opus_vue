import request from './request'

export async function useDayPrediction(startDate) {
    try {
        // Send request to backend API to fetch day predictions
        const response = await request.get('/day-prediction', {
            params: { startDate }
        })

        // Assuming the response has the structure: { data: [{path: '...', date: '...'}, ...] }
        const images = response.data
        return images
    } catch (error) {
        console.error("Error fetching day predictions:", error)
        return []
    }
}

export async function useMonthPrediction(startYear, startMonth) {
    try {
        // Send request to backend API to fetch month predictions
        const response = await request.get('/month-prediction', {
            params: { startYear, startMonth }
        })

        // Assuming the response has the structure: { data: [{path: '...', date: '...'}, ...] }
        const images = response.data
        return images
    } catch (error) {
        console.error("Error fetching month predictions:", error)
        return []
    }
}