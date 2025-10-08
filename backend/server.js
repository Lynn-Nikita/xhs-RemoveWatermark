const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 存储解析结果的内存缓存
const parseResults = new Map();

// 质量评分函数
function calculateQualityScore(data) {
  let score = 0;
  
  // 基础信息完整性 (40分)
  if (data.title && data.title !== '未获取到标题') score += 15;
  if (data.author && data.author !== '未知用户') score += 10;
  if (data.content && data.content !== '未获取到内容描述') score += 15;
  
  // 媒体内容 (40分)
  if (data.images && data.images.length > 0) score += 20;
  if (data.videos && data.videos.length > 0) score += 20;
  
  // 互动数据 (20分)
  if (data.interactInfo) {
    if (data.interactInfo.likeCount > 0) score += 7;
    if (data.interactInfo.collectCount > 0) score += 7;
    if (data.interactInfo.commentCount > 0) score += 6;
  }
  
  return Math.min(score, 100);
}

// 生成改进建议
function generateSuggestions(score, data) {
  const suggestions = [];
  
  if (score < 60) {
    suggestions.push('解析质量较低，建议检查链接有效性');
  } else if (score < 80) {
    suggestions.push('部分内容解析成功，但仍有改进空间');
  } else {
    suggestions.push('解析质量良好');
  }
  
  if (!data.images || data.images.length === 0) {
    suggestions.push('建议：检查图片加载或网络连接');
  }
  
  if (!data.videos || data.videos.length === 0) {
    suggestions.push('建议：检查视频内容或更新解析逻辑');
  }
  
  if (score < 80) {
    suggestions.push('建议：检查网络连接或更新访问凭证');
  }
  
  return suggestions;
}

// 从文本中提取小红书链接
function extractXhsUrl(text) {
  // 匹配各种小红书链接格式
  const urlPatterns = [
    /https?:\/\/(?:www\.)?xiaohongshu\.com\/[^\s]+/g,
    /https?:\/\/xhslink\.com\/[^\s]+/g,
    /https?:\/\/xhs\.link\/[^\s]+/g
  ];
  
  for (const pattern of urlPatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      return matches[0];
    }
  }
  
  return null;
}

// 检查URL是否为小红书链接
function isValidXhsUrl(url) {
  const xhsPatterns = [
    /xiaohongshu\.com/,
    /xhslink\.com/,
    /xhs\.link/
  ];
  
  return xhsPatterns.some(pattern => pattern.test(url));
}

// 处理移动端短链接重定向
async function handleMobileRedirect(url, cookie) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        'Cookie': cookie
      },
      maxRedirects: 5,
      timeout: 10000
    });
    
    return response.request.res.responseUrl || url;
  } catch (error) {
    console.log('移动端重定向失败:', error.message);
    return url;
  }
}

// 主要的解析函数
async function parseXhsContent(url) {
  try {
    // 从工作区规则中获取Cookie
    const xhsCookie = "abRequestId=b63ba306-6039-5458-84af-ff12771b5e09; a1=198d0e058fe1yo0oc9m7dudndjvpj1tti92w2mirp30000265034; webId=a91f6c31adc4c67a6b8159bedcbeb15f; gid=yjYf8d8K4D3jyjYf8d82Yj63idyvl8lSj6WfJFU7fIfVhEq8UVy99J888JK28q48J4J44qDf; x-user-id-creator.xiaohongshu.com=5c96cddd0000000016023769; customerClientId=551472900740811; webBuild=4.81.0; web_session=0400698de28e9508673f3098d03a4b0250ae5b; xsecappid=xhs-pc-web; loadts=1759898572158; websectiga=6169c1e84f393779a5f7de7303038f3b47a78e47be716e7bec57ccce17d45f99; sec_poison_id=057af63c-7099-4586-a206-dab258acacfa; unread={%22ub%22:%2268e0c2e5000000000303a796%22%2C%22ue%22:%2268e1031d000000000402b93a%22%2C%22uc%22:20}; acw_tc=0a4acc4417599004004278123e1d3b764f3906aa98ade66a5c7661b2faf888";
    
    console.log('正在访问小红书链接:', url);
    
    // 检查是否为移动端短链接
    const isMobileLink = url.includes('xhslink.com');
    console.log('是否为移动端链接:', isMobileLink);
    
    // 如果是移动端链接，先获取重定向后的URL
    if (isMobileLink) {
      url = await handleMobileRedirect(url, xhsCookie);
      console.log('重定向后的URL:', url);
    }
    
    // 设置请求头
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0',
      'Cookie': xhsCookie
    };

    console.log('发送请求到:', url);
    const response = await axios.get(url, {
      headers,
      timeout: 15000,
      maxRedirects: 5
    });

    console.log('响应状态码:', response.status);
    console.log('响应内容长度:', response.data.length);

    const $ = cheerio.load(response.data);
    
    // 初始化变量
    let title = '';
    let author = '';
    let content = '';
    let images = [];
    let videos = []; // 在函数开头声明videos变量
    let publishTime = '';
    let likeCount = 0;
    let collectCount = 0;
    let commentCount = 0;

    // 1. 优先从 meta 标签提取基础信息
    title = $('meta[property="og:title"]').attr('content') || '';
    content = $('meta[name="description"]').attr('content') || '';
    
    // 提取互动数据
    likeCount = parseInt($('meta[name="og:xhs:note_like"]').attr('content')) || 0;
    collectCount = parseInt($('meta[name="og:xhs:note_collect"]').attr('content')) || 0;
    commentCount = parseInt($('meta[name="og:xhs:note_comment"]').attr('content')) || 0;

    // 2. 从 meta og:image 标签提取图片
    $('meta[property="og:image"]').each((i, elem) => {
      const imageUrl = $(elem).attr('content');
      if (imageUrl && imageUrl.includes('xhscdn.com')) {
        images.push({
          url: imageUrl,
          width: 750,
          height: 1000
        });
      }
    });

    // 3. 尝试从页面中的 __INITIAL_STATE__ 提取更详细的数据
    const scriptTags = $('script');
    let initialStateData = null;
    
    console.log(`找到 ${scriptTags.length} 个script标签`);
    
    scriptTags.each((i, elem) => {
      const scriptContent = $(elem).html();
      if (scriptContent && scriptContent.includes('window.__INITIAL_STATE__')) {
        console.log(`在第 ${i+1} 个script标签中找到 __INITIAL_STATE__`);
        
        try {
          // 改进的正则表达式匹配
          let jsonMatch = scriptContent.match(/window\.__INITIAL_STATE__\s*=\s*({.*?});?\s*$/s);
          if (!jsonMatch) {
            // 尝试更宽松的匹配
            jsonMatch = scriptContent.match(/window\.__INITIAL_STATE__\s*=\s*({.*)/s);
          }
          
          if (jsonMatch) {
            let jsonStr = jsonMatch[1];
            // 清理JSON字符串
            jsonStr = jsonStr.replace(/;?\s*<\/script>.*$/s, '').trim();
            if (jsonStr.endsWith(';')) {
              jsonStr = jsonStr.slice(0, -1);
            }
            
            // 处理JavaScript中的undefined值
            jsonStr = jsonStr.replace(/:\s*undefined\b/g, ': null');
            
            initialStateData = JSON.parse(jsonStr);
            console.log('成功解析 __INITIAL_STATE__ 数据');
            
            // 立即返回，确保解析成功
            return false; // 停止each循环
          }
        } catch (error) {
          console.log('解析 __INITIAL_STATE__ 失败:', error.message);
        }
      }
    });

    // 4. 如果有 initialStateData，从中提取更详细的信息
    if (initialStateData && initialStateData.note && initialStateData.note.noteDetailMap) {
      const noteId = Object.keys(initialStateData.note.noteDetailMap)[0];
      if (noteId) {
        const noteDetail = initialStateData.note.noteDetailMap[noteId];
        const note = noteDetail.note;
        
        console.log('找到笔记详情数据');
        
        if (note) {
          // 提取标题和内容
          title = note.title || title;
          content = note.desc || content;
          
          // 提取作者信息
          if (note.user) {
            author = note.user.nickname || note.user.name || '';
          }
          
          // 提取发布时间
          if (note.time) {
            publishTime = new Date(note.time).toLocaleString('zh-CN');
          }
          
          // 提取互动数据
          if (note.interactInfo) {
            likeCount = note.interactInfo.likedCount || 0;
            collectCount = note.interactInfo.collectedCount || 0;
            commentCount = note.interactInfo.commentCount || 0;
          }
          
          // 提取图片
          if (note.imageList && Array.isArray(note.imageList)) {
            images = []; // 清空之前的图片
            note.imageList.forEach((img, index) => {
              if (img.urlDefault) {
                images.push({
                  url: img.urlDefault,
                  width: img.width || 750,
                  height: img.height || 1000,
                  index: index
                });
              }
            });
          }
          
          // 检查是否有视频内容
          console.log('检查视频数据结构:', JSON.stringify(note.video, null, 2));
          
          // 方法1: 从video.stream.h264数组中提取视频URL
          if (note.video && note.video.stream && note.video.stream.h264 && note.video.stream.h264.length > 0) {
            console.log('找到视频流数据');
            const videoStreams = note.video.stream.h264;
            
            videoStreams.forEach((stream, index) => {
              console.log(`提取到视频URL: ${stream.masterUrl}`);
              
              // 主视频URL
              videos.push({
                url: stream.masterUrl,
                type: stream.format || 'mp4',
                duration: Math.floor(stream.duration / 1000) || 0,
                width: stream.width || 750,
                height: stream.height || 1000,
                isOriginVideo: false,
                quality: stream.qualityType || 'HD',
                // 添加备用URL
                backupUrls: stream.backupUrls || []
              });
            });
          }
          
          // 方法2: 尝试从originVideoKey构造无水印视频URL
          if (note.video && note.video.consumer && note.video.consumer.originVideoKey) {
            console.log('找到originVideoKey:', note.video.consumer.originVideoKey);
            const originVideoKey = note.video.consumer.originVideoKey;
            const videoUrl = `https://sns-video-bd.xhscdn.com/${originVideoKey}`;
            console.log('构造的视频URL:', videoUrl);
            
            videos.push({
              url: videoUrl,
              type: 'mp4',
              duration: note.video.duration || 0,
              width: note.video.width || 750,
              height: note.video.height || 1000,
              isOriginVideo: true,
              quality: 'Original',
              backupUrls: []
            });
          }
          
          // 方法3: 从HTML中直接搜索originVideoKey
          if (videos.length === 0) {
            console.log('尝试从HTML中搜索originVideoKey');
            const htmlContent = response.data;
            const originVideoKeyMatch = htmlContent.match(/"originVideoKey"\s*:\s*"([^"]+)"/);
            if (originVideoKeyMatch) {
              const originVideoKey = originVideoKeyMatch[1].replace(/\\u002F/g, '/');
              const videoUrl = `https://sns-video-bd.xhscdn.com/${originVideoKey}`;
              console.log('从HTML中提取到originVideoKey:', originVideoKey);
              console.log('构造的视频URL:', videoUrl);
              
              videos.push({
                url: videoUrl,
                type: 'mp4',
                duration: note.video?.duration || 0,
                width: note.video?.width || 750,
                height: note.video?.height || 1000,
                isOriginVideo: true,
                quality: 'Original',
                backupUrls: []
              });
            }
          }
          
          // 如果找到视频，处理封面图
          if (videos.length > 0) {
            console.log(`成功提取到 ${videos.length} 个视频`);
            // 视频内容通常不显示图片，但保留封面图
            if (note.video && note.video.image && note.video.image.urlDefault) {
              images = [{
                url: note.video.image.urlDefault,
                width: note.video.image.width || 750,
                height: note.video.image.height || 1000,
                isCover: true
              }];
            }
          } else {
            console.log('未找到有效的视频URL');
            if (note.video) {
              console.log('note.video存在，但无法提取视频URL:', Object.keys(note.video));
            }
          }
          
          console.log('从 __INITIAL_STATE__ 提取到详细数据');
        }
      }
    }

    // 5. 清理和格式化数据
    if (!title || title.includes('小红书')) {
      const pageTitle = $('title').text();
      if (pageTitle && !pageTitle.includes('小红书')) {
        title = pageTitle.replace(' - 小红书', '').trim();
      }
    }

    // 6. 构建返回数据
    const result = {
      title: title || '未获取到标题',
      author: author || '未知用户',
      publishTime: publishTime || '未知时间',
      content: content || '未获取到内容描述',
      images: images.slice(0, 9), // 最多9张图片
      videos: videos || [], // 视频数据
      type: (videos && videos.length > 0) ? 'video' : (images.length > 0 ? 'image' : 'text'),
      originalUrl: url,
      parseStatus: 'success',
      // 添加互动数据
      interactInfo: {
        likeCount,
        collectCount,
        commentCount
      }
    };

    console.log('解析完成，返回结果');
    return result;

  } catch (error) {
    console.log('解析小红书内容失败:', error.message);
    
    // 返回错误信息但不抛出异常
    return {
      title: '解析失败',
      author: '未知用户',
      publishTime: '未知时间',
      content: `解析失败原因: ${error.message}\n\n可能的解决方案:\n1. 检查网络连接\n2. 确认链接格式正确\n3. 更新Cookie信息\n4. 稍后重试`,
      images: [],
      videos: [],
      type: 'error',
      originalUrl: url,
      parseStatus: 'error',
      errorMessage: error.message,
      interactInfo: {
        likeCount: 0,
        collectCount: 0,
        commentCount: 0
      }
    };
  }
}

// API路由
app.post('/api/parse/xhs', async (req, res) => {
  try {
    let { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        code: 400,
        message: '请提供URL参数',
        data: null
      });
    }

    // 尝试从文本中提取URL
    const extractedUrl = extractXhsUrl(url);
    if (extractedUrl) {
      url = extractedUrl;
      console.log('从文本中提取到URL:', url);
    }

    // 测试视频数据 - 用于验证前端播放功能
    if (url.includes('test-video')) {
      console.log('返回测试视频数据');
      const testVideoResult = {
        title: '测试视频 - 验证播放功能',
        author: '测试用户',
        publishTime: '2024-01-01',
        content: '这是一个测试视频，用于验证前端视频播放功能是否正常工作。',
        images: [],
        videos: [{
          // 使用B站视频源作为主源
          url: 'https://upos-sz-estghw.bilivideo.com/upgcxcode/35/57/32292275735/32292275735-1-192.mp4?e=ig8euxZM2rNcNbRVhwdVhwdlhWdVhwdVhoNvNC8BqJIzNbfq9rVEuxTEnE8L5F6VnEsSTx0vkX8fqJeYTj_lta53NCM=&oi=2947683238&uipk=5&deadline=1759927822&gen=playurlv3&trid=03254cff3f6d4e70b94566b010ac1b4h&platform=html5&mid=0&os=estghw&og=hw&nbs=1&upsig=c330ff9ba7f48aa574c3c5f9dd3dfc48&uparams=e,oi,uipk,deadline,gen,trid,platform,mid,os,og,nbs&bvc=vod&nettype=0&bw=382332&buvid=&build=0&dl=0&f=h_0_0&agrr=1&orderid=0,1',
          type: 'mp4',
          duration: 10,
          width: 320,
          height: 176,
          isOriginVideo: true,
          backupUrls: [
            // 添加更多可靠的备用视频源
            'https://www.w3schools.com/html/mov_bbb.mp4',
            'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
            'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
            'https://file-examples.com/storage/fe68c8666459c2c5c8c1a95/2017/10/file_example_MP4_480_1_5MG.mp4'
          ]
        }],
        type: 'video',
        originalUrl: url,
        parseStatus: 'success',
        interactInfo: {
          likeCount: 100,
          collectCount: 50,
          commentCount: 25
        }
      };
      
      const resultId = `test_video_${Date.now()}`;
      const finalResult = {
        ...testVideoResult,
        id: resultId,
        qualityScore: 100,
        suggestions: ['测试视频数据，播放功能正常']
      };
      
      parseResults.set(resultId, finalResult);
      
      return res.status(200).json({
        code: 0,
        message: '解析成功',
        data: finalResult
      });
    }

    // 验证URL格式
    if (!isValidXhsUrl(url)) {
      return res.status(400).json({
        code: 0,
        message: '请提供有效的小红书链接',
        data: null
      });
    }

    console.log('开始解析小红书链接:', url);
    
    // 解析内容
    const parseResult = await parseXhsContent(url);
    
    // 计算质量评分
    const qualityScore = calculateQualityScore(parseResult);
    const suggestions = generateSuggestions(qualityScore, parseResult);
    
    // 生成唯一ID并存储结果
    const resultId = `result_${Date.now()}`;
    const finalResult = {
      ...parseResult,
      id: resultId,
      qualityScore,
      suggestions
    };
    
    parseResults.set(resultId, finalResult);
    
    console.log('解析完成，质量评分:', qualityScore + '/100');
    
    // 根据解析状态返回不同的响应码
    if (parseResult.parseStatus === 'error') {
      return res.status(200).json({
        code: 1,
        message: '解析失败',
        data: finalResult
      });
    }
    
    res.json({
      code: 0,
      message: '解析成功',
      data: finalResult
    });

  } catch (error) {
    console.error('API处理错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
      error: error.message
    });
  }
});

// 获取解析结果
app.get('/api/parse/result/:id', (req, res) => {
  const { id } = req.params;
  const result = parseResults.get(id);
  
  if (!result) {
    return res.status(404).json({
      code: 404,
      message: '解析结果不存在或已过期',
      data: null
    });
  }
  
  res.json({
    code: 0,
    message: '获取成功',
    data: result
  });
});

// 获取解析历史
app.get('/api/parse/history', (req, res) => {
  const history = Array.from(parseResults.values())
    .sort((a, b) => new Date(b.id.split('_')[1]) - new Date(a.id.split('_')[1]))
    .slice(0, 50); // 最多返回50条记录
  
  res.json({
    code: 200,
    message: '获取成功',
    data: history
  });
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    code: 200,
    message: '服务正常',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`小红书去水印服务已启动，端口: ${PORT}`);
  console.log(`访问地址: http://localhost:${PORT}`);
});

module.exports = app;