
var url = getApp().globalData.url;
var util = require('../../utils/util.js');
var md5 = require('../../utils/md5.js');
var encryption = util.encrypt();//后台传签名
Page({
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //点击授权登录
  bindGetUserInfo: function (e) {
    console.log(e.detail.userInfo);
    getApp().globalData.off = true;
    getApp().globalData.phoneOff = true;
    if (e.detail.userInfo) {
      getApp().globalData.userInfo = (e.detail.userInfo);
      // console.log(getApp().globalData.userInfo.avatarUrl);
      // console.log(getApp().globalData.userInfo.nickName);
      // console.log(getApp().globalData.openid);
      var time_stamp = new Date().getTime();
      var nonce_str = util.getNum();
      var pic_url=getApp().globalData.userInfo.avatarUrl.slice(8)
      // console.log(pic_url)
      var params = {
        app_id: getApp().globalData.app_id,
        time_stamp: time_stamp,
        nonce_str: nonce_str,

        openId: getApp().globalData.openid,
        sex: getApp().globalData.userInfo.gender,
        pic_url: pic_url, 
        nick_name: getApp().globalData.userInfo.nickName,
      };
      var stringA = util.sort(params);

      // var stringA = "app_id="+getApp().globalData.app_id+"&nick_name=" + getApp().globalData.userInfo.nickName + "&nonce_str=" + nonce_str + "&openId=" + getApp().globalData.openid + "&pic_url=" + getApp().globalData.userInfo.avatarUrl + "&sex=" + getApp().globalData.userInfo.gender + "&time_stamp=" + time_stamp+"&app_secert=1f8bcb22b633c72adf3d1e8bcf9bc1d4";

      // console.log(stringA)
      var stringSignTemp=stringA+"&app_secert=1f8bcb22b633c72adf3d1e8bcf9bc1d4";
      console.log(stringSignTemp)
      var sign = md5.hexMD5(stringSignTemp).toUpperCase();
console.log(sign)
      wx.request({
        url: url + '/frog-web/api/user/security/thidRegisterLogin',
        data: {
          app_id: getApp().globalData.app_id,
          time_stamp: time_stamp,
          nonce_str: nonce_str,

          openId: getApp().globalData.openid,
          sex: getApp().globalData.userInfo.gender,
          sign:sign,
          pic_url: pic_url,
          nick_name: getApp().globalData.userInfo.nickName,
        },
        success(res) {
          console.log(res);
          if (!getApp().globalData.user_id){
            var params = {
              app_id: getApp().globalData.app_id,
              time_stamp: time_stamp,
              nonce_str: nonce_str,
              openId: getApp().globalData.openid,
              type: 0,
            };
            var stringA = util.sort(params);
            console.log(stringA)
            var stringSignTemp = stringA + "&app_secert=1f8bcb22b633c72adf3d1e8bcf9bc1d4";
            var sign = md5.hexMD5(stringSignTemp).toUpperCase();
            wx.request({
              url: url + '/frog-web/api/user/security/thidRegisterLogin',
              data: {
                openId: getApp().globalData.openid,
                type: 0,
                
                sign:sign,
                app_id: getApp().globalData.app_id,
                time_stamp: time_stamp,
                nonce_str: nonce_str,
              },
              success(res) {
                console.log(res);
                if (res.data.r) {
                  getApp().globalData.balance = JSON.parse(res.data.r).userInfo.balance;
                  getApp().globalData.user_id = JSON.parse(res.data.r).userInfo.user_id;
                  wx.setStorageSync('user_id', JSON.parse(res.data.r).userInfo.user_id);
                  var m =wx.getStorageSync('user_id');
                  console.log(m);
                }
                console.log(getApp().globalData.user_id)
              },
              fail(error) {
                console.log(error)
              }
            })
          }
          wx.redirectTo({
            url: './index',
          })
        },
        fail(error) {
          console.log(error)
        }
      })
    } else {
      wx.showToast({
        title: '小程序需要您的授权,请点击授权登录',
        icon: 'none',
        duration: 2000,
        mask: true
      })
    }
  },
  onLoad: function (options) {
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function (res) { 
              getApp().globalData.userInfo = res.userInfo;
              // console.log(getApp().globalData.userInfo);
              //用户已经授权过
            }
          })
          wx.redirectTo({
            url: './index',
          })
        }else{

        }
      }
    })
  },
})