# WXSS 编译错误修复说明

## 问题描述
```
[ WXSS 文件编译错误] 
./app.wxss(1:1): unexpected token `*`(env: macOS,mp,1.06.2504010; lib: 3.10.0)
```

## 问题原因
微信小程序的 WXSS 不完全支持所有 CSS 选择器，特别是：
1. **通配符选择器 `*`** 在某些版本的微信开发者工具中可能导致编译错误
2. **CSS3 的一些特性** 如 `vw`、`vh` 单位支持有限
3. **媒体查询** 支持不完整

## 已修复的问题

### 1. 通配符选择器替换
**修复前：**
```css
* {
  box-sizing: border-box;
}
```

**修复后：**
```css
view, text, input, button, image, navigator, form, textarea, picker, switch, slider, checkbox, radio {
  box-sizing: border-box;
}
```

### 2. 视口单位替换
**修复前：**
```css
.w-screen {
  width: 100vw;
}

.h-screen {
  height: 100vh;
}
```

**修复后：**
```css
.w-screen {
  width: 100%;
}

.h-screen {
  height: 100%;
}
```

### 3. 媒体查询移除
**修复前：**
```css
@media (max-width: 750rpx) {
  .container {
    padding: 0 20rpx;
  }
}
```

**修复后：**
```css
/* 响应式设计 - 微信小程序兼容 */
/* 注意：微信小程序中媒体查询支持有限，建议使用条件编译 */
```

## 微信小程序 WXSS 兼容性指南

### ✅ 支持的选择器
- 元素选择器：`view`, `text`, `button` 等
- 类选择器：`.class-name`
- ID选择器：`#id-name`
- 属性选择器：`[attr]`, `[attr=value]`
- 伪类选择器：`:hover`, `:active`, `:focus`
- 后代选择器：`.parent .child`
- 子选择器：`.parent > .child`

### ❌ 不支持或有限支持的特性
- 通配符选择器：`*`
- 视口单位：`vw`, `vh`, `vmin`, `vmax`
- 媒体查询：`@media` (支持有限)
- CSS Grid：`display: grid`
- Flexbox 的某些属性
- CSS 变量：`var(--variable)`
- `calc()` 函数 (部分支持)

### 📝 推荐的替代方案

#### 1. 响应式设计
使用条件编译替代媒体查询：
```css
/* #ifdef MP-WEIXIN */
.container {
  padding: 0 20rpx;
}
/* #endif */

/* #ifdef H5 */
.container {
  padding: 0 30rpx;
}
/* #endif */
```

#### 2. 布局方案
优先使用 Flexbox：
```css
.flex-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
```

#### 3. 单位使用
- 优先使用 `rpx` 单位（响应式像素）
- 避免使用 `vw`, `vh`
- 字体大小可以使用 `px` 或 `rpx`

## 验证修复结果

### 1. 重新编译
```bash
npm run dev:mp-weixin
```

### 2. 检查编译输出
确认 `dist/dev/mp-weixin/app.wxss` 文件不再包含问题代码

### 3. 微信开发者工具测试
- 打开微信开发者工具
- 导入项目目录：`dist/dev/mp-weixin`
- 检查控制台是否还有 WXSS 错误

## 最佳实践

### 1. 样式编写规范
```css
/* 好的做法 */
.button {
  width: 200rpx;
  height: 80rpx;
  border-radius: 20rpx;
  background-color: #ff6b6b;
}

/* 避免的做法 */
* {
  margin: 0;
  padding: 0;
}
```

### 2. 条件编译使用
```vue
<style>
/* #ifdef MP-WEIXIN */
.mp-specific {
  /* 微信小程序特有样式 */
}
/* #endif */

/* #ifdef H5 */
.h5-specific {
  /* H5特有样式 */
}
/* #endif */
</style>
```

### 3. 测试流程
1. 本地开发时使用微信开发者工具实时预览
2. 定期清除缓存重新编译
3. 在真机上测试样式效果
4. 检查不同屏幕尺寸的适配效果

## 常见问题

### Q: 还是出现 WXSS 错误怎么办？
A: 
1. 清除微信开发者工具缓存
2. 删除 `dist` 目录重新编译
3. 检查是否还有其他不兼容的 CSS 特性

### Q: 样式在 H5 和小程序中显示不一致？
A: 
1. 使用条件编译为不同平台编写专门的样式
2. 测试时在多个平台验证效果
3. 优先保证小程序端的显示效果

### Q: 如何调试 WXSS 样式？
A: 
1. 使用微信开发者工具的调试器
2. 在真机上使用 vConsole 调试
3. 通过元素审查器查看最终渲染的样式
