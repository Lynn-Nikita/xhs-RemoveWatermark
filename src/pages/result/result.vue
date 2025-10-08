<template>
  <view class="container">
    <!-- 头部导航 -->
    <view class="header">
      <view class="nav-bar">
        <text class="back-btn" @click="goBack">← 返回</text>
        <text class="nav-title">解析结果</text>
        <text class="share-btn" @click="shareResult">分享</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-container" v-if="loading">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在获取解析结果...</text>
    </view>

    <!-- 解析结果内容 -->
    <view class="content" v-else-if="resultData">
      <!-- 基本信息 -->
      <view class="info-card">
        <view class="post-info">
          <text class="post-title">{{ resultData.title }}</text>
          <text class="post-desc" v-if="resultData.description">{{ resultData.description }}</text>
          <view class="post-meta">
            <text class="author">@{{ resultData.author }}</text>
            <text class="publish-time">{{ formatTime(resultData.publishTime) }}</text>
          </view>
        </view>
      </view>

      <!-- 媒体内容 -->
      <view class="media-section">
        <!-- 图片列表 -->
        <view class="images-container" v-if="resultData.images && resultData.images.length > 0">
          <text class="section-title">图片内容 ({{ resultData.images.length }}张)</text>
          <view class="images-grid">
            <view 
              class="image-item" 
              v-for="(image, index) in resultData.images" 
              :key="index"
              @click="previewImage(index)"
            >
              <image 
                class="image-thumb" 
                :src="image.thumbnail || image.url"
                mode="aspectFill"
              />
              <view class="image-overlay">
                <text class="image-size">{{ image.width }}×{{ image.height }}</text>
                <view class="image-actions">
                  <view 
                    class="checkbox-container" 
                    @click.stop="toggleImageSelection(index)"
                  >
                    <view 
                      class="checkbox-circle"
                      :class="{ 'checked': selectedItems.has(`image_${index}`) }"
                    >
                      <text class="checkbox-icon" v-if="selectedItems.has(`image_${index}`)">✓</text>
                    </view>
                  </view>
                  <button class="action-btn download" @click.stop="downloadImage(image, index)">
                    <text class="btn-icon">⬇</text>
                  </button>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 视频内容 -->
        <view class="video-container" v-if="resultData.videos && resultData.videos.length > 0">
          <text class="section-title">视频内容 ({{ resultData.videos.length }}个)</text>
          <view class="video-item" v-for="(video, index) in resultData.videos" :key="index">
            <video 
              :src="video.url" 
              :poster="resultData.images?.[0]?.url || ''"
              controls 
              show-center-play-btn
              class="video-player"
              preload="metadata"
              crossorigin="anonymous"
              @error="handleVideoError"
              @loadstart="handleVideoLoadStart"
              @canplay="handleVideoCanPlay"
              @loadeddata="handleVideoLoadedData"
              @loadedmetadata="handleVideoLoadedMetadata"
              @waiting="handleVideoWaiting"
              @playing="handleVideoPlaying"
              @pause="handleVideoPause"
              @ended="handleVideoEnded"
              @stalled="handleVideoStalled"
              @suspend="handleVideoSuspend"
              @abort="handleVideoAbort"
              @emptied="handleVideoEmptied"
            >
              <source :src="video.url" type="video/mp4">
              您的浏览器不支持视频播放
            </video>
            <view class="video-info">
              <text class="video-duration">时长: {{ formatDuration(video.duration) }}</text>
              <text class="video-size">{{ video.width }}×{{ video.height }}</text>
              <text class="video-type">格式: {{ video.type }}</text>
            </view>
            <view class="video-actions">
              <view 
                class="checkbox-container" 
                @click="toggleVideoSelection(index)"
              >
                <view 
                  class="checkbox-circle"
                  :class="{ 'checked': selectedItems.has(`video_${index}`) }"
                >
                  <text class="checkbox-icon" v-if="selectedItems.has(`video_${index}`)">✓</text>
                </view>
              </view>
              <button class="download-video-btn" @click="downloadVideo(video, index)">
                <text class="btn-text">下载视频</text>
              </button>
            </view>
          </view>
        </view>
      </view>

      <!-- 批量操作 -->
      <view class="batch-actions" v-if="hasMedia">
        <view class="select-actions">
          <button class="select-btn" @click="selectAll" :class="{ active: isAllSelected }">
            {{ isAllSelected ? '取消全选' : '全选' }}
          </button>
          <text class="select-count">已选择 {{ selectedCount }} 项</text>
        </view>
        
        <view class="download-options">
          <button class="quality-btn" @click="setQuality('original')" :class="{ active: downloadQuality === 'original' }">
            原图质量
          </button>
          <button class="quality-btn" @click="setQuality('compressed')" :class="{ active: downloadQuality === 'compressed' }">
            压缩质量
          </button>
        </view>

        <button 
          class="batch-download-btn" 
          @click="batchDownload"
          :disabled="selectedCount === 0"
          :class="{ disabled: selectedCount === 0 }"
        >
          <text class="btn-text">批量下载 ({{ selectedCount }})</text>
        </button>
      </view>

      <!-- 文案内容 -->
      <view class="text-content" v-if="resultData.content">
        <text class="section-title">文案内容</text>
        <view class="content-text">
          <text class="content-body">{{ resultData.content }}</text>
          <button class="copy-btn" @click="copyContent">复制文案</button>
        </view>
      </view>
    </view>

    <!-- 错误状态 -->
    <view class="error-container" v-else-if="error">
      <view class="error-icon">😵</view>
      <text class="error-title">获取结果失败</text>
      <text class="error-message">{{ error }}</text>
      <button class="retry-btn" @click="loadResult">重试</button>
    </view>

    <!-- 下载进度弹窗 -->
    <view class="modal-overlay" v-if="showDownloadModal">
      <view class="download-modal">
        <view class="modal-header">
          <text class="modal-title">下载进度</text>
        </view>
        <view class="download-progress">
          <view class="progress-item" v-for="(item, index) in downloadProgress" :key="index">
            <text class="progress-name">{{ item.name }}</text>
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: item.progress + '%' }"></view>
            </view>
            <text class="progress-text">{{ item.progress }}%</text>
          </view>
        </view>
        <button class="close-modal-btn" @click="closeDownloadModal" v-if="downloadCompleted">
          完成
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { parseApi } from '../../api/xhs.js'

export default {
  data() {
    return {
      resultId: '',
      resultData: null,
      loading: true,
      error: '',
      selectedItems: new Set(),
      downloadQuality: 'original', // original, compressed
      showDownloadModal: false,
      downloadProgress: [],
      downloadCompleted: false
    }
  },

  computed: {
    hasMedia() {
      return (this.resultData?.images?.length > 0) || (this.resultData?.videos?.length > 0)
    },

    selectedCount() {
      return this.selectedItems.size
    },

    isAllSelected() {
      if (!this.hasMedia) return false
      const totalCount = (this.resultData?.images?.length || 0) + (this.resultData?.videos?.length || 0)
      return this.selectedItems.size === totalCount
    }
  },

  onLoad(options) {
    this.resultId = options.id
    
    // 检查是否为测试模式
    if (this.resultId && this.resultId.startsWith('test_result_')) {
      this.loadTestData()
    } else {
      this.loadResult()
    }
  },

  methods: {
    // 加载测试数据（仅用于开发测试）
    loadTestData() {
      this.loading = true
      
      // 模拟加载时间
      setTimeout(() => {
        this.resultData = {
          id: this.resultId,
          title: '🌸 春日穿搭分享 | 温柔系少女风',
          description: '今天分享一套超级温柔的春日穿搭～粉色系的搭配真的太适合春天了！姐妹们觉得怎么样呀？',
          author: '小仙女lily',
          publishTime: Date.now() - 2 * 60 * 60 * 1000, // 2小时前
          content: '🌸 春日穿搭分享 | 温柔系少女风\n\n今天分享一套超级温柔的春日穿搭～\n\n上衣：粉色针织开衫 @某宝店铺\n下装：白色百褶裙 \n鞋子：小白鞋\n配饰：珍珠耳环\n\n粉色系的搭配真的太适合春天了！\n温柔又减龄，姐妹们觉得怎么样呀？\n\n#春日穿搭 #温柔系 #少女风 #OOTD',
          images: [
            {
              url: '/static/logo.png', // 使用项目中的logo作为测试图片
              thumbnail: '/static/logo.png',
              width: 1080,
              height: 1440
            },
            {
              url: '/static/logo.png',
              thumbnail: '/static/logo.png', 
              width: 1080,
              height: 1440
            },
            {
              url: '/static/logo.png',
              thumbnail: '/static/logo.png',
              width: 1080,
              height: 1350
            }
          ],
          video: null // 这个例子不包含视频
        }
        
        this.loading = false
        this.initializeSelection()
        
        // 显示测试提示
        uni.showToast({
          title: '测试数据加载完成',
          icon: 'success',
          duration: 2000
        })
      }, 1000) // 模拟1秒加载时间
    },

    // 加载解析结果
    async loadResult() {
      try {
        this.loading = true
        this.error = ''
        
        const result = await parseApi.getResult(this.resultId)
        if (result.code === 0) {
          this.resultData = result.data
          this.initializeSelection()
        } else {
          this.error = result.message || '获取结果失败'
        }
      } catch (error) {
        this.error = '网络请求失败'
        console.error('加载结果失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 初始化选择状态
    initializeSelection() {
      // 默认选中所有项目
      this.selectedItems.clear()
      if (this.resultData?.images) {
        this.resultData.images.forEach((_, index) => {
          this.selectedItems.add(`image_${index}`)
        })
      }
      if (this.resultData?.videos) {
        this.resultData.videos.forEach((_, index) => {
          this.selectedItems.add(`video_${index}`)
        })
      }
    },

    // 预览图片
    previewImage(index) {
      const urls = this.resultData.images.map(img => img.url)
      uni.previewImage({
        current: index,
        urls: urls
      })
    },

    // 下载单个图片
    async downloadImage(image, index) {
      try {
        uni.showLoading({ title: '下载中...' })
        
        const downloadTask = uni.downloadFile({
          url: image.url,
          success: (res) => {
            if (res.statusCode === 200) {
              uni.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success: () => {
                  uni.showToast({
                    title: '保存成功',
                    icon: 'success'
                  })
                },
                fail: () => {
                  uni.showToast({
                    title: '保存失败',
                    icon: 'none'
                  })
                }
              })
            }
          },
          fail: () => {
            uni.showToast({
              title: '下载失败',
              icon: 'none'
            })
          },
          complete: () => {
            uni.hideLoading()
          }
        })
      } catch (error) {
        uni.hideLoading()
        console.error('下载图片失败:', error)
      }
    },

    // 下载视频
    async downloadVideo(video, index) {
      try {
        uni.showLoading({ title: '下载中...' })
        
        const downloadTask = uni.downloadFile({
          url: video.url,
          success: (res) => {
            if (res.statusCode === 200) {
              uni.saveVideoToPhotosAlbum({
                filePath: res.tempFilePath,
                success: () => {
                  uni.showToast({
                    title: '视频保存成功',
                    icon: 'success'
                  })
                },
                fail: () => {
                  uni.showToast({
                    title: '保存失败',
                    icon: 'none'
                  })
                }
              })
            } else {
              uni.showToast({
                title: '下载失败',
                icon: 'none'
              })
            }
          },
          fail: () => {
            uni.showToast({
              title: '下载失败',
              icon: 'none'
            })
          }
        })
      } catch (error) {
        console.error('下载视频失败:', error)
        uni.showToast({
          title: '下载失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },

    // 切换图片选择状态
    toggleImageSelection(index) {
      const key = `image_${index}`
      if (this.selectedItems.has(key)) {
        this.selectedItems.delete(key)
      } else {
        this.selectedItems.add(key)
      }
      // 触发响应式更新
      this.$forceUpdate()
    },

    // 切换视频选择状态
    toggleVideoSelection(index) {
      const key = `video_${index}`
      if (this.selectedItems.has(key)) {
        this.selectedItems.delete(key)
      } else {
        this.selectedItems.add(key)
      }
      // 触发响应式更新
      this.$forceUpdate()
    },

    // 全选/取消全选
    selectAll() {
      if (this.isAllSelected) {
        this.selectedItems.clear()
      } else {
        this.initializeSelection()
      }
    },

    // 设置下载质量
    setQuality(quality) {
      this.downloadQuality = quality
    },

    // 批量下载
    async batchDownload() {
      if (this.selectedCount === 0) return

      try {
        this.showDownloadModal = true
        this.downloadCompleted = false
        this.downloadProgress = []

        const downloadItems = []
        
        // 添加选中的图片
        if (this.resultData?.images) {
          this.resultData.images.forEach((image, index) => {
            if (this.selectedItems.has(`image_${index}`)) {
              downloadItems.push({
                type: 'image',
                url: image.url,
                name: `图片_${index + 1}.jpg`
              })
            }
          })
        }

        // 添加选中的视频
        if (this.resultData?.video && this.selectedItems.has('video')) {
          downloadItems.push({
            type: 'video',
            url: this.resultData.video.url,
            name: '视频.mp4'
          })
        }

        // 初始化进度
        this.downloadProgress = downloadItems.map(item => ({
          name: item.name,
          progress: 0
        }))

        // 逐个下载
        for (let i = 0; i < downloadItems.length; i++) {
          const item = downloadItems[i]
          await this.downloadSingleItem(item, i)
        }

        this.downloadCompleted = true
        uni.showToast({
          title: '下载完成',
          icon: 'success'
        })

      } catch (error) {
        console.error('批量下载失败:', error)
        uni.showToast({
          title: '下载失败',
          icon: 'none'
        })
      }
    },

    // 下载单个项目
    downloadSingleItem(item, index) {
      return new Promise((resolve, reject) => {
        const downloadTask = uni.downloadFile({
          url: item.url,
          success: (res) => {
            if (res.statusCode === 200) {
              const saveMethod = item.type === 'image' ? 
                uni.saveImageToPhotosAlbum : uni.saveVideoToPhotosAlbum
              
              saveMethod({
                filePath: res.tempFilePath,
                success: () => {
                  this.downloadProgress[index].progress = 100
                  resolve()
                },
                fail: reject
              })
            } else {
              reject()
            }
          },
          fail: reject
        })

        // 模拟进度更新
        const progressInterval = setInterval(() => {
          if (this.downloadProgress[index].progress < 90) {
            this.downloadProgress[index].progress += 10
          } else {
            clearInterval(progressInterval)
          }
        }, 200)
      })
    },

    // 复制文案
    copyContent() {
      uni.setClipboardData({
        data: this.resultData.content,
        success: () => {
          uni.showToast({
            title: '复制成功',
            icon: 'success'
          })
        }
      })
    },

    // 分享结果
    shareResult() {
      uni.share({
        provider: 'weixin',
        scene: 'WXSenceSession',
        type: 0,
        href: `pages/result/result?id=${this.resultId}`,
        title: this.resultData?.title || '小红书内容',
        summary: this.resultData?.description || '通过小红书去水印工具解析',
        imageUrl: this.resultData?.images?.[0]?.url || '/static/logo.png'
      })
    },

    // 关闭下载弹窗
    closeDownloadModal() {
      this.showDownloadModal = false
      this.downloadProgress = []
      this.downloadCompleted = false
    },

    // 返回上一页
    goBack() {
      uni.navigateBack()
    },

    // 格式化时间
    formatTime(timestamp) {
      const date = new Date(timestamp)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    },

    // 视频错误处理
    handleVideoError(event) {
      console.error('=== 视频播放错误详情 ===')
      console.error('事件对象:', event)
      
      // uni-app在H5环境下，需要通过不同方式获取video元素
      let video = event.target
      let videoElement = null
      
      // 尝试获取真实的HTML video元素
      if (video && video.$el) {
        // uni-app组件包装的情况
        videoElement = video.$el.querySelector('video')
      } else if (video && video.tagName === 'VIDEO') {
        // 直接是video元素
        videoElement = video
      } else if (event.detail && event.detail.target) {
        // uni-app事件detail中的target
        videoElement = event.detail.target
      }
      
      // 如果还是找不到，尝试通过DOM查询
      if (!videoElement) {
        const videoElements = document.querySelectorAll('video')
        if (videoElements.length > 0) {
          videoElement = videoElements[0] // 使用第一个video元素
        }
      }
      
      console.error('uni-app video组件:', video)
      console.error('HTML video元素:', videoElement)
      
      const error = videoElement ? videoElement.error : null
      const videoSrc = videoElement ? videoElement.src : 'unknown'
      
      console.error('视频URL:', videoSrc)
      console.error('错误对象:', error)
      
      if (videoElement) {
        console.error('视频状态 - readyState:', videoElement.readyState)
        console.error('视频状态 - networkState:', videoElement.networkState)
        console.error('视频状态 - currentTime:', videoElement.currentTime)
        console.error('视频状态 - duration:', videoElement.duration)
        console.error('重试次数:', videoElement.dataset.retryCount || '0')
      }
      
      let errorMessage = '视频播放失败'
      let errorDetails = ''
      
      // 检查是否是403错误
      if (videoSrc && videoSrc.includes('xhscdn.com')) {
        errorMessage = '小红书视频访问被拒绝'
        errorDetails = '403 Forbidden - 可能需要特殊的访问权限或防盗链验证'
      } else if (error) {
        console.error('错误码:', error.code)
        console.error('错误信息:', error.message)
        
        switch (error.code) {
          case 1:
            errorMessage = '视频加载被中止'
            errorDetails = 'MEDIA_ERR_ABORTED - 用户中止了视频加载'
            break
          case 2:
            errorMessage = '网络错误，无法加载视频'
            errorDetails = 'MEDIA_ERR_NETWORK - 网络连接问题或服务器错误'
            break
          case 3:
            errorMessage = '视频解码错误'
            errorDetails = 'MEDIA_ERR_DECODE - 视频文件损坏或格式问题'
            break
          case 4:
            errorMessage = '不支持的视频格式'
            errorDetails = 'MEDIA_ERR_SRC_NOT_SUPPORTED - 浏览器不支持此视频格式或URL无效'
            break
          default:
            errorMessage = '未知错误'
            errorDetails = `Error code: ${error.code}, message: ${error.message || 'No message'}`
        }
      } else {
        console.error('没有错误对象，可能是uni-app兼容性问题')
        errorDetails = 'uni-app H5环境兼容性问题'
      }
      
      console.error(`最终错误信息: ${errorMessage} (${errorDetails})`)
      console.error('=== 错误详情结束 ===')
      
      // 检查是否已经达到最大重试次数
      if (videoElement && videoElement.dataset.retryCount && parseInt(videoElement.dataset.retryCount) >= 3) {
        console.error('已达到最大重试次数，不再尝试备用视频源')
        uni.showToast({
          title: '视频播放失败，请刷新页面重试',
          icon: 'none',
          duration: 3000
        })
        return
      }
      
      // 尝试使用备用视频源
      if (videoElement) {
        this.tryFallbackVideo(videoElement, videoSrc)
      } else {
        // 如果无法获取video元素，显示通用错误信息
        uni.showToast({
          title: '视频播放失败，请刷新页面重试',
          icon: 'none',
          duration: 3000
        })
      }
    },

    // 尝试备用视频源
    tryFallbackVideo(videoElement, failedUrl) {
      console.log('=== 尝试备用视频源 ===')
      console.log('失败的URL:', failedUrl)
      
      // 初始化或增加重试次数
      if (!videoElement.dataset.retryCount) {
        videoElement.dataset.retryCount = '0'
      }
      const retryCount = parseInt(videoElement.dataset.retryCount) + 1
      videoElement.dataset.retryCount = retryCount.toString()
      
      console.log('当前重试次数:', retryCount)
      
      // 如果已经达到最大重试次数，停止重试
      if (retryCount > 3) {
        console.error('已达到最大重试次数，停止尝试')
        uni.showToast({
          title: '所有视频源都无法播放',
          icon: 'none',
          duration: 3000
        })
        return
      }
      
      // 备用视频源列表
      const fallbackUrls = [
        'https://www.w3schools.com/html/mov_bbb.mp4',
        'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
        'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
        'https://file-examples.com/storage/fe68c8a7c66ede2bb5c4e74/2017/10/file_example_MP4_480_1_5MG.mp4'
      ]
      
      // 找到下一个可用的备用URL
      let nextUrl = null
      for (const url of fallbackUrls) {
        if (url !== failedUrl) {
          nextUrl = url
          break
        }
      }
      
      if (nextUrl) {
        console.log('尝试备用URL:', nextUrl)
        
        // 延迟1秒后重试，避免频繁请求
        setTimeout(() => {
          videoElement.src = nextUrl
          videoElement.load()
          console.log('已切换到备用视频源，延迟1秒后重新加载')
        }, 1000)
      } else {
        console.error('没有更多备用视频源可用')
        
        // 如果是原始视频失败，尝试流式视频
        if (this.videoInfo && this.videoInfo.stream_url && failedUrl !== this.videoInfo.stream_url) {
          console.log('尝试使用流式视频:', this.videoInfo.stream_url)
          setTimeout(() => {
            videoElement.src = this.videoInfo.stream_url
            videoElement.load()
            console.log('已切换到流式视频，延迟1秒后重新加载')
          }, 1000)
        } else {
          uni.showToast({
            title: '所有视频源都无法播放',
            icon: 'none',
            duration: 3000
          })
        }
      }
      
      console.log('=== 备用视频源处理结束 ===')
    },

    // 视频加载开始处理
    handleVideoLoadStart(event) {
      console.log('=== 视频开始加载 ===')
      console.log('事件对象:', event)
      
      // 获取video元素
      let videoElement = null
      if (event.target && event.target.$el) {
        videoElement = event.target.$el.querySelector('video')
      } else if (event.target && event.target.tagName === 'VIDEO') {
        videoElement = event.target
      }
      
      if (videoElement) {
        console.log('视频URL:', videoElement.src)
        console.log('视频状态 - readyState:', videoElement.readyState)
        console.log('视频状态 - networkState:', videoElement.networkState)
        
        // 重置重试计数器
        delete videoElement.dataset.retryCount
      }
      
      console.log('=== 视频加载开始处理结束 ===')
    },

    // 视频开始加载
    handleVideoLoadStart(event) {
      console.log('=== 视频开始加载 ===')
      
      // 获取真实的HTML video元素
      let videoElement = this.getVideoElement(event)
      
      console.log('视频URL:', videoElement ? videoElement.src : 'unknown')
      console.log('视频元素:', videoElement)
      
      if (videoElement) {
        console.log('readyState:', videoElement.readyState)
        console.log('networkState:', videoElement.networkState)
        console.log('视频时长:', videoElement.duration)
        console.log('视频尺寸:', `${videoElement.videoWidth}x${videoElement.videoHeight}`)
      }
      
      console.log('=== 加载开始详情结束 ===')
    },

    // 视频可以播放
    handleVideoCanPlay(event) {
      console.log('=== 视频可以播放 ===')
      
      // 获取真实的HTML video元素
      let videoElement = this.getVideoElement(event)
      
      console.log('视频URL:', videoElement ? videoElement.src : 'unknown')
      console.log('视频元素:', videoElement)
      
      if (videoElement) {
        console.log('readyState:', videoElement.readyState)
        console.log('networkState:', videoElement.networkState)
        console.log('视频时长:', videoElement.duration)
        console.log('视频尺寸:', `${videoElement.videoWidth}x${videoElement.videoHeight}`)
      }
      
      console.log('=== 可播放详情结束 ===')
    },

    // 获取真实的HTML video元素的通用方法
    getVideoElement(event) {
      let video = event.target
      let videoElement = null
      
      // 尝试获取真实的HTML video元素
      if (video && video.$el) {
        // uni-app组件包装的情况
        videoElement = video.$el.querySelector('video')
      } else if (video && video.tagName === 'VIDEO') {
        // 直接是video元素
        videoElement = video
      } else if (event.detail && event.detail.target) {
        // uni-app事件detail中的target
        videoElement = event.detail.target
      }
      
      // 如果还是找不到，尝试通过DOM查询
      if (!videoElement) {
        const videoElements = document.querySelectorAll('video')
        if (videoElements.length > 0) {
          videoElement = videoElements[0] // 使用第一个video元素
        }
      }
      
      return videoElement
    },

    // 视频数据加载完成
    handleVideoLoadedData(event) {
      console.log('=== 视频数据加载完成 ===')
      let videoElement = this.getVideoElement(event)
      console.log('视频元素:', videoElement)
      if (videoElement) {
        console.log('readyState:', videoElement.readyState)
        console.log('视频时长:', videoElement.duration)
      }
    },

    // 视频元数据加载完成
    handleVideoLoadedMetadata(event) {
      console.log('=== 视频元数据加载完成 ===')
      let videoElement = this.getVideoElement(event)
      console.log('视频元素:', videoElement)
      if (videoElement) {
        console.log('视频时长:', videoElement.duration)
        console.log('视频尺寸:', `${videoElement.videoWidth}x${videoElement.videoHeight}`)
      }
    },

    // 视频等待数据
    handleVideoWaiting(event) {
      console.log('=== 视频等待数据 ===')
      let videoElement = this.getVideoElement(event)
      console.log('视频元素:', videoElement)
    },

    // 视频开始播放
    handleVideoPlaying(event) {
      console.log('=== 视频开始播放 ===')
      let videoElement = this.getVideoElement(event)
      console.log('视频元素:', videoElement)
      if (videoElement) {
        console.log('当前时间:', videoElement.currentTime)
      }
    },

    // 视频暂停
    handleVideoPause(event) {
      console.log('=== 视频暂停 ===')
      let videoElement = this.getVideoElement(event)
      console.log('视频元素:', videoElement)
    },

    // 视频播放结束
    handleVideoEnded(event) {
      console.log('=== 视频播放结束 ===')
      let videoElement = this.getVideoElement(event)
      console.log('视频元素:', videoElement)
    },

    // 视频停滞
    handleVideoStalled(event) {
      console.log('=== 视频停滞 ===')
      let videoElement = this.getVideoElement(event)
      console.log('视频元素:', videoElement)
    },

    // 视频暂停加载
    handleVideoSuspend(event) {
      console.log('=== 视频暂停加载 ===')
      let videoElement = this.getVideoElement(event)
      console.log('视频元素:', videoElement)
    },

    // 视频加载中止
    handleVideoAbort(event) {
      console.log('=== 视频加载中止 ===')
      let videoElement = this.getVideoElement(event)
      console.log('视频元素:', videoElement)
    },

    // 视频清空
    handleVideoEmptied(event) {
      console.log('=== 视频清空 ===')
      let videoElement = this.getVideoElement(event)
      console.log('视频元素:', videoElement)
    },

    // 格式化时长
    formatDuration(seconds) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: white;
  border-bottom: 1rpx solid #eee;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  height: 88rpx;
}

.back-btn, .share-btn {
  font-size: 28rpx;
  color: #ff6b6b;
  padding: 10rpx;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #f3f3f3;
  border-top: 4rpx solid #ff6b6b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 30rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}

.content {
  padding: 30rpx;
}

.info-card {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.post-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
  display: block;
  margin-bottom: 20rpx;
}

.post-desc {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
  display: block;
  margin-bottom: 20rpx;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author {
  font-size: 26rpx;
  color: #ff6b6b;
}

.publish-time {
  font-size: 24rpx;
  color: #999;
}

.media-section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.images-container {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.image-item {
  position: relative;
  border-radius: 15rpx;
  overflow: hidden;
  background: #f8f8f8;
}

.image-thumb {
  width: 100%;
  height: 300rpx;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.6));
  padding: 20rpx;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.image-size {
  font-size: 24rpx;
}

.image-actions {
  display: flex;
  gap: 10rpx;
}

/* 圆形复选框样式 */
.checkbox-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5rpx;
}

.checkbox-circle {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  border: 3rpx solid rgba(255,255,255,0.8);
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10rpx);
}

.checkbox-circle.checked {
  background: #ff6b6b;
  border-color: #ff6b6b;
  transform: scale(1.1);
}

.checkbox-icon {
  font-size: 28rpx;
  color: white;
  font-weight: bold;
}

.action-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  background: rgba(255,255,255,0.2);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10rpx);
}

.btn-icon {
  font-size: 24rpx;
}

.video-container {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.video-player {
  width: 100%;
  height: 400rpx;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
}

.video-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
  font-size: 26rpx;
  color: #666;
}

.video-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
}

.download-video-btn {
  flex: 1;
  height: 70rpx;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  border-radius: 10rpx;
  font-size: 26rpx;
  margin-left: 20rpx;
}

.batch-actions {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.select-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.select-btn {
  padding: 15rpx 30rpx;
  background: #f8f8f8;
  border: none;
  border-radius: 10rpx;
  font-size: 26rpx;
  color: #666;
}

.select-btn.active {
  background: #ff6b6b;
  color: white;
}

.select-count {
  font-size: 26rpx;
  color: #666;
}

.download-options {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.quality-btn {
  flex: 1;
  height: 70rpx;
  background: #f8f8f8;
  border: none;
  border-radius: 10rpx;
  font-size: 26rpx;
  color: #666;
}

.quality-btn.active {
  background: #ff6b6b;
  color: white;
}

.batch-download-btn {
  width: 100%;
  height: 80rpx;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  border-radius: 15rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.batch-download-btn.disabled {
  background: #cccccc;
  color: #999999;
}

.text-content {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.content-text {
  position: relative;
}

.content-body {
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.copy-btn {
  width: 100%;
  height: 70rpx;
  background: #f8f8f8;
  border: none;
  border-radius: 10rpx;
  font-size: 26rpx;
  color: #666;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 30rpx;
  text-align: center;
}

.error-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.error-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.error-message {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 40rpx;
}

.retry-btn {
  padding: 20rpx 40rpx;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 10rpx;
  font-size: 28rpx;
}

/* 下载弹窗样式 */
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

.download-modal {
  background: white;
  border-radius: 20rpx;
  width: 80%;
  max-width: 600rpx;
  padding: 30rpx;
}

.modal-header {
  text-align: center;
  margin-bottom: 30rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.download-progress {
  margin-bottom: 30rpx;
}

.progress-item {
  margin-bottom: 20rpx;
}

.progress-name {
  font-size: 26rpx;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.progress-bar {
  height: 8rpx;
  background: #f0f0f0;
  border-radius: 4rpx;
  overflow: hidden;
  margin-bottom: 10rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 24rpx;
  color: #666;
  text-align: right;
  display: block;
}

.close-modal-btn {
  width: 100%;
  height: 70rpx;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 10rpx;
  font-size: 28rpx;
}
</style>
