# Public 文件夹

这个文件夹用于存放静态资源文件，这些文件会被直接复制到构建输出目录。

## 使用方法

### 1. 将图片放在此文件夹
例如：`public/logo.png`

### 2. 在代码中引用
```tsx
// 使用绝对路径引用
<img src="/logo.png" alt="Logo" />

// 或者在 CSS 中
background-image: url('/logo.png');
```

## 注意事项

- 文件路径以 `/` 开头（相对于网站根目录）
- 这些文件不会被 Vite 处理或优化
- 适合存放：网站图标、favicon、不需要动态处理的静态图片
