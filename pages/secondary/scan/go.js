// pages/secondary/scan/go.js
//腾讯地图
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;
var util = require('../../../utils/util.js');
var md5 = require('../../../utils/md5.js');
var encryption = util.encrypt();//后台传签名
var url = getApp().globalData.url;
//微信步数
var WXBizDataCrypt = require('../../../utils/RdWXBizDataCrypt.js');
Page({
  data: {
    goList:null,
    address:'',//到达地
    departure:'',//出发地
    endOff:false,//到此为止
    onOff:false,//继续前行
    url:'',//扫码地址
    taskList:'',//接任务的数组
    latitude: '',
    longitude: '',//地图中心
    markers: [],
    on_url:''//继续前行的url
  },
  onLoad: function (options) {
    var that = this;
    var markers = wx.getStorageSync('markers');
//引入qq地图
    qqmapsdk = new QQMapWX({
      key: 'ST5BZ-GJFKG-CBKQN-ITYQI-JR425-KTBYR'
    });
    that.setData({
      latitude: wx.getStorageSync('lat'), 
      longitude: wx.getStorageSync('lng'),
      markers: markers,
    })

// //出发地解析
//     qqmapsdk.reverseGeocoder({
//       location: {
//         latitude: that.data.goList.markers[0].latitude,
//         longitude: that.data.goList.markers[0].longitude,
//       },
//       success(res) {
//         that.setData({
//           departure: res.result.address_component.district + res.result.address_component.street + res.result.address_component.street_number
//         })
//       }
//     });
  //获取微信步数
    that.getData(getApp().globalData.openid, getApp().globalData.sessionKey);
  },
  //地图导航
  goTo(){
    var that = this;
    wx.authorize({ 
      scope: "scope.userLocation",
      success(){
        console.log('hhh')
        wx.navigateTo({
          url: './goTo?goList=' + JSON.stringify(that.data.goList),
        })
      } 
       }) 
    console.log(that.data.goList)
  },

//点击到此为止
complete(){
  var that = this;
  that.endOff = true;
  wx.scanCode({
    onlyFromCamera: true,
    success(res) {
      if (res.result) {
        that.setData({
         url : res.result,
        })
        console.log(res.result)
      }
        that.getData(getApp().globalData.openid, getApp().globalData.sessionKey); 
    },
    fail() { },
  }) 
},
//点击继续前行
goOn(){
  var that = this;
  that.onOff = true;
  wx.scanCode({
    onlyFromCamera: true,
    success(res) {
      if (res.result) {
        console.log(res.result);
        that.setData({
          on_url: res.result,
        })
        console.log(res.result)
      }
      that.getData(getApp().globalData.openid, getApp().globalData.sessionKey);
    },
    fail() { },
  }) 
  that.getData(getApp().globalData.openid, getApp().globalData.sessionKey);  
    // wx.scanCode({
    //   onlyFromCamera: true,
    //   success: function (res) {  
    //     if (res.result) {
    //       that.data.url = res.result;
          
    //     }
    //   }
    // })
},
//点击放弃
giveUp(){
  var that = this;
  var time_stamp = new Date().getTime();
  var nonce_str = util.getNum();
  console.log(wx.getStorageSync('take_id'));
  var params = {
    app_id: getApp().globalData.app_id,
    time_stamp: time_stamp,
    nonce_str: nonce_str,

    user_id: wx.getStorageSync('user_id'),

    // take_id: getApp().globalData.take_id,
    take_id:wx.getStorageSync('take_id'),
    type: 1,
  };
  var stringA = util.sort(params);
  console.log(stringA)
  var stringSignTemp = stringA + "&app_secert=1f8bcb22b633c72adf3d1e8bcf9bc1d4";
  var sign = md5.hexMD5(stringSignTemp).toUpperCase();
  wx.request({
    url: url + '/frog-web/api/user/task/taskOperate',
    data: {
      user_id: wx.getStorageSync('user_id'),
      // take_id: getApp().globalData.take_id,
      take_id: wx.getStorageSync('take_id'),
      type: 1,
      sign:sign,
      app_id: getApp().globalData.app_id,
      time_stamp: time_stamp,
      nonce_str: nonce_str,
    },
    success(res) {
      console.log(res);
      wx.showToast({
        title: res.data.m,
        icon: 'none',
        duration: 2000,
        success:function(){
          util.giveUp();
        }
      })


      
    },
    fail(error) {
      console.log(error)
    }
  }) 
},
//获取encryptedData（没有解密的步数）和iv（加密算法的初始向量）
getData: function (appid, session_key) {
  var that = this;
  wx.getWeRunData({
    success: function (res) {
      var encryptedData = res.encryptedData;
      var iv = res.iv;
      var pc = new WXBizDataCrypt(appid, session_key);
      var data = pc.decryptData(encryptedData, iv);
      if (data.stepInfoList){
        var stepList = data.stepInfoList;
        for (var i = 0; i < stepList.length; i++) {
          var mm = util.date(stepList[i].timestamp)
        }
      }
      
      if(that.endOff){
        getApp().globalData.endStep = stepList[stepList.length - 1].step
      } else if (that.onOff){
        getApp().globalData.endStep = stepList[stepList.length - 1].step
      }else{
        getApp().globalData.startStep = stepList[stepList.length - 1].step
      }
      if (getApp().globalData.startStep && getApp().globalData.endStep){
        getApp().globalData.finishStep = getApp().globalData.endStep - getApp().globalData.startStep;
        if (getApp().globalData.finishStep == '' || getApp().globalData.finishStep == 0){
          getApp().globalData.finishStep = 1;
        }
      }
      var watermark = data.watermark;
      getApp().globalData.beginTime = watermark.timestamp
      var mm = util.date(watermark.timestamp)
      console.log(getApp().globalData.finishStep)
      console.log(getApp().globalData.startStep)
      console.log(getApp().globalData.endStep)
      //到此为止
      var time_stamp = new Date().getTime();
      var nonce_str = util.getNum();
      if (that.endOff){
        var params = {
          app_id: getApp().globalData.app_id,
          time_stamp: time_stamp,
          nonce_str: nonce_str,

          // take_id: getApp().globalData.take_id,
          take_id: wx.getStorageSync('take_id'),
          type: 3,
          user_id: wx.getStorageSync('user_id'),
           //footStep:  getApp().globalData.finishStep,
          footStep: 780,
          // beginTime: getApp().globalData.beginTime,
          qrdistance: getApp().globalData.distance,
          task_id: wx.getStorageSync('task_id'),

        };
        var stringA = util.sort(params);
        console.log(stringA)
        var stringSignTemp = stringA + "&app_secert=1f8bcb22b633c72adf3d1e8bcf9bc1d4";
        var sign = md5.hexMD5(stringSignTemp).toUpperCase();

        wx.request({
          url: that.data.url,
          data: {
            // take_id: getApp().globalData.take_id,
            take_id: wx.getStorageSync('take_id'),
            type: 3,
            user_id: wx.getStorageSync('user_id'),
             //footStep:  getApp().globalData.finishStep,
            footStep: 780,
            // beginTime: getApp().globalData.beginTime, 
            qrdistance:getApp().globalData.distance,
            task_id: wx.getStorageSync('task_id'),
            sign:sign,
            app_id: getApp().globalData.app_id,
            time_stamp: time_stamp,
            nonce_str: nonce_str,
          },
          success(res) {
            console.log(res);
            console.log(getApp().globalData.finishStep);
            var time_stamp = new Date().getTime();
            var nonce_str = util.getNum();
            var params = {
              app_id: getApp().globalData.app_id,
              time_stamp: time_stamp,
              nonce_str: nonce_str,
              openId: getApp().globalData.openid,   
            };
            var stringA = util.sort(params);
            console.log(stringA)
            var stringSignTemp = stringA + "&app_secert=1f8bcb22b633c72adf3d1e8bcf9bc1d4";
            var sign = md5.hexMD5(stringSignTemp).toUpperCase();

            if(res.data.c == 1){
              wx.request({
                url: url + '/frog-web/api/user/security/thidRegisterLogin',
                data: {
                  openId: getApp().globalData.openid,

                  sign: sign,
                  app_id: getApp().globalData.app_id,
                  time_stamp: time_stamp,
                  nonce_str: nonce_str,

                },
                success(res) {
                  console.log('到此为止');
                  console.log(res);
                  if (res.data.r) {
                    getApp().globalData.balance = JSON.parse(res.data.r).userInfo.balance;
                    wx.setStorageSync('balance', JSON.parse(res.data.r).userInfo.balance);
                  }
                  console.log(wx.getStorageSync('user_id'));
                  console.log(wx.getStorageSync('take_id'));
                },
                fail(error) {
                  console.log(error)
                }
              })
              wx.redirectTo({
                url: './purse',
              })
            }else if(res.data.c == 10){
              wx.showToast({
                title: res.data.m,
                icon: 'none',
                duration: 5000,
                success:function(){
                  setTimeout(function () {
                    wx.redirectTo({
                      url: '../../index/index',
                    })
                  }, 5000)
                }
              })
            }else{
              wx.showToast({
                title: res.data.m,
                icon: 'none',
                duration: 3000
              })
            }
          },
          fail(error) {
            console.log(error)
          }
        })
      } 
      //继续前行
      else if (that.onOff){
        var params = {
          app_id: getApp().globalData.app_id,
          time_stamp: time_stamp,
          nonce_str: nonce_str,
          take_id: wx.getStorageSync('take_id'),
          type: 3,
          user_id: wx.getStorageSync('user_id'),
           //footStep:  getApp().globalData.finishStep,
          footStep: 780,
          // beginTime: getApp().globalData.beginTime,
          qrdistance: getApp().globalData.distance,
          task_id: wx.getStorageSync('task_id'),
        };
        var stringA = util.sort(params);
        console.log(stringA);
        var stringSignTemp = stringA + "&app_secert=1f8bcb22b633c72adf3d1e8bcf9bc1d4";
        var sign = md5.hexMD5(stringSignTemp).toUpperCase();
        console.log(wx.getStorageSync('take_id'));
        wx.request({
          url: that.data.on_url,
          data: {
            // take_id: getApp().globalData.take_id,
            take_id: wx.getStorageSync('take_id'),
            type: 3,
            user_id: wx.getStorageSync('user_id'),
             //footStep:  getApp().globalData.finishStep,
            footStep: 780,
            // beginTime: getApp().globalData.beginTime,
            qrdistance: getApp().globalData.distance,
            task_id: wx.getStorageSync('task_id'),

            sign:sign,
            app_id: getApp().globalData.app_id,
            time_stamp: time_stamp,
            nonce_str: nonce_str,
          },
          success(res) {
            console.log(res);
            if(res.data.c == 1){
              console.log(res);
              wx.redirectTo({
                url: './scan',
              }) 
            }else if (res.data.c == 10) {
              wx.showToast({
                title: res.data.m,
                icon: 'none',
                duration:5000,
                success: function () {
                  setTimeout(function () {
                    wx.redirectTo({
                      url: '../../index/index',
                    })
                  }, 5000)
                }
              })
            } else if (res.data.c == 8){

            }
            else{
              wx.showToast({
                title: res.data.m,
                icon: 'none',
                duration: 4000,
                  // success: function() {
                  //   setTimeout(function () {
                  //     wx.redirectTo({
                  //       url: '../../index/index',
                  //     })
                  //   }, 3000)

                  // }
              })
            }               
          },
          fail(error) {
            console.log(error);
          //   wx.showToast({
          //     title: '请到指定地点扫码',
          //     icon: 'none',
          //     duration: 1000
          //   })
           }
        })
         
      }else{
      }
    },
    // fail: function (res) {
    //   wx.showModal({
    //     title: '提示',
    //     content: '开发者未开通微信运动，请关注“微信运动”公众号后重试',
    //     showCancel: false,
    //     confirmText: '知道了'
    //   })
    // }
  })
},

})

