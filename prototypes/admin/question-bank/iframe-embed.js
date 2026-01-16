/**
 * 题库管理系统 - iframe嵌入检测脚本
 * 自动检测页面是否在iframe中，并相应调整显示
 */

(function() {
  // 检测是否在iframe中
  function isInIframe() {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }

  // 检测URL参数
  function hasEmbeddedParam() {
    return window.location.search.includes('embedded=true');
  }

  // 如果在iframe中或有embedded参数，添加class并隐藏元素
  if (isInIframe() || hasEmbeddedParam()) {
    document.addEventListener('DOMContentLoaded', function() {
      // 添加body class
      document.body.classList.add('in-iframe');

      // 隐藏header
      const header = document.querySelector('header');
      if (header) {
        header.style.display = 'none';
      }

      // 移除顶部padding
      const mainDiv = document.querySelector('body > div');
      if (mainDiv) {
        mainDiv.style.paddingTop = '0';
        mainDiv.classList.remove('pt-16');
      }

      // 隐藏所有返回按钮
      const backButtons = document.querySelectorAll('button[onclick*="history.back"]');
      backButtons.forEach(button => {
        button.style.display = 'none';
      });

      // 处理页面内的链接，让它们在父窗口中打开
      const links = document.querySelectorAll('a[href$=".html"]');
      links.forEach(link => {
        const href = link.getAttribute('href');
        // 如果是相对路径的html文件，添加点击事件
        if (href && !href.startsWith('http') && !link.target) {
          link.addEventListener('click', function(e) {
            e.preventDefault();
            // 在父窗口中导航
            if (window.parent && window.parent.navigateToPage) {
              window.parent.navigateToPage(href);
            } else {
              window.parent.location.href = href;
            }
          });
        }
      });
    });
  }
})();
