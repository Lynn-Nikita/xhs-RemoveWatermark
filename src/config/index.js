// 应用配置文件

// 开发环境配置
const development = {
  // API基础地址
  API_BASE_URL: 'http://localhost:3000/api',
  
  // 微信小程序配置
  WECHAT_APPID: 'your-wechat-appid',
  
  // 调试模式
  DEBUG: true,
  
  // 请求超时时间
  REQUEST_TIMEOUT: 10000,
  
  // 上传文件大小限制 (MB)
  MAX_FILE_SIZE: 50
}

// 生产环境配置
const production = {
  // API基础地址
  API_BASE_URL: 'https://your-api-domain.com/api',
  
  // 微信小程序配置
  WECHAT_APPID: 'your-production-wechat-appid',
  
  // 调试模式
  DEBUG: false,
  
  // 请求超时时间
  REQUEST_TIMEOUT: 15000,
  
  // 上传文件大小限制 (MB)
  MAX_FILE_SIZE: 100
}

// 根据环境变量选择配置
const config = process.env.NODE_ENV === 'production' ? production : development

// 应用信息
config.APP_INFO = {
  name: '小红书去水印',
  version: '1.0.0',
  description: '一键免费下载小红书高清去水印原图、无水印原视频',
  author: 'XHS Team',
  contact: 'support@xhs-tool.com'
}

// 功能配置
config.FEATURES = {
  // 是否启用会员系统
  ENABLE_VIP: true,
  
  // 是否启用历史记录
  ENABLE_HISTORY: true,
  
  // 是否启用分享功能
  ENABLE_SHARE: true,
  
  // 是否启用推荐功能
  ENABLE_RECOMMEND: false,
  
  // 免费用户每日解析次数限制
  FREE_DAILY_LIMIT: 5,
  
  // VIP用户每日解析次数限制
  VIP_DAILY_LIMIT: 200
}

// 界面配置
config.UI = {
  // 主题色
  PRIMARY_COLOR: '#ff6b6b',
  SECONDARY_COLOR: '#ee5a24',
  
  // 默认头像
  DEFAULT_AVATAR: '/static/default-avatar.png',
  
  // Logo
  LOGO_URL: '/static/logo.png',
  
  // 是否显示底部导航
  SHOW_TAB_BAR: true,
  
  // 是否启用暗黑模式
  ENABLE_DARK_MODE: false
}

// 缓存配置
config.CACHE = {
  // 解析结果缓存时间 (分钟)
  PARSE_RESULT_TTL: 60,
  
  // 用户信息缓存时间 (分钟)
  USER_INFO_TTL: 30,
  
  // 历史记录缓存时间 (分钟)
  HISTORY_TTL: 1440, // 24小时
  
  // 最大缓存数量
  MAX_CACHE_SIZE: 100
}

// 安全配置
config.SECURITY = {
  // 请求签名密钥
  REQUEST_SECRET: 'your-request-secret-key',
  
  // Token有效期 (小时)
  TOKEN_EXPIRE_HOURS: 24,
  
  // 是否启用请求加密
  ENABLE_ENCRYPTION: false,
  
  // 允许的文件类型
  ALLOWED_FILE_TYPES: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov'],
  
  // 请求频率限制 (次/分钟)
  RATE_LIMIT: 60
}

// 第三方服务配置
config.SERVICES = {
  // 统计分析
  ANALYTICS: {
    enabled: true,
    appId: 'your-analytics-app-id'
  },
  
  // 错误监控
  ERROR_MONITORING: {
    enabled: true,
    dsn: 'your-sentry-dsn'
  },
  
  // 客服系统
  CUSTOMER_SERVICE: {
    enabled: true,
    contact: 'wechat-customer-service-id'
  }
}

export default config
