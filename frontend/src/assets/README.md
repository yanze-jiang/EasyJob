# Assets 文件夹

这个文件夹用于存放需要在代码中导入的资源文件，这些文件会被 Vite 处理和优化。

## 使用方法

### 1. 将图片放在此文件夹
例如：`src/assets/logo.png`

### 2. 在组件中导入使用
```tsx
import logo from './assets/logo.png'

function MyComponent() {
  return <img src={logo} alt="Logo" />
}
```

### 3. 在 CSS 中导入
```css
/* 在 CSS 文件中 */
.background {
  background-image: url('./assets/background.jpg');
}
```

## 优势

- 图片会被 Vite 优化和处理
- 支持图片格式转换和压缩
- 构建时会生成带哈希的文件名（缓存优化）
- 适合存放：组件中使用的图片、需要优化的图片
