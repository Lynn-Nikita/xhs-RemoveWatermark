<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
    // 设置状态栏样式
    uni.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#ff6b6b'
    })
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style>
/* 全局样式 - 小红书风格 */

/* 重置默认样式 */
view, text, input, button, image, navigator, form, textarea, picker, switch, slider, checkbox, radio {
  box-sizing: border-box;
}

page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  line-height: 1.6;
}

/* 通用容器 */
.container {
  min-height: 100vh;
}

/* 按钮通用样式 */
.btn {
  border: none;
  border-radius: 20rpx;
  font-size: 28rpx;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn::after {
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  box-shadow: 0 8rpx 25rpx rgba(255, 107, 107, 0.3);
}

.btn-primary:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 15rpx rgba(255, 107, 107, 0.3);
}

.btn-secondary {
  background: #f8f9fa;
  color: #666;
  border: 2rpx solid #e9ecef;
}

.btn-secondary:active {
  background: #e9ecef;
}

.btn-ghost {
  background: transparent;
  color: #ff6b6b;
  border: 2rpx solid #ff6b6b;
}

.btn-ghost:active {
  background: rgba(255, 107, 107, 0.1);
}

/* 卡片样式 */
.card {
  background: white;
  border-radius: 25rpx;
  box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 30rpx;
}

.card-body {
  padding: 30rpx;
}

.card-header {
  padding: 30rpx 30rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.card-footer {
  padding: 0 30rpx 30rpx;
  border-top: 1rpx solid #f0f0f0;
}

/* 输入框样式 */
.input {
  width: 100%;
  height: 88rpx;
  border: 2rpx solid #f0f0f0;
  border-radius: 20rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  background: white;
  transition: border-color 0.3s ease;
}

.input:focus {
  border-color: #ff6b6b;
  outline: none;
}

.input-group {
  position: relative;
  margin-bottom: 30rpx;
}

.input-label {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 15rpx;
  font-weight: 500;
}

/* 文本样式 */
.text-primary {
  color: #ff6b6b;
}

.text-secondary {
  color: #666;
}

.text-muted {
  color: #999;
}

.text-success {
  color: #28a745;
}

.text-warning {
  color: #ffc107;
}

.text-danger {
  color: #dc3545;
}

.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

/* 字体大小 */
.text-xs {
  font-size: 20rpx;
}

.text-sm {
  font-size: 24rpx;
}

.text-base {
  font-size: 28rpx;
}

.text-lg {
  font-size: 32rpx;
}

.text-xl {
  font-size: 36rpx;
}

.text-2xl {
  font-size: 48rpx;
}

/* 字体粗细 */
.font-normal {
  font-weight: 400;
}

.font-medium {
  font-weight: 500;
}

.font-semibold {
  font-weight: 600;
}

.font-bold {
  font-weight: 700;
}

/* 间距 */
.m-0 { margin: 0; }
.m-1 { margin: 10rpx; }
.m-2 { margin: 20rpx; }
.m-3 { margin: 30rpx; }
.m-4 { margin: 40rpx; }

.mt-0 { margin-top: 0; }
.mt-1 { margin-top: 10rpx; }
.mt-2 { margin-top: 20rpx; }
.mt-3 { margin-top: 30rpx; }
.mt-4 { margin-top: 40rpx; }

.mb-0 { margin-bottom: 0; }
.mb-1 { margin-bottom: 10rpx; }
.mb-2 { margin-bottom: 20rpx; }
.mb-3 { margin-bottom: 30rpx; }
.mb-4 { margin-bottom: 40rpx; }

.ml-0 { margin-left: 0; }
.ml-1 { margin-left: 10rpx; }
.ml-2 { margin-left: 20rpx; }
.ml-3 { margin-left: 30rpx; }
.ml-4 { margin-left: 40rpx; }

.mr-0 { margin-right: 0; }
.mr-1 { margin-right: 10rpx; }
.mr-2 { margin-right: 20rpx; }
.mr-3 { margin-right: 30rpx; }
.mr-4 { margin-right: 40rpx; }

.p-0 { padding: 0; }
.p-1 { padding: 10rpx; }
.p-2 { padding: 20rpx; }
.p-3 { padding: 30rpx; }
.p-4 { padding: 40rpx; }

.pt-0 { padding-top: 0; }
.pt-1 { padding-top: 10rpx; }
.pt-2 { padding-top: 20rpx; }
.pt-3 { padding-top: 30rpx; }
.pt-4 { padding-top: 40rpx; }

.pb-0 { padding-bottom: 0; }
.pb-1 { padding-bottom: 10rpx; }
.pb-2 { padding-bottom: 20rpx; }
.pb-3 { padding-bottom: 30rpx; }
.pb-4 { padding-bottom: 40rpx; }

.pl-0 { padding-left: 0; }
.pl-1 { padding-left: 10rpx; }
.pl-2 { padding-left: 20rpx; }
.pl-3 { padding-left: 30rpx; }
.pl-4 { padding-left: 40rpx; }

.pr-0 { padding-right: 0; }
.pr-1 { padding-right: 10rpx; }
.pr-2 { padding-right: 20rpx; }
.pr-3 { padding-right: 30rpx; }
.pr-4 { padding-right: 40rpx; }

/* 布局 */
.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.flex-row {
  flex-direction: row;
}

.flex-wrap {
  flex-wrap: wrap;
}

.items-start {
  align-items: flex-start;
}

.items-center {
  align-items: center;
}

.items-end {
  align-items: flex-end;
}

.justify-start {
  justify-content: flex-start;
}

.justify-center {
  justify-content: center;
}

.justify-end {
  justify-content: flex-end;
}

.justify-between {
  justify-content: space-between;
}

.justify-around {
  justify-content: space-around;
}

.flex-1 {
  flex: 1;
}

.flex-auto {
  flex: auto;
}

.flex-none {
  flex: none;
}

/* 定位 */
.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.fixed {
  position: fixed;
}

/* 宽高 */
.w-full {
  width: 100%;
}

.h-full {
  height: 100%;
}

.w-screen {
  width: 100%;
}

.h-screen {
  height: 100%;
}

/* 圆角 */
.rounded-none {
  border-radius: 0;
}

.rounded-sm {
  border-radius: 10rpx;
}

.rounded {
  border-radius: 20rpx;
}

.rounded-lg {
  border-radius: 30rpx;
}

.rounded-xl {
  border-radius: 40rpx;
}

.rounded-full {
  border-radius: 50%;
}

/* 阴影 */
.shadow-sm {
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.shadow {
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.08);
}

.shadow-lg {
  box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.1);
}

.shadow-xl {
  box-shadow: 0 15rpx 35rpx rgba(0, 0, 0, 0.12);
}

/* 背景 */
.bg-primary {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.bg-white {
  background-color: white;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}

.bg-gray-200 {
  background-color: #e5e7eb;
}

/* 边框 */
.border {
  border: 1rpx solid #e5e7eb;
}

.border-t {
  border-top: 1rpx solid #e5e7eb;
}

.border-b {
  border-bottom: 1rpx solid #e5e7eb;
}

.border-l {
  border-left: 1rpx solid #e5e7eb;
}

.border-r {
  border-right: 1rpx solid #e5e7eb;
}

/* 透明度 */
.opacity-0 {
  opacity: 0;
}

.opacity-50 {
  opacity: 0.5;
}

.opacity-75 {
  opacity: 0.75;
}

.opacity-100 {
  opacity: 1;
}

/* 过渡动画 */
.transition {
  transition: all 0.3s ease;
}

.transition-fast {
  transition: all 0.15s ease;
}

.transition-slow {
  transition: all 0.5s ease;
}

/* 隐藏/显示 */
.hidden {
  display: none;
}

.block {
  display: block;
}

.inline {
  display: inline;
}

.inline-block {
  display: inline-block;
}

/* 溢出处理 */
.overflow-hidden {
  overflow: hidden;
}

.overflow-scroll {
  overflow: scroll;
}

.overflow-auto {
  overflow: auto;
}

/* 文本省略 */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.line-clamp-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* 小红书特色组件 */
.xhs-gradient {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.xhs-card {
  background: white;
  border-radius: 25rpx;
  box-shadow: 0 8rpx 25rpx rgba(255, 107, 107, 0.08);
  overflow: hidden;
}

.xhs-button {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border: none;
  border-radius: 20rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 25rpx rgba(255, 107, 107, 0.3);
  transition: all 0.3s ease;
}

.xhs-button:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 15rpx rgba(255, 107, 107, 0.3);
}

.xhs-input {
  border: 2rpx solid #f0f0f0;
  border-radius: 20rpx;
  background: white;
  transition: all 0.3s ease;
}

.xhs-input:focus {
  border-color: #ff6b6b;
  box-shadow: 0 0 0 6rpx rgba(255, 107, 107, 0.1);
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}

.animate-slideInUp {
  animation: slideInUp 0.3s ease-out;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 响应式设计 - 微信小程序兼容 */
/* 注意：微信小程序中媒体查询支持有限，建议使用条件编译 */
</style>
