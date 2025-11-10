// 主题初始化脚本 - 在页面加载前应用保存的主题，避免闪烁
(function() {
  try {
    // 检查localStorage中保存的主题设置
    var savedTheme = localStorage.getItem('theme') || 'system';
    var isDarkMode = false;
    
    if (savedTheme === 'dark') {
      isDarkMode = true;
    } else if (savedTheme === 'system') {
      // 检查系统偏好
      isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    // 根据结果设置dark类
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    // 处理错误（例如禁用了localStorage）
    console.error('主题初始化失败:', e);
  }
})();
