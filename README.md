# cd 项目根目录
# npm install
# 找到node_modules --> gulp-assets-rev -->index.js 修改如下代码：

78 var verStr = (options.verConnecter || "-") + md5;
80 src = src.replace(verStr, '').replace(/(\.[^\.]+)$/, verStr + "$1");

改为：
78 var verStr = (options.verConnecter || "") + md5;
80 src = src + "?v=" + verStr;

# 启动服务: gulp -ws
# 在浏览器打开：http://localhost:8080/

<!-- 开发静态文件时使用gulpfile.js,利用browserSync进行真机测试 -->
<!-- 对接接口，需要使用服务器代理时使用gulpfile2.js,利用connect启动服务，用http-proxy-middleware设置服务器代理 -->