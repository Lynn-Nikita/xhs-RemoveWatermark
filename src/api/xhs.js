import request from './request.js'

// 用户相关API
export const userApi = {
  // 微信授权登录
  login(code) {
    return request({
      url: '/auth/login',
      method: 'POST',
      data: { code }
    })
  },

  // 获取用户信息
  getUserInfo() {
    return request({
      url: '/user/info',
      method: 'GET'
    })
  },

  // 获取会员状态
  getVipStatus() {
    return request({
      url: '/user/vip-status',
      method: 'GET'
    })
  },

  // 购买会员
  buyVip(packageId) {
    return request({
      url: '/user/buy-vip',
      method: 'POST',
      data: { packageId }
    })
  }
}

// 解析相关API
export const parseApi = {
  // 解析小红书链接
  parseXhs(url) {
    return request({
      url: '/parse/xhs',
      method: 'POST',
      data: { url },
      loading: true
    })
  },

  // 获取解析历史
  getHistory(page = 1, limit = 10) {
    return request({
      url: '/parse/history',
      method: 'GET',
      data: { page, limit }
    })
  },

  // 获取解析结果详情
  getResult(id) {
    return request({
      url: `/parse/result/${id}`,
      method: 'GET'
    })
  },

  // 批量下载
  batchDownload(resultId, items) {
    return request({
      url: '/parse/download',
      method: 'POST',
      data: { resultId, items }
    })
  }
}

// 支付相关API
export const payApi = {
  // 创建支付订单
  createOrder(packageId, payType = 'wechat') {
    return request({
      url: '/pay/create-order',
      method: 'POST',
      data: { packageId, payType }
    })
  },

  // 查询订单状态
  getOrderStatus(orderId) {
    return request({
      url: '/pay/order-status',
      method: 'GET',
      data: { orderId }
    })
  }
}
