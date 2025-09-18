<template>
  <view class="container">
    <!-- 头部区域 -->
    <view class="header">
      <view class="logo-section">
        <image class="logo" src="/static/logo.png"></image>
        <view class="title-section">
          <text class="main-title">小红书去水印高清图片下载器</text>
          <text class="sub-title">一键免费下载小红书高清去水印原图、无水印原视频</text>
        </view>
      </view>
    </view>

    <!-- 输入区域 -->
    <view class="input-section">
      <view class="input-container">
        <input 
          class="url-input" 
          type="text" 
          :value="inputUrl"
          @input="onInputChange"
          placeholder="输入小红书分享链接，支持链接自动解析"
          placeholder-style="color: #999;"
        />
        <button 
          class="parse-btn" 
          :class="{ 'disabled': !canParse }"
          @click="startParse"
          :disabled="!canParse"
        >
          {{ parseStatus === 'parsing' ? '解析中...' : '开始解析' }}
        </button>
        
        <!-- 测试按钮 - 仅用于开发测试，正式环境需删除 -->
        <button class="test-btn" @click="openTestResult">
          🧪 测试解析结果页面
        </button>
      </view>
      
      <!-- 快捷操作 -->
      <view class="quick-actions">
        <button class="quick-btn" @click="pasteFromClipboard">
          <text class="icon">📋</text>
          <text>粘贴链接</text>
        </button>
        <button class="quick-btn" @click="showHistory">
          <text class="icon">📝</text>
          <text>历史记录</text>
        </button>
      </view>
    </view>


    <!-- 功能介绍 -->
    <view class="features">
      <view class="feature-item">
        <text class="feature-icon">🎨</text>
        <text class="feature-text">智能去水印</text>
      </view>
      <view class="feature-item">
        <text class="feature-icon">📱</text>
        <text class="feature-text">高清原图</text>
      </view>
      <view class="feature-item">
        <text class="feature-icon">⚡</text>
        <text class="feature-text">极速下载</text>
      </view>
      <view class="feature-item">
        <text class="feature-icon">🔒</text>
        <text class="feature-text">安全可靠</text>
      </view>
    </view>

    <!-- 历史记录弹窗 -->
    <view class="modal-overlay" v-if="showHistoryModal" @click="hideHistory">
      <view class="history-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">解析历史</text>
          <text class="close-btn" @click="hideHistory">✕</text>
        </view>
        <scroll-view class="history-list" scroll-y>
          <view 
            class="history-item" 
            v-for="item in historyList" 
            :key="item.id"
            @click="selectHistory(item)"
          >
            <image class="history-thumb" :src="item.thumbnail"></image>
            <view class="history-info">
              <text class="history-title">{{ item.title }}</text>
              <text class="history-time">{{ formatTime(item.createTime) }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import { parseApi, userApi } from '../../api/xhs.js'

export default {
  data() {
    return {
      inputUrl: '',
      parseStatus: 'idle', // idle, parsing, success, error
      canParse: false,
      showHistoryModal: false,
      historyList: []
    }
  },
  
  onLoad() {
    this.checkClipboard()
  },

  onShow() {
    // 页面显示时的逻辑
  },

  methods: {
    // 输入框变化
    onInputChange(e) {
      this.inputUrl = e.detail.value
      this.canParse = this.validateUrl(e.detail.value)
    },

    // 验证URL格式
    validateUrl(url) {
      const xhsPattern = /(xhslink|xiaohongshu)\.com|红书/
      return xhsPattern.test(url) && url.length > 10
    },

    // 开始解析
    async startParse() {
      if (!this.canParse || this.parseStatus === 'parsing') return

      try {
        this.parseStatus = 'parsing'
        const result = await parseApi.parseXhs(this.inputUrl)
        
        if (result.code === 0) {
          this.parseStatus = 'success'
          // 跳转到结果页面
          uni.navigateTo({
            url: `/pages/result/result?id=${result.data.id}`
          })
        } else {
          this.parseStatus = 'error'
          uni.showToast({
            title: result.message || '解析失败',
            icon: 'none'
          })
        }
      } catch (error) {
        this.parseStatus = 'error'
        console.error('解析失败:', error)
        uni.showToast({
          title: '解析失败，请重试',
          icon: 'none'
        })
      } finally {
        setTimeout(() => {
          this.parseStatus = 'idle'
        }, 2000)
      }
    },

    // 粘贴剪贴板内容
    async pasteFromClipboard() {
      try {
        const clipboardData = await uni.getClipboardData()
        if (clipboardData.data) {
          this.inputUrl = clipboardData.data
          this.canParse = this.validateUrl(clipboardData.data)
          uni.showToast({
            title: '链接已粘贴',
            icon: 'success'
          })
        }
      } catch (error) {
        console.error('粘贴失败:', error)
      }
    },

    // 检查剪贴板
    async checkClipboard() {
      try {
        const clipboardData = await uni.getClipboardData()
        if (clipboardData.data && this.validateUrl(clipboardData.data)) {
          uni.showModal({
            title: '发现小红书链接',
            content: '是否使用剪贴板中的链接？',
            success: (res) => {
              if (res.confirm) {
                this.inputUrl = clipboardData.data
                this.canParse = true
              }
            }
          })
        }
      } catch (error) {
        // 静默处理
      }
    },


    // 显示历史记录
    async showHistory() {
      try {
        const result = await parseApi.getHistory()
        if (result.code === 0) {
          this.historyList = result.data.list
          this.showHistoryModal = true
        }
      } catch (error) {
        console.error('获取历史记录失败:', error)
      }
    },

    // 隐藏历史记录
    hideHistory() {
      this.showHistoryModal = false
    },

    // 选择历史记录
    selectHistory(item) {
      this.inputUrl = item.url
      this.canParse = true
      this.hideHistory()
    },

    // 测试按钮 - 打开解析结果页面（仅用于开发测试）
    openTestResult() {
      // 使用模拟的结果ID跳转到解析结果页面
      const testResultId = 'test_result_' + Date.now()
      uni.navigateTo({
        url: `/pages/result/result?id=${testResultId}`
      })
    },

    // 格式化时间
    formatTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) {
        return '刚刚'
      } else if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`
      } else if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`
      } else {
        return `${Math.floor(diff / 86400000)}天前`
      }
    }
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  padding: 0 30rpx;
}

.header {
  padding-top: 80rpx;
  padding-bottom: 60rpx;
  text-align: center;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
}

.title-section {
  color: white;
}

.main-title {
  font-size: 48rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 20rpx;
}

.sub-title {
  font-size: 28rpx;
  opacity: 0.9;
  line-height: 1.4;
}

.input-section {
  background: white;
  border-radius: 30rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.1);
}

.input-container {
  margin-bottom: 30rpx;
}

.url-input {
  width: 100%;
  height: 88rpx;
  border: 2rpx solid #f0f0f0;
  border-radius: 20rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  margin-bottom: 30rpx;
  box-sizing: border-box;
}

.url-input:focus {
  border-color: #ff6b6b;
}

.parse-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  border-radius: 20rpx;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.parse-btn.disabled {
  background: #cccccc;
  color: #999999;
}

/* 测试按钮样式 - 仅用于开发测试 */
.test-btn {
  width: 100%;
  height: 70rpx;
  background: #f8f9fa;
  color: #6c757d;
  border: 2rpx dashed #dee2e6;
  border-radius: 15rpx;
  font-size: 26rpx;
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-actions {
  display: flex;
  gap: 20rpx;
}

.quick-btn {
  flex: 1;
  height: 80rpx;
  background: #f8f8f8;
  border: none;
  border-radius: 15rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  font-size: 26rpx;
  color: #666;
}

.icon {
  font-size: 30rpx;
}

.features {
  display: flex;
  background: white;
  border-radius: 25rpx;
  padding: 40rpx 20rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 25rpx rgba(0,0,0,0.08);
}

.feature-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15rpx;
}

.feature-icon {
  font-size: 40rpx;
}

.feature-text {
  font-size: 24rpx;
  color: #666;
}

/* 弹窗样式 */
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

.history-modal {
  background: white;
  border-radius: 30rpx;
  width: 90%;
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
}

.close-btn {
  font-size: 40rpx;
  color: #999;
}

.history-list {
  max-height: 60vh;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 25rpx 30rpx;
  border-bottom: 1rpx solid #f8f8f8;
}

.history-thumb {
  width: 80rpx;
  height: 80rpx;
  border-radius: 10rpx;
  margin-right: 20rpx;
}

.history-info {
  flex: 1;
}

.history-title {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-time {
  font-size: 24rpx;
  color: #999;
}
</style>
