<template>
  <view class="container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-header">
        <image 
          class="avatar" 
          :src="userInfo.avatar || '/static/default-avatar.png'"
          @click="chooseAvatar"
        ></image>
        <view class="user-details">
          <text class="username" v-if="userInfo.nickname">{{ userInfo.nickname }}</text>
          <text class="username guest" v-else>未登录用户</text>
          <view class="user-status">
            <view class="vip-badge" v-if="userInfo.isVip">
              <text class="vip-text">VIP</text>
            </view>
            <text class="status-text" v-if="userInfo.nickname">
              {{ userInfo.isVip ? 'VIP会员' : '普通用户' }}
            </text>
          </view>
        </view>
        <button 
          class="login-btn" 
          v-if="!userInfo.nickname"
          @click="login"
        >
          立即登录
        </button>
      </view>
    </view>

    <!-- 解析次数卡片 -->
    <view class="stats-card">
      <view class="stats-header">
        <text class="stats-title">解析统计</text>
        <text class="refresh-btn" @click="refreshUserInfo">刷新</text>
      </view>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-number">{{ userInfo.remainCount || 0 }}</text>
          <text class="stat-label">剩余次数</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ userInfo.usedCount || 0 }}</text>
          <text class="stat-label">已使用</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ userInfo.totalCount || 0 }}</text>
          <text class="stat-label">总计</text>
        </view>
      </view>
      
      <!-- 进度条 -->
      <view class="progress-section" v-if="userInfo.nickname">
        <view class="progress-info">
          <text class="progress-text">今日使用进度</text>
          <text class="progress-percent">{{ progressPercent }}%</text>
        </view>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
        </view>
      </view>
    </view>

    <!-- 会员订阅卡片 -->
    <view class="subscription-card">
      <view class="subscription-header">
        <view class="sub-info">
          <text class="sub-title">会员服务</text>
          <text class="sub-desc">解锁更多特权，享受无限解析</text>
        </view>
        <view class="crown-icon">👑</view>
      </view>
      
      <view class="features-list">
        <view class="feature-item">
          <text class="feature-icon">✨</text>
          <text class="feature-text">无限次数解析</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">🚀</text>
          <text class="feature-text">优先解析通道</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">🎯</text>
          <text class="feature-text">批量下载支持</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">💎</text>
          <text class="feature-text">高清无水印</text>
        </view>
      </view>

      <button 
        class="subscribe-btn" 
        :class="{ 'subscribed': userInfo.isVip }"
        @click="handleSubscription"
      >
        {{ userInfo.isVip ? '已开通会员' : '立即订阅' }}
      </button>
      
      <text class="vip-expire" v-if="userInfo.isVip && userInfo.vipExpireTime">
        会员到期时间：{{ formatDate(userInfo.vipExpireTime) }}
      </text>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-card">
      <view class="menu-item" @click="goToHistory">
        <view class="menu-left">
          <text class="menu-icon">📝</text>
          <text class="menu-text">解析历史</text>
        </view>
        <text class="menu-arrow">></text>
      </view>
      
      <view class="menu-item" @click="goToHelp">
        <view class="menu-left">
          <text class="menu-icon">❓</text>
          <text class="menu-text">使用帮助</text>
        </view>
        <text class="menu-arrow">></text>
      </view>
      
      <view class="menu-item" @click="contactService">
        <view class="menu-left">
          <text class="menu-icon">💬</text>
          <text class="menu-text">联系客服</text>
        </view>
        <text class="menu-arrow">></text>
      </view>
      
      <view class="menu-item" @click="shareApp">
        <view class="menu-left">
          <text class="menu-icon">📤</text>
          <text class="menu-text">分享应用</text>
        </view>
        <text class="menu-arrow">></text>
      </view>
    </view>

    <!-- 版本信息 -->
    <view class="version-info">
      <text class="version-text">小红书去水印 v1.0.0</text>
    </view>

    <!-- 登出按钮 -->
    <view class="logout-section" v-if="userInfo.nickname">
      <button class="logout-btn" @click="logout">退出登录</button>
    </view>

    <!-- 订阅套餐弹窗 -->
    <view class="modal-overlay" v-if="showSubscriptionModal" @click="hideSubscriptionModal">
      <view class="subscription-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">选择订阅套餐</text>
          <text class="close-btn" @click="hideSubscriptionModal">✕</text>
        </view>
        
        <view class="packages-list">
          <view 
            class="package-item" 
            v-for="(pkg, index) in subscriptionPackages" 
            :key="index"
            :class="{ 'selected': selectedPackage === index }"
            @click="selectPackage(index)"
          >
            <view class="package-header">
              <text class="package-name">{{ pkg.name }}</text>
              <view class="package-badge" v-if="pkg.popular">推荐</view>
            </view>
            <text class="package-desc">{{ pkg.description }}</text>
            <view class="package-price">
              <text class="price-current">¥{{ pkg.price }}</text>
              <text class="price-original" v-if="pkg.originalPrice">¥{{ pkg.originalPrice }}</text>
            </view>
            <text class="package-validity">{{ pkg.validity }}</text>
          </view>
        </view>
        
        <button class="pay-btn" @click="proceedPayment" :disabled="selectedPackage === -1">
          立即支付
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { userApi, payApi } from '../../api/xhs.js'

export default {
  data() {
    return {
      userInfo: {
        nickname: '',
        avatar: '',
        isVip: false,
        remainCount: 0,
        usedCount: 0,
        totalCount: 0,
        vipExpireTime: null
      },
      showSubscriptionModal: false,
      selectedPackage: -1,
      subscriptionPackages: [
        {
          name: '体验套餐',
          description: '10次解析机会',
          price: 9.9,
          originalPrice: null,
          validity: '永久有效',
          popular: false
        },
        {
          name: '标准套餐',
          description: '50次解析机会',
          price: 29.9,
          originalPrice: 49.9,
          validity: '永久有效',
          popular: true
        },
        {
          name: '超值套餐',
          description: '200次解析机会',
          price: 99.9,
          originalPrice: 199.9,
          validity: '永久有效',
          popular: false
        },
        {
          name: '无限套餐',
          description: '无限次解析',
          price: 199,
          originalPrice: 299,
          validity: '1个月',
          popular: false
        }
      ]
    }
  },

  computed: {
    progressPercent() {
      if (!this.userInfo.totalCount || this.userInfo.totalCount === 0) return 0
      return Math.round((this.userInfo.usedCount / this.userInfo.totalCount) * 100)
    }
  },

  onLoad() {
    this.getUserInfo()
  },

  onShow() {
    this.getUserInfo()
  },

  methods: {
    // 获取用户信息
    async getUserInfo() {
      try {
        const result = await userApi.getUserInfo()
        if (result.code === 0) {
          this.userInfo = result.data
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },

    // 刷新用户信息
    async refreshUserInfo() {
      uni.showLoading({ title: '刷新中...' })
      try {
        await this.getUserInfo()
        uni.showToast({
          title: '刷新成功',
          icon: 'success'
        })
      } catch (error) {
        uni.showToast({
          title: '刷新失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },

    // 微信登录
    async login() {
      try {
        uni.showLoading({ title: '登录中...' })
        
        const loginResult = await uni.login({
          provider: 'weixin'
        })
        
        if (loginResult[1].code) {
          const result = await userApi.login(loginResult[1].code)
          if (result.code === 0) {
            uni.setStorageSync('token', result.data.token)
            this.userInfo = result.data.userInfo
            uni.showToast({
              title: '登录成功',
              icon: 'success'
            })
          }
        }
      } catch (error) {
        console.error('登录失败:', error)
        uni.showToast({
          title: '登录失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },

    // 退出登录
    logout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('token')
            this.userInfo = {
              nickname: '',
              avatar: '',
              isVip: false,
              remainCount: 0,
              usedCount: 0,
              totalCount: 0,
              vipExpireTime: null
            }
            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            })
          }
        }
      })
    },

    // 选择头像
    chooseAvatar() {
      if (!this.userInfo.nickname) {
        this.login()
        return
      }
      
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          // 这里可以上传头像到服务器
          this.userInfo.avatar = res.tempFilePaths[0]
          uni.showToast({
            title: '头像已更新',
            icon: 'success'
          })
        }
      })
    },

    // 处理订阅
    handleSubscription() {
      if (this.userInfo.isVip) {
        uni.showToast({
          title: '您已是VIP会员',
          icon: 'none'
        })
        return
      }
      
      if (!this.userInfo.nickname) {
        uni.showModal({
          title: '提示',
          content: '请先登录后再订阅',
          success: (res) => {
            if (res.confirm) {
              this.login()
            }
          }
        })
        return
      }
      
      this.showSubscriptionModal = true
    },

    // 隐藏订阅弹窗
    hideSubscriptionModal() {
      this.showSubscriptionModal = false
      this.selectedPackage = -1
    },

    // 选择套餐
    selectPackage(index) {
      this.selectedPackage = index
    },

    // 进行支付
    async proceedPayment() {
      if (this.selectedPackage === -1) return
      
      const selectedPkg = this.subscriptionPackages[this.selectedPackage]
      
      try {
        uni.showLoading({ title: '创建订单中...' })
        
        const result = await payApi.createOrder(this.selectedPackage, 'wechat')
        if (result.code === 0) {
          // 调用微信支付
          uni.requestPayment({
            provider: 'wxpay',
            timeStamp: result.data.timeStamp,
            nonceStr: result.data.nonceStr,
            package: result.data.package,
            signType: result.data.signType,
            paySign: result.data.paySign,
            success: (res) => {
              uni.showToast({
                title: '支付成功',
                icon: 'success'
              })
              this.hideSubscriptionModal()
              this.getUserInfo() // 刷新用户信息
            },
            fail: (err) => {
              uni.showToast({
                title: '支付失败',
                icon: 'none'
              })
            }
          })
        }
      } catch (error) {
        console.error('支付失败:', error)
        uni.showToast({
          title: '支付失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },

    // 跳转到历史记录
    goToHistory() {
      uni.navigateTo({
        url: '/pages/history/history'
      })
    },

    // 跳转到帮助页面
    goToHelp() {
      uni.navigateTo({
        url: '/pages/help/help'
      })
    },

    // 联系客服
    contactService() {
      uni.showModal({
        title: '联系客服',
        content: '请添加微信客服：xhs-service',
        confirmText: '复制微信号',
        success: (res) => {
          if (res.confirm) {
            uni.setClipboardData({
              data: 'xhs-service',
              success: () => {
                uni.showToast({
                  title: '微信号已复制',
                  icon: 'success'
                })
              }
            })
          }
        }
      })
    },

    // 分享应用
    shareApp() {
      uni.share({
        provider: 'weixin',
        scene: 'WXSenceSession',
        type: 0,
        title: '小红书去水印工具',
        summary: '一键免费下载小红书高清去水印原图、无水印原视频',
        imageUrl: '/static/logo.png'
      })
    },

    // 格式化日期
    formatDate(timestamp) {
      const date = new Date(timestamp)
      return date.toLocaleDateString('zh-CN')
    }
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 30rpx;
  padding-bottom: 120rpx; /* 为底部导航栏留空间 */
}

/* 用户信息卡片 */
.user-card {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  border-radius: 30rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 30rpx;
  color: white;
}

.user-header {
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  border: 6rpx solid rgba(255,255,255,0.3);
  margin-right: 30rpx;
}

.user-details {
  flex: 1;
}

.username {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  display: block;
}

.username.guest {
  opacity: 0.8;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.vip-badge {
  background: linear-gradient(135deg, #ffd700, #ffb347);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 20rpx;
  font-weight: bold;
}

.vip-text {
  color: white;
}

.status-text {
  font-size: 26rpx;
  opacity: 0.9;
}

.login-btn {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 2rpx solid rgba(255,255,255,0.3);
  border-radius: 25rpx;
  padding: 20rpx 30rpx;
  font-size: 28rpx;
  font-weight: bold;
  backdrop-filter: blur(10rpx);
}

/* 统计卡片 */
.stats-card {
  background: white;
  border-radius: 25rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 25rpx rgba(0,0,0,0.08);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.stats-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.refresh-btn {
  font-size: 26rpx;
  color: #ff6b6b;
  padding: 10rpx;
}

.stats-grid {
  display: flex;
  margin-bottom: 30rpx;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #ff6b6b;
  display: block;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

.progress-section {
  border-top: 1rpx solid #f0f0f0;
  padding-top: 30rpx;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.progress-text {
  font-size: 26rpx;
  color: #666;
}

.progress-percent {
  font-size: 26rpx;
  color: #ff6b6b;
  font-weight: bold;
}

.progress-bar {
  height: 8rpx;
  background: #f0f0f0;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  transition: width 0.3s ease;
}

/* 订阅卡片 */
.subscription-card {
  background: white;
  border-radius: 25rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 25rpx rgba(0,0,0,0.08);
}

.subscription-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.sub-info {
  flex: 1;
}

.sub-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.sub-desc {
  font-size: 24rpx;
  color: #666;
}

.crown-icon {
  font-size: 60rpx;
}

.features-list {
  margin-bottom: 30rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.feature-icon {
  font-size: 30rpx;
  margin-right: 15rpx;
}

.feature-text {
  font-size: 28rpx;
  color: #333;
}

.subscribe-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  border-radius: 20rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.subscribe-btn.subscribed {
  background: #28a745;
}

.vip-expire {
  font-size: 24rpx;
  color: #666;
  text-align: center;
}

/* 功能菜单 */
.menu-card {
  background: white;
  border-radius: 25rpx;
  overflow: hidden;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 25rpx rgba(0,0,0,0.08);
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f8f8f8;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-left {
  display: flex;
  align-items: center;
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.menu-text {
  font-size: 28rpx;
  color: #333;
}

.menu-arrow {
  font-size: 28rpx;
  color: #ccc;
}

/* 版本信息 */
.version-info {
  text-align: center;
  margin-bottom: 30rpx;
}

.version-text {
  font-size: 24rpx;
  color: #999;
}

/* 登出按钮 */
.logout-section {
  margin-bottom: 30rpx;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  background: #f8f8f8;
  color: #666;
  border: none;
  border-radius: 20rpx;
  font-size: 28rpx;
}

/* 订阅弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.subscription-modal {
  background: white;
  border-radius: 30rpx;
  width: 90%;
  max-width: 600rpx;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  font-size: 40rpx;
  color: #999;
  padding: 10rpx;
}

.packages-list {
  padding: 30rpx;
  max-height: 500rpx;
  overflow-y: scroll;
}

.package-item {
  border: 2rpx solid #f0f0f0;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  transition: all 0.3s ease;
}

.package-item.selected {
  border-color: #ff6b6b;
  background: rgba(255, 107, 107, 0.05);
}

.package-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.package-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.package-badge {
  background: #ff6b6b;
  color: white;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-size: 20rpx;
}

.package-desc {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 15rpx;
  display: block;
}

.package-price {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 10rpx;
}

.price-current {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.price-original {
  font-size: 24rpx;
  color: #999;
  text-decoration: line-through;
}

.package-validity {
  font-size: 22rpx;
  color: #999;
}

.pay-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  border-radius: 20rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin: 0 30rpx 30rpx;
  width: calc(100% - 60rpx);
}

.pay-btn:disabled {
  background: #cccccc;
  color: #999;
}
</style>
