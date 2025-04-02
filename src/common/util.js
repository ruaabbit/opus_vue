export function withBaseUrl(path) {
  const baseUrl = 'https://seaice.52lxy.one:20443'
  return baseUrl + path
}

// 添加一个函数用于获取完整图片URL
export function getImageUrl(path) {
  // 检查路径是否已经包含基础URL
  if (path && !path.startsWith('http') && !path.startsWith('/seaice')) {
    return withBaseUrl(path)
  }
  return path
}
