import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
    // baseURL: import.meta.env.VITE_APP_BASE_API,
    // baseURL: 'http://localhost:9000/seaice/',
    // baseURL: 'https://gfaliyun4.seaice.52lxy.one:8443/seaice/',
    baseURL: 'https://seaice.52lxy.one:20443/seaice/',
    timeout: 20000,
})

request.interceptors.request.use((config) => {
    // 1.获取用户相关的小仓库:获取仓库内部token,登录成功以后携带给服务器
    //const userStore = useUserStore()
    //if (userStore.token) {
    //config.headers.token = userStore.token
    //config配置对象,headers属性请求头,经常给服务器端携带公共参数
    //}

    // 2.也可在此处对是否有token进行拦截

    //返回配置对象，必须返回，否则发不出请求
    return config
})

request.interceptors.response.use(
    (response) => {
        // 服务器通常会返回标准格式: {success, message, data, status}
        const responseData = response.data

        // // 根据接口文档，处理任务状态
        // if (!responseData.success && responseData.status === 'IN_PROGRESS') {
        //     // 任务仍在进行中，不显示错误消息，交由调用方处理
        //     return responseData
        // }

        // // 如果请求成功但是任务失败，显示错误消息
        // if (!responseData.success && responseData.status === 'FAILED') {
        //     ElMessage.error(responseData.message || '任务执行失败')
        // }

        // 返回标准格式响应
        return responseData
    },
    (error) => {
        //失败回调:处理http网络错误
        let message = ''
        const status = error.response?.status

        switch (status) {
            case 404:
                message = '请求路径不存在'
                break
            case 500:
                message = '服务器内部错误'
                break
            default:
                message = '网络连接异常'
                break
        }

        // 显示错误消息
        ElMessage.error(message)

        // 构造一个与成功响应格式一致的错误对象
        const errorResponse = {
            success: false,
            message: message,
            status: 'FAILED',
            data: null,
            originalError: error
        }

        return Promise.reject(errorResponse)
    },
)

export default request