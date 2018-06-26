var md5 = require('./md5.js')
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


// 显示繁忙提示
var showBusy = text => wx.showToast({
    title: text,
    icon: 'loading',
    duration: 10000
})

// 显示成功提示
var showSuccess = text => wx.showToast({
    title: text,
    icon: 'success'
})


// 显示失败提示
var showModel = (title, content) => {
    wx.hideToast();
    wx.showModal({
        title,
        content: JSON.stringify(content),
        showCancel: false
    })
}
function giveUp(){
  wx.redirectTo({
    url: '/pages/index/index',
  })
}

//时间戳
function date(timestamp) {
  var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  const Y = date.getFullYear() + '-';
  const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  const D = date.getDate() + ' ';
  const h = date.getHours() + ':';
  const m = date.getMinutes() + ':';
  const s = date.getSeconds();
  return Y + M + D + h + m + s;
}
// module.exports = { formatTime, showBusy, showSuccess, showModel}
//生成32位随机数
function getNum() {
  var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  var nums = "";
  for (var i = 0; i < 32; i++) {
    var id = parseInt(Math.random() * 61);
    nums += chars[id];
  }
  return nums;
}  
function encrypt(){
  var app_id = 'walucky_frog_wx';
  var time_stamp = new Date().getTime();
  var nonce_str = this.getNum();
  // console.log(nonce_str)
  var stringA = "app_id=walucky_frog_wx&nonce_str=" + nonce_str + "&time_stamp=" + time_stamp;
  var stringSignTemp = stringA + "&app_secert=1f8bcb22b633c72adf3d1e8bcf9bc1d4"
  var sign = md5.hexMD5(stringSignTemp).toUpperCase();
  var json = { app_id: app_id, time_stamp: time_stamp, nonce_str: nonce_str, sign: sign};
  
  return json;
}
//排序
function objKeySort(arys) {
  //先用Object内置类的keys方法获取要排序对象的属性名，再利用Array原型上的sort方法对获取的属性名进行排序，newkey是一个数组
  var newkey = Object.keys(arys).sort();
  //console.log('newkey='+newkey);
  var newObj = {}; //创建一个新的对象，用于存放排好序的键值对
  for (var i = 0; i < newkey.length; i++) {
    //遍历newkey数组
    newObj[newkey[i]] = arys[newkey[i]];
    //向新创建的对象中按照排好的顺序依次增加键值对
  }
  return newObj; //返回排好序的新对象
}
function sort(arys){
  // objKeySort(arys); 
  var jsonstr = JSON.stringify(objKeySort(arys));
  // console.log(jsonstr);
  var str1 = jsonstr.replace(new RegExp(':', 'g'), '=');
  var str2 = str1.replace(new RegExp(',', 'g'), '&')
  var str3 = str2.substring(1, str2.length - 1);
  var newstr = str3.replace(new RegExp('"', "g"), "")
  // console.log(newstr);
  return newstr;
}

//传参规则
function putParams(params) {
  var stringA = sort(params);
  console.log(stringA);

  var stringSignTemp = stringA + "&app_secert=1f8bcb22b633c72adf3d1e8bcf9bc1d4";
  var sign = md5.hexMD5(stringSignTemp).toUpperCase();
  //将键值对添加进params对象中
  params.sign = sign;
  return params;
}

module.exports = {
  giveUp:giveUp,
  date: date,
  getNum:getNum,
  encrypt: encrypt,
  sort:sort,
  putParams: putParams
}
