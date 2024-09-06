export function useDayPrediction(startDate) {
    const days = 7
    const images = []
    let currentDate = new Date(startDate)
    let currentDate_fake = new Date('2019-09-15')

    for (let i = 0; i < days; i++) {
        const dateStr_fake = currentDate_fake.toLocaleDateString('af', { timeZone: 'Asia/Shanghai' }).replaceAll('-', '')

        images.push({
            path: `picture/arctic-sea-ice/${currentDate_fake.getFullYear()}0915-${currentDate_fake.getFullYear()}0928/${dateStr_fake}.png`,
            date: currentDate.toLocaleDateString('af', { timeZone: 'Asia/Shanghai' }).slice(0, 10)
        })
        currentDate.setDate(currentDate.getDate() + 1)
        currentDate_fake.setDate(currentDate_fake.getDate() + 1)
    }

    return images

}

export function useMonthPrediction(startYear, startMonth) {
    const months = 6
    const year_fake = '2019'
    const startMonth_fake = '0'
    const images = []

    for (let i = 0; i < months; i++) {
        const currentMonth = (startMonth + i) % 12
        const currentYear = currentMonth < startMonth ? startYear + 1 : startYear
        const currentMonth_fake = (startMonth_fake + i) % 12
        const currentYear_fake = currentMonth_fake < startMonth_fake ? year_fake + 1 : year_fake
        images.push({
            path: `picture/arctic-sea-ice/${currentYear_fake}01-${currentYear_fake}12/${currentYear_fake}${(currentMonth_fake + 1).toString().padStart(2, '0')}.png`,
            date: new Date(currentYear, currentMonth).toLocaleDateString('af', { timeZone: 'Asia/Shanghai' }).slice(0, 7)
        })
    }

    return images

}