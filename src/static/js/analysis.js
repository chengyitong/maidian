
// 动态插入script标签
function createScript(url, callback) {
  var oScript = document.createElement('script');
  oScript.type = 'text/javascript';
  oScript.async = true;
  oScript.src = url;
  /*
   ** script标签的onload和onreadystatechange事件
   ** IE6/7/8支持onreadystatechange事件
   ** IE9/10支持onreadystatechange和onload事件
   ** Firefox/Chrome/Opera支持onload事件
   */
  // 判断IE8及以下浏览器
  var isIE = !-[1,];
  if (isIE) {
    alert('IE')
    oScript.onreadystatechange = function () {
      if (this.readyState == 'loaded' || this.readyState == 'complete') {
        callback();
      }
    }
  } else {
    // IE9及以上浏览器，Firefox，Chrome，Opera
    oScript.onload = function () {
      callback();
    }
  }
  document.body.appendChild(oScript);
}

// 获取用户来源URL
function getReferrer() {
  varreferrer = '';
  try {
    referrer = window.top.document.referrer;
  } catch (e) {
    if (window.parent) {
      try {
        referrer = window.parent.document.referrer;
      } catch (e2) {
        referrer = '';
      }
    }
  }
  if (referrer === '') {
    referrer = document.referrer;
  }
  return referrer;
}

// 获取IP
function getIP() {
  createScript('http://pv.sohu.com/cityjson?ie=utf-8', function () {
    var IP = returnCitySN["cip"];
    setCookie('IP', IP, 30, 1);
    localStorage.setItem('IP', IP);
    // console.log('IP地址:' + returnCitySN["cip"] + ', CID:' + returnCitySN["cid"] + ', 地区:' + returnCitySN["cname"]);
  })
}

// 设置cookie：flag: 1-天；2-小时；其他-分钟
function setCookie(name, value, times, flag) {
  var Days = times;
  var exp = new Date();
  if (times) {
    if (flag == 1) {
      exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000)
    } else {
      if (flag == 2) {
        exp.setTime(exp.getTime() + Days * 60 * 60 * 1000)
      } else {
        exp.setTime(exp.getTime() + Days * 60 * 1000)
      }
    }
  }
  document.cookie = "_MD_" + name + "=" + escape(value) + (times ? ";expires=" + exp.toGMTString() : "") + ";path=/"
}

// 获取cookie
function getCookie(name) {
  var arr, reg = new RegExp("(^| )" + "_MD_" + name + "=([^;]*)(;|$)");
  if (arr = document.cookie.match(reg)) {
    return unescape(arr[2])
  } else {
    return null
  }
}

// 删除cookie
function delCookie(name) {
  var exp = new Date();
  exp.setTime(exp.getTime() - 1);
  var cval = getCookie(name);
  if (cval != null) {
    document.cookie = "_MD_" + name + "=" + cval + ";expires=" + exp.toGMTString() + ";path=/"
  }
}

// 时间戳转字符串,格式 yyyy-MM-dd hh:mm:ss
function dateForm(date) {
  if (!date) {
    date = Date.parse(new Date());
  }
  var date = new Date(date);
  Y = date.getFullYear() + '-';
  M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
  h = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours()) + ':';
  m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + ':';
  s = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds());
  var str = Y + M + D + h + m + s;
  return str;
}

//js生成随机数    n表示生成几位的随机数
function generateMixed(n) {
  var jschars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  var res = '';
  for (var i = 0; i < n; i++) {
    var id = Math.ceil(Math.random() * 9);
    res += jschars[id];
  }
  return res;
}

// 定义原生ajax方法
function ajax() {
  var ajaxData = {
    type: arguments[0].type || 'GET',
    url: arguments[0].url || '',
    async: arguments[0].async || true,
    data: arguments[0].data || null,
    dataType: arguments[0].dataType || 'text',
    contentType: arguments[0].contentType || 'application/x-www-form-urlencoded',
    beforeSend: arguments[0].beforeSend || function () { },
    success: arguments[0].success || function () { },
    error: arguments[0].error || function () { }
  }
  ajaxData.beforeSend();
  var xhr = createxmlHttpRequest();
  xhr.responseType = ajaxData.dataType;
  xhr.open(ajaxData.type, ajaxData.url, ajaxData.async);
  xhr.setRequestHeader('Content-Type', ajaxData.contentType);
  xhr.send(convertData(ajaxData.data));
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        ajaxData.success(xhr.response)
      } else {
        ajaxData.error()
      }
    }
  }
}
function createxmlHttpRequest() {
  if (window.ActiveXObject) {
    return new ActiveXObject('Microsoft.XMLHTTP');
  } else if (window.XMLHttpRequest) {
    return new XMLHttpRequest();
  }
}
function convertData(data) {
  if (typeof data === 'object') {
    var convertResult = '';
    for (var c in data) {
      convertResult += c + '=' + data[c] + '&';
    }
    convertResult = convertResult.substring(0, convertResult.length - 1);
    return convertResult;
  } else {
    return data;
  }
}

// 发送POST请求，把数据发送给后台
function sendData(data) {
  alert(data)
  ajax({
    type: 'POST',
    url: 'https://linkcrm.verge-tech.cn/?c=record&m=add_record',
    dataType: 'json',
    data: data,
    beforeSend: function () {
      //some js code
    },
    success: function (msg) {
      console.log(msg)
    },
    error: function () {
      console.log('error')
    }
  })
}

// 通过cookie和localStorage获取GID(32位，时间+随机数字)，如果不存在则创建
function getGID() {
  var GID = '';
  var GID_cookie = getCookie('GID');
  var GID_localStorage = localStorage.getItem('GID');
  // 在cookie或localStorage中存在GID
  if (GID_cookie != null && GID_localStorage == null) {
    localStorage.setItem('GID', GID_cookie);
  } else if (GID_cookie == null && GID_localStorage != null) {
    setCookie('GID', GID_localStorage, 30, 1);
  } else if (GID_cookie == null && GID_localStorage == null) {
    createGID();
  }
}

// 创建GID
function createGID() {
  // 在cookie或localStorage中都不存在GID，则创建GID并保存
  var timeStamp = Date.parse(new Date()); // 13位时间戳
  GID = timeStamp + '' + generateMixed(19);
  localStorage.setItem('GID', GID);
  setCookie('GID', GID, 30, 1);
}

// 获取搜索框关键词,id为需要监测的搜索框id
function getKeyWords(id) {
  document.getElementById(id).addEventListener('blur', function () {
    var input_keyword = this.value;
    var keywords = localStorage.getItem('keywords') || '';
    var keyWordsArr = [];
    if (keywords != null && keywords != '') {
      keyWordsArr = keywords.split(',');
    }
    if (input_keyword != '') {
      keyWordsArr.push(input_keyword);
    }
    localStorage.setItem('keywords', keyWordsArr.toString());
  })
}
(function () {
  // 初始化
  // 清空需要重新获取的数据
  localStorage.removeItem('keywords');
  // 1. 获取或创建GID
  getGID();
  // 2. 保存IP到cookie
  getIP();
  // 3. 获取搜索框输入的关键字
  getKeyWords('keyword');
  // 4. 记录访问时长
  var second = 0;
  window.setInterval(function () {
    second++;
  }, 1000);
  // 5. 当用户准备离开页面时
  var _options = eval('(' + localStorage.getItem('options') + ')')
  window.onbeforeunload = function () {
    // 所有参数都是必填
    var options = {
      GID: getCookie('GID'), // 用户唯一ID（32位：时间+随机数字）
      uid: getCookie('GID'), // 用户id，暂时跟GID一样,用户不登录时等同于GID，商户不允许获取的情况下也等于GID
      functionID: 'ceshi', // 探头ID号
      clientID: 'ceshi2', // 商户ID号
      webUrl: window.location.href, // 网站页面路径
      refUrl: getReferrer(), // 用户来源URL（HTTP_REFERER）
      nextUrl: null, // 页面访问路径 定义为用户将要跳转到的页面
      userIP: getCookie('IP') || localStorage.getItem('IP'), // 用户ip
      userUA: navigator.userAgent, // 用户UA-User-Agent
      firstClickItem: '123', // 用户第一个点击行为 即 用户点击的第一个超链接或者按钮 的文本信息
      inputContent: localStorage.getItem('keywords'), // 用户在搜索框输入的所有关键字
      accessTime: dateForm(), // 用户访问时间,为具体的年月日时分秒
      getoutTime: dateForm(Date.parse(new Date()) + (second * 1000)), // 用户跳出时间,为具体的年月日时分秒
      stayTime: second, // 用户访问时长,单位为秒
      screen: window.screen.width + '*' + window.screen.height // 显示器分辨率1920*986
    }
    localStorage.setItem('options', JSON.stringify(options));
    console.log(options)
    // 把数据发送到后台
    sendData(options);
  }
})();

