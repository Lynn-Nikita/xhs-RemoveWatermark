import config from '../config/index.js'

// API请求基础配置
const BASE_URL = config.API_BASE_URL

// 请求拦截器
const request = (options) => {
  return new Promise((resolve, reject) => {
    // 显示加载提示
    if (options.loading !== false) {
      uni.showLoading({
        title: '加载中...',
        mask: true
      })
    }

    // 获取token
    const token = uni.getStorageSync('token')
    
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        uni.hideLoading()
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            uni.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            })
            reject(res.data)
          }
        } else {
          uni.showToast({
            title: '网络请求失败',
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        uni.hideLoading()
        uni.showToast({
          title: '网络连接失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

export default request
