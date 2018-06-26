//app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')
var util = require('./utils/util.js')
var md5 = require('./utils/md5.js')
// var nonce_str = util.getNum()
App({
    onLaunch: function () {
      var encryption = util.encrypt();//后台传签名
      var that = this;
        qcloud.setLoginUrl(config.service.loginUrl)
        wx.login({
          success: function (res) {
            if (res.code) {
              getApp().globalData.code = res.code;

              var time_stamp = new Date().getTime();
              var nonce_str = util.getNum();
              var params = {
                code: res.code,
                app_id: getApp().globalData.app_id,
                time_stamp: time_stamp,
                nonce_str:nonce_str,
              };                    
              var stringA = util.sort(params);
              // console.log(stringA)
              var stringSignTemp = stringA + "&app_secert=1f8bcb22b633c72adf3d1e8bcf9bc1d4";
              var sign = md5.hexMD5(stringSignTemp).toUpperCase();
              // console.log(getApp().globalData.app_id)
              // console.log(getApp().globalData.time_stamp)
              // console.log(util.getNum)
              // console.log(sign)
              wx.request({
                 //url: 'http://47.97.186.182:8080/frog-web/api/user/security/getUserInfo',
                url: 'http://192.168.0.104:8080/frog-web/api/user/security/getUserInfo',
                data: {
                  code: res.code,

                  sign: sign,
                  app_id: getApp().globalData.app_id,
                  time_stamp: time_stamp,
                  nonce_str: nonce_str,
                },

                success(res) {
                  console.log(res);
                  getApp().globalData.openid = res.data.data.openid;
                  getApp().globalData.sessionKey = res.data.data.sessionKey;
                  // console.log(getApp().globalData.openid)

                
                  // console.log(getApp().globalData.openid);
                  // if (!getApp().globalData.user_id){
                  //   var time_stamp = new Date().getTime();
                  //   var nonce_str = util.getNum();
                  //   var params = {
                  //     app_id: getApp().globalData.app_id,
                  //     time_stamp: time_stamp,
                  //     nonce_str: nonce_str,
                  //     openId: getApp().globalData.openid,
                  //     type: 0,

                   
                  //   };
                  //   var stringA = util.sort(params);
                  //   console.log(stringA)
                  //   var stringSignTemp = stringA + "&app_secert=1f8bcb22b633c72adf3d1e8bcf9bc1d4";
                  //   var sign = md5.hexMD5(stringSignTemp).toUpperCase();
                  //   console.log(getApp().globalData.app_id)
                  //   console.log(getApp().globalData.time_stamp)
                  //   console.log(util.getNum)
                 
                  //   wx.request({
                  //   url: 'http://192.168.0.104:8080/frog-web/api/user/security/thidRegisterLogin',
                  //   data: {
                  //     openId: getApp().globalData.openid,
                  //     type: 0,
                  //     sign:sign,
                  //     app_id: getApp().globalData.app_id,
                  //     time_stamp: time_stamp,
                  //     nonce_str: nonce_str,
                      

                  //   },
                  //   success(res) {
                  //     console.log('获取user_id成功');
                  //     console.log(res)
                  //     if (res.data.r){
                  //       getApp().globalData.balance = JSON.parse(res.data.r).userInfo.balance;//每一期蛙币
                  //       getApp().globalData.user_id = JSON.parse(res.data.r).userInfo.user_id;
                  //         // getApp().globalData.user_id = 50;
                  //       getApp().globalData.wallet = JSON.parse(res.data.r).userInfo.wallet;//钱包
                  //     }
                  //     console.log(getApp().globalData.user_id )
                  //   },
                  //   fail(error) {
                  //     console.log(error)
                  //   }
                  // })
                  // }
                 
                },
                fail(error) {
                  // console.log(error)
                }
              })
            } else {
              console.log('登录失败！' + res.errMsg)
            }
          }
        });    
    },
    globalData:{
      phone:'',//手机号
      off:false,
      code:'',
      user_id:'',
      openid:'',
      sessionKey:'',
      latitude:'',
      longitude: '',
      latitude1:'',
      longitude1: '',
      task_id:'',
      phoneOff:false,//控制认证手机号弹窗
      url:'http://192.168.0.104:8080',
      startStep:'',//开始步数
      endStep: '',//结束步数
      finishStep:'',//完成步数
      beginTime:'',//开始时间
      userInfo:{},//用户信息
      balance:'',//蛙币
      take_id:'',//
      goList:[],//存放地图的

      app_id : 'walucky_frog_wx',
      time_stamp : new Date().getTime(),
      nonce_str : util.getNum(),
      avatarUrl:'',
      nickName:'',
      distance:'',//两个码点之间的距离
      markers:[],
      qr_url:'',//最开始扫码的url地址
      end_url: '',//结束的码的url地址
      task_info:'',//任务
       //url:'http://47.97.186.182:8080',
    }
})