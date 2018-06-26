var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk = new QQMapWX({
  key: 'ST5BZ-GJFKG-CBKQN-ITYQI-JR425-KTBYR'
});
var url = getApp().globalData.url;
var user_id = wx.getStorageSync('user_id');
var md5 = require('../../utils/md5.js');
var util = require('../../utils/util.js');
var encryption = util.encrypt();//后台传签名
Page({
  data: {
    phone:'',
    code:'',
    codeOff:'',
    url:'',//接收扫码地址
    taskList:{},//接收任务
    phoneOff:false,
     
  },
  //控制认证手机号的弹窗
  changePhone(){
    var that = this;
    that.setData({
      phoneOff: true
    })
    
    console.log(that.data.phoneOff)

  },
  close(){
    var that = this;
    // console.log(55)
    that.setData({
      phoneOff: false
    })

    console.log(that.data.phoneOff )
  },
  //点击确认
  login(){
    var that = this;
    if (that.data.code == '' || that.data.phone == ''){
      wx.showToast({
        title: '请将信息填写完整',
        icon: 'none',
        duration: 1000
      })
    }else{
      var app_id = 'walucky_frog_wx';
      var time_stamp = new Date().getTime();
      var nonce_str = util.getNum();
      wx.setStorageSync('phone', that.data.phone);
      var params = {
        phone: that.data.phone,
        vCode: that.data.code,
        user_id: wx.getStorageSync('user_id'),
        type: Number(0),

        app_id: getApp().globalData.app_id,
        time_stamp: getApp().globalData.time_stamp,
        nonce_str: getApp().globalData.nonce_str,
      };
      //排序
      var stringA = util.sort(params);
      console.log(stringA)
      var stringSignTemp = stringA + "&app_secert=1f8bcb22b633c72adf3d1e8bcf9bc1d4";
      var sign = md5.hexMD5(stringSignTemp).toUpperCase();
      // console.log(getApp().globalData.user_id);
      wx.request({
        url: url + '/frog-web/api/user/security/codeLogin',
        data: {
          phone: that.data.phone,
          vCode: that.data.code,
          user_id: wx.getStorageSync('user_id'),
          type: Number(0),

          sign: sign,
          app_id: getApp().globalData.app_id,
          time_stamp: getApp().globalData.time_stamp,
          nonce_str: getApp().globalData.nonce_str,

        },

        success: function (res) {
          console.log(res);
          getApp().globalData.phone = that.data.phone;
          // getApp().globalData.phoneOff  = false;
          var arr = {}
          if (res.data.r) {
            arr = JSON.parse(res.data.r);
            // getApp().globalData.user_id = arr.user_id; 
          }
          wx.showToast({
            title: res.data.m,
            icon: 'none',
            duration: 3000
          })
          if (res.data.c == 1) {
            that.setData({
              phoneOff: false
            })
          }
        },
        fail(error) {
          console.log(error);
        }
      })
    }
    
  },
   //扫描二维码
  toCode: function (appid, session_key) {
    var that = this;
    wx.getWeRunData({
      success(res){
      that.code()
      },
      fail: function (res) {
        wx.showModal({
          title: '提示',
          content: '开发者未开通微信运动，请关注“微信运动”公众号后重试',
          showCancel: false,
          confirmText: '知道了'
        })
      }
    })
  },
 
  code(){
    var that = this;
    console.log(wx.getStorageSync('user_id'));
    console.log (wx.getStorageSync('phone'));
    if (wx.getStorageSync('user_id') && wx.getStorageSync('phone')){
      wx.scanCode({
        onlyFromCamera: true,
        success: function (res) {
          console.log(res);
            if (res.result) {
              that.data.url = res.result;
              wx.setStorageSync('qr_url', res.result);
              var time_stamp = new Date().getTime();
              var nonce_str = util.getNum();
              var params = {
                app_id: getApp().globalData.app_id,
                time_stamp: time_stamp,
                nonce_str: nonce_str,
                user_id: wx.getStorageSync('user_id'),
                type: 0,
                beginTime: 1111
              };
              var stringA = util.sort(params);
              console.log(stringA)
              var stringSignTemp = stringA + "&app_secert=1f8bcb22b633c72adf3d1e8bcf9bc1d4";
              var sign = md5.hexMD5(stringSignTemp).toUpperCase();
              console.log(that.data.url);
              wx.request({
                url: that.data.url,
                data: {
                  user_id: wx.getStorageSync('user_id'),
                  type: 0,
                  beginTime: 1111,
                  sign: sign,
                  app_id: getApp().globalData.app_id,
                  time_stamp: time_stamp,
                  nonce_str: nonce_str,
                },
                success(res) {
                  console.log(res);
                  if (res.data.c == 1) {
                    var arr = JSON.parse(res.data.r);
                    that.data.taskList = arr;
                    getApp().globalData.task_info = arr.task_info;
                    wx.setStorageSync('task_id',arr.task_id);
                    console.log(wx.setStorageSync('task_id'));
                    wx.setStorageSync('address', arr.address);
                    //码地址解析
                    qqmapsdk.geocoder({
                      address: arr.qr_code_address,
                      success: function (res) {
                        console.log(res.result);
                        wx.setStorageSync('lng', res.result.location.lng);//扫码地址,码在的地址
                        wx.setStorageSync('lat', res.result.location.lat);
                        //任务地址解析
                        qqmapsdk.geocoder({
                          address: arr.address,
                          success: function (res) {
                            console.log(res.result);
                            wx.setStorageSync('task_lng', res.result.location.lng);//任务地址
                            wx.setStorageSync('task_lat', res.result.location.lat);
                            wx.redirectTo({
                              url: '../secondary/scan/scan?taskList=' + JSON.stringify(that.data.taskList),
                            })
                          },
                          fail: function (error) {
                            console.log(error);
                          },
                        });

                      },
                      fail: function (error) {
                        console.log(error);
                      },
                    });
                   
                    
                  } else if (res.data.c == 4) {
                    wx.showToast({
                      title: res.data.m,
                      icon: 'none',
                      duration: 3000,
                      success: function () {
                        setTimeout(function () {
                          wx.navigateTo({
                            url: '../secondary/mine/treasure',
                          })
                        }, 3000)
                       }
                    })
                   
                  } else if (res.data.c == 6) {
                    wx.showToast({
                      title: '请先绑定手机号',
                      icon: 'none',
                      duration: 3000,
                    })
                  }else if (res.data.c == 8) {
                    wx.showToast({
                      title: res.data.m,
                      icon: 'none',
                      duration: 3000
                    })
                  }
                  else {
                    wx.showToast({
                      title: res.data.m,
                      icon: 'none',
                      duration: 3000,
                    })
                  }
                },
                fail(error) {
                  console.log(error)
                }
              })
            } 
           
        },
      })
     }
    else{
      wx.showToast({
        title: '请绑定手机号',
        icon:'none',
        duration: 1000
      })
    }
  },
  //点击获取验证码
  getCode(){
    console.log(45)
    var that = this;

    var time_stamp = new Date().getTime();
    var nonce_str = util.getNum();

    if(that.data.codeOff){
      var params = {
        phone: that.data.phone,
        type: 1,

        app_id: getApp().globalData.app_id,
        time_stamp: time_stamp,
        nonce_str: nonce_str,
      };
      var stringA = util.sort(params);
      console.log(stringA)
      var stringSignTemp = stringA + "&app_secert=1f8bcb22b633c72adf3d1e8bcf9bc1d4";
      var sign = md5.hexMD5(stringSignTemp).toUpperCase();
      wx.request({
        url: url +'/frog-web/api/common/sys/getCode',
        method: 'GET',
        data: {
          phone:that.data.phone,
          type:1,

          sign: sign,
          app_id: getApp().globalData.app_id,
          time_stamp: time_stamp,
          nonce_str: nonce_str,
        },
        success: function (res) {
           console.log(res)
          wx.showToast({
            title: res.data.m,
            icon: 'none',
            duration: 1000
          })
        },
        fail(error) {
          console.log(error)
        }
      });
      // wx.login({
      //   success: function (res) {
      //     if (res.code) {
      //       //发起网络请求
      //       wx.request({
      //         url: url +'/frog-web/api/common/sys/getCode',
      //         data: {
      //           code: res.code,
      //         },
      //         success(res){
      //           console.log(res)
      //           // console.log(111)
      //         },
      //         fail(error) {
      //           console.log(error)
      //         }
      //       })
      //     } else {
      //       console.log('登录失败！' + res.errMsg)
      //     }
      //   }
      // });
    }
  },
  //输入手机号
  submitPhone(e){
    var phone = e.detail.value;


    
    if (!(/^[1][3,4,5,7,8][0-9]{9}$/.test(phone))) {
      this.setData({
        codeOff: false,
      })
      wx.showToast({
        title: '手机号有误',
        icon: 'none',
        duration: 3000
      })
      }else{
        this.setData({
          phone: phone,
          codeOff:true,
        })
      }
  },
  //输入验证码
  submitCode(e){
    var that = this; 
    console.log(e.detail.value)
    that.setData({
      code: e.detail.value
    })
    console.log(that.data.code)
  },
  onLoad: function (options) {
    var that = this;
// 地址解析
    // qqmapsdk.geocoder({
    //   address: '浙江省杭州市滨江区长江南路336号(动漫会展中心)',
    //   success:function (res) {
    //     console.log(res.result);
    //     getApp().globalData.lng = res.result.location.lng;
    //     getApp().globalData.lat = res.result.location.lat;
    //     console.log(getApp().globalData.lng);
    //     console.log(getApp().globalData.lat);
    //   },
    //   fail: function (error) {
    //     console.log(error);
    //   },
    // });
// 获得两个经纬度之间的距离
//     qqmapsdk.calculateDistance({
//       from: JSON.parse(JSON.stringify({ latitude: 30.159940, longitude: 120.203430, })),
//       to: [
//         // { latitude: 30.162999, longitude: 120.202961 },//汤家桥东公交站
//         { latitude: 30.167110, longitude: 120.206490 },//小灶头饭店
//       ],
//       success: function (res) {
//         console.log(res);
//         var distance = res.result.elements[0].distance
//         console.log(distance)
//       },
//       fail(error) {
//         console.log(error)
//       }
//     })
  },
})