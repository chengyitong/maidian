/*
使用说明：
1、需要在所有需要统计的页面中引入该脚本文件；
2、在其他js文件之前引入；
3、该脚本不依赖其他的js库，可独立运行；
4、需要根据搜索框的id修改getKeyWords(id)的参数
5、根据实际需要修改functionID和clientID的值
*/
(function () {
  var options = '';
  // 初始化
  function init() {
    // inputContent和nextUrl是非必填项，其他的均为必填
    options = {
      GID: '', // 用户唯一ID（32位：时间+随机数字）
      uid: '', // 用户id，暂时跟GID一样,用户不登录时等同于GID，商户不允许获取的情况下也等于GID
      functionID: 'ceshi', // 探头ID号
      clientID: 'ceshi2', // 商户ID号
      webUrl: window.location.href, // 网站页面路径
      refUrl: '', // 用户来源URL（HTTP_REFERER）
      nextUrl: '', // 页面访问路径 定义为用户将要跳转到的页面
      userIP: '', // 用户ip
      userUA: navigator.userAgent, // 用户UA-User-Agent
      firstClickItem: '', // 用户第一个点击行为 即 用户点击的第一个超链接或者按钮的文本信息
      inputContent: '', // 用户在搜索框输入的所有关键字
      accessTime: '', // 用户访问时间,为具体的年月日时分秒
      getoutTime: '', // 用户跳出时间,为具体的年月日时分秒
      stayTime: 0, // 用户访问时长,单位为秒
      screen: window.screen.width + '*' + window.screen.height // 显示器分辨率1920*986
    }
  }
  init();

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
  // 记录用户访问时间
  options.accessTime = dateForm();

  //字符串转时间戳
  function dateToTimestamp(stringTime) {
    var timestamp = Date.parse(new Date(stringTime)) / 1000;
    return timestamp;
  }

  //js生成随机数,n表示生成几位的随机数
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

  // 通过cookie和localStorage获取GID(32位，时间+随机数字)，如果不存在则创建
  function setGID() {
    var GID = '';
    var GID_cookie = getCookie('GID');
    var GID_localStorage = localStorage.getItem('_MD_GID');
    // 在cookie或localStorage中存在GID
    if (GID_cookie != null && GID_localStorage == null) {
      localStorage.setItem('_MD_GID', GID_cookie);
    } else if (GID_cookie == null && GID_localStorage != null) {
      setCookie('GID', GID_localStorage, 30, 1);
    } else if (GID_cookie == null && GID_localStorage == null) {
      createGID();
    }
  }
  setGID();

  // 创建GID
  function createGID() {
    // 在cookie或localStorage中都不存在GID，则创建GID并保存
    var timeStamp = Date.parse(new Date()); // 13位时间戳
    GID = timeStamp + '' + generateMixed(19);
    localStorage.setItem('_MD_GID', GID);
    setCookie('GID', GID, 30, 1);
  }

  // 获取用户来源URL
  function getReferrer() {
    var referrer = '';
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
  // 记录用户来源URL
  options.refUrl = getReferrer();

  // 获取IP
  function getIP() {
    createScript('http://pv.sohu.com/cityjson?ie=utf-8', function () {
      var IP = returnCitySN["cip"];
      localStorage.setItem('_MD_IP', IP);
      return IP;
      // console.log('IP地址:' + returnCitySN["cip"] + ', CID:' + returnCitySN["cid"] + ', 地区:' + returnCitySN["cname"]);
    })
  }
  getIP();

  // 获取用户点击的第一个超链接或者按钮的文本信息；如果点击的是超链接可以同时获取nextUrl
  function firstClickItem() {
    document.addEventListener('mousedown', function (e) {
      var firstClickItem = localStorage.getItem('_MD_firstClickItem');
      if (firstClickItem != null && firstClickItem != '') {
        return false;
      }
      var _target = e.target;
      // 获取第一个点击行为的文本信息
      if (_target.localName == 'a' || _target.localName == 'button') {
        firstClickItem = _target.innerHTML;
        localStorage.setItem('_MD_firstClickItem', firstClickItem);
        // 获取即将跳转的url
        if (_target.localName == 'a') {
          localStorage.setItem('_MD_nextUrl', _target.href);
        }
      }
    });
  }
  // 调用记录第一个点击行为方法
  firstClickItem();

  // 获取搜索框关键词,id为需要监测的搜索框id
  function getKeyWords(id) {
    if (document.getElementById(id) != null) {
      document.getElementById(id).addEventListener('blur', function () {
        var input_value = this.value;
        var inputContent = localStorage.getItem('_MD_inputContent') || '';
        var inputContentArr = [];
        if (inputContent != null && inputContent != '') {
          inputContentArr = inputContent.split(',');
        }
        if (input_value != '') {
          inputContentArr.push(input_value);
        }
        localStorage.setItem('_MD_inputContent', inputContentArr.toString());
      })
    }
  }
  // 调用记录关键字方法，这里的keyword是只相关的搜索框id，使用时请更换
  getKeyWords('keyword');

  // 发送POST请求，把数据发送给后台
  function sendData(data) {
    ajax({
      type: 'POST',
      url: 'https://linkcrm.verge-tech.cn/?c=record&m=add_record',
      dataType: 'json',
      data: data,
      beforeSend: function () {
        //some js code
      },
      success: function (res) {
        // 如果发送成功，则清空上一次的统计数据
        if (res.code == 200) {
          // 清空需要重新获取的值
          localStorage.removeItem('_MD_inputContent');
          localStorage.removeItem('_MD_firstClickItem');
          localStorage.removeItem('_MD_nextUrl');
          localStorage.removeItem('_MD_options');
        }
        console.log(res)
      },
      error: function () {
        console.log('error')
      }
    })
  }

  // 保存最终需要发送给后台的数据
  function getOptions() {
    var _options = eval('(' + localStorage.getItem('_MD_options') + ')');
    if (_options != null) {
      // 获取GID和uid
      _options.GID = localStorage.getItem('_MD_GID');
      _options.uid = localStorage.getItem('_MD_GID');
      // 记录用户ip
      _options.userIP = localStorage.getItem('_MD_IP');
      // 获取页面即将药跳转到的页面url
      options.nextUrl = localStorage.getItem('_MD_nextUrl');
      // 继续获取输入框的关键字
      var inputContent_arr = [];
      if (_options.inputContent != null && _options.inputContent != '') {
        inputContent_arr = _options.inputContent.split(',');
      }
      if (localStorage.getItem('_MD_inputContent')) {
        inputContent_arr.push(localStorage.getItem('_MD_inputContent').split(','));
      }
      _options.inputContent = inputContent_arr.toString();

      // 重新计算访问时长
      _options.getoutTime = dateForm();
      _options.stayTime = dateToTimestamp(_options.getoutTime) - dateToTimestamp(_options.accessTime);

      options = _options;
    } else {
      // 获取GID和uid
      options.GID = localStorage.getItem('_MD_GID');
      options.uid = localStorage.getItem('_MD_GID');
      // 记录用户ip
      options.userIP = localStorage.getItem('_MD_IP');
      // 获取页面即将药跳转到的页面url
      options.nextUrl = localStorage.getItem('_MD_nextUrl');
      // 获取用户第一个点击行为的文本信息
      options.firstClickItem = localStorage.getItem('_MD_firstClickItem');
      // 获取用户在搜索框输入的所有关键字
      options.inputContent = localStorage.getItem('_MD_inputContent');
      // 获取用户跳出时间
      options.getoutTime = dateForm();
      // 获取用户访问时长
      options.stayTime = dateToTimestamp(options.getoutTime) - dateToTimestamp(options.accessTime);
    }
    localStorage.setItem('_MD_options', JSON.stringify(options));
  }

  // 当用户准备离开页面时,保存当前的统计数据
  window.onbeforeunload = function () {
    getOptions();
  }
  // 在首次进入新页面时，把上一步保存的统计数据发送给后台
  window.onload = function () {
    // 用来判断是进入页面还是刷新页面，0：新进入；1:刷新；2:从其他页面进入
    var navigation_type = performance.navigation.type;
    // 如果不是刷新页面，则提交保存起来的统计数据
    if (navigation_type != 1) {
      var _options = eval('(' + localStorage.getItem('_MD_options') + ')');
      sendData(_options);
      console.log(_options);
    } else {
      getOptions();
    }
  }
})();

