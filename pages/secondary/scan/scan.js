// pages/secondary/scan/scan.js
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.js');
var qqmapsdk= new QQMapWX({
  key: 'ST5BZ-GJFKG-CBKQN-ITYQI-JR425-KTBYR' 
});
var url = getApp().globalData.url;
var util = require('../../../utils/util.js');
var md5 = require('../../../utils/md5.js');
Page({
  data: {
    lng: '',
    lat: '',
    latitude: '',
    longitude: '',//地图中心
    markers:[],
    task_id:'',
    taskList:{},
    task_info:'',
    agreeList:[
      { name: '同意', value: '1', checked: 'true'},
      { name: '不同意', value: '0'},
    ],
  },
  //点击Go开始任务
  toGo:function(event){
    var goList={};
    var that = this;
    // goList.taskList = that.data.taskList;
    getApp().globalData.task_id = that.data.task_id,
    //获得两个经纬度之间的距离
   qqmapsdk.calculateDistance({
      from: { latitude: wx.getStorageSync('lat'), longitude: wx.getStorageSync('lng') },
      to: [
        // { latitude: 30.162999, longitude: 120.202961 },//汤家桥东公交站
        { latitude: wx.getStorageSync('task_lat'), longitude: wx.getStorageSync('task_lng')},//小灶头饭店
      ],
      success: function (res) {
        console.log(res);
        getApp().globalData.distance = res.result.elements[0].distance
        console.log(getApp().globalData.distance );
        // console.log(getApp().globalData.take_id)
        var time_stamp = new Date().getTime();
        var nonce_str = util.getNum();
        var params = {
          app_id: getApp().globalData.app_id,
          time_stamp: time_stamp,
          nonce_str: nonce_str,

          user_id: wx.getStorageSync('user_id'),
          task_id: wx.getStorageSync('task_id'),
          // task_name:,
          task_info: getApp().globalData.task_info,
          address:wx.getStorageSync('address'),
        };
        var stringA = util.sort(params);
        console.log(stringA);
        console.log(wx.getStorageSync('address'))
        var stringSignTemp = stringA + "&app_secert=1f8bcb22b633c72adf3d1e8bcf9bc1d4";
        var sign = md5.hexMD5(stringSignTemp).toUpperCase();
        console.log(sign);
        wx.request({
          url: url + '/frog-web/api/user/task/taskStart',
          data: {
            user_id: wx.getStorageSync('user_id'),
            task_id: wx.getStorageSync('task_id'),
            task_info: getApp().globalData.task_info,
            address: wx.getStorageSync('address'),
            
            sign: sign,
            app_id: getApp().globalData.app_id,
            time_stamp: time_stamp,
            nonce_str: nonce_str,
          },
          success(res) {
            console.log(res);
            if (res.data.c == 1) {
              getApp().globalData.take_id = JSON.parse(res.data.r).take_id;
              wx.setStorageSync('take_id', JSON.parse(res.data.r).take_id);

              // console.log(getApp().globalData.take_id);
              console.log(wx.getStorageSync('take_id'));
              wx.redirectTo({
                // url: './go?goList=' + JSON.stringify(goList),
                url: './go?id=5555',
                success: function (res) {
                },
                fail: function (error) {
                  console.log(error)
                }
              })
            }
           
          },
          fail(error) {
            console.log(error);
          }
        })
      },
      fail(error) {
        console.log(error)
      }
    }) 
  },
  //点击放弃
  giveUp() {
    var time_stamp = new Date().getTime();
    var nonce_str = util.getNum();

    var params = {
      app_id: getApp().globalData.app_id,
      time_stamp: time_stamp,
      nonce_str: nonce_str,

      user_id: wx.getStorageSync('user_id'),
      task_id: wx.getStorageSync('task_id'),
      type: 1
    };
    var stringA = util.sort(params);
    console.log(stringA)
    var stringSignTemp = stringA + "&app_secert=1f8bcb22b633c72adf3d1e8bcf9bc1d4";
    var sign = md5.hexMD5(stringSignTemp).toUpperCase();

    // wx.request({
    //   url: url +'/frog-web/api/user/task/taskOperate',
    //   data: {
    //     user_id:  wx.getStorageSync('user_id'),
    //     task_id: this.data.task_id,
    //     type: 1,

    //     sign:sign,
    //     app_id: getApp().globalData.app_id,
    //     time_stamp:time_stamp,
    //     nonce_str: nonce_str,
    //   },
    //   success(res) {
    //     console.log(res)
    //   },
    //   fail(error) {
    //     console.log(error)
    //   }
    // })
    util.giveUp();
  },
  //点击刷新
  refresh(){
    var that = this;
  that.http();
  }, 
  
  onLoad: function (options) {
    var that = this;
    that.http();
  },
  //请求任务
  http() {
    var that = this;
    var time_stamp = new Date().getTime();
    var nonce_str = util.getNum();
    var params = {
      app_id: getApp().globalData.app_id,
      time_stamp: time_stamp,
      nonce_str: nonce_str,

      user_id: wx.getStorageSync('user_id'),
      type: 2,
      beginTime: 1111
    };
    var stringA = util.sort(params);
    console.log(stringA)
    var stringSignTemp = stringA + "&app_secert=1f8bcb22b633c72adf3d1e8bcf9bc1d4";
    var sign = md5.hexMD5(stringSignTemp).toUpperCase();
    wx.request({
      url: wx.getStorageSync('qr_url'),
      data: {
        user_id: wx.getStorageSync('user_id'),
        type: 2,
        beginTime: 1111,

        sign: sign,
        app_id: getApp().globalData.app_id,
        time_stamp: time_stamp,
        nonce_str: nonce_str,
      },
      success(res) {
        console.log(res);
        if (res.data.r) {
          var arr = JSON.parse(res.data.r);
          console.log(arr)
          getApp().globalData.task_info = arr.task_info;
          // getApp().globalData.task_id = arr.task_id;
          wx.setStorageSync('task_id', arr.task_id);
          console.log(wx.getStorageSync('task_id'))
          wx.setStorageSync('address', arr.address);
          console.log(wx.getStorageSync('address'));
          console.log(555)
          that.setData({
            task_info: arr.task_info
          })
        }
        console.log(arr)
        qqmapsdk.geocoder({
          address: arr.qr_code_address,
          success: function (res) {
            console.log(res.result);
            wx.setStorageSync('lng', res.result.location.lng);//扫码地址
            wx.setStorageSync('lat', res.result.location.lat);
            console.log(wx.getStorageSync('lng'));
            console.log(wx.getStorageSync('lat'));
            qqmapsdk.geocoder({
              address: arr.address,
              success: function (res) {
                console.log(res.result);
                wx.setStorageSync('task_lng', res.result.location.lng);//任务地址
                wx.setStorageSync('task_lat', res.result.location.lat);
                if (wx.getStorageSync('lat') && wx.getStorageSync('lng') && wx.getStorageSync('task_lat') && wx.getStorageSync('lng')) {
                  console.log(111)
                  var markers = [
                    {
                      latitude: wx.getStorageSync('lat'),
                      longitude: wx.getStorageSync('lng'),
                      iconPath: '../../../images/my-address.png',
                      width: 50,
                      height: 64,
                      id: arr.task_id+1
                    },
                    {
                      latitude: wx.getStorageSync('task_lat'),
                      longitude: wx.getStorageSync('task_lng'),//接后台二维码数据
                      iconPath: '../../../images/code-address.png',
                      width: 44,
                      height: 58,
                      id: arr.task_id,
                    },
                  ];
                  console.log(markers);
                  wx.setStorageSync('markers', markers),
                    that.setData({
                      latitude: wx.getStorageSync('lat'),
                      longitude: wx.getStorageSync('lng'),
                      markers: markers,
                    })
                }
                else {
                  console.log(222)
                  var markers = [
                    {
                      latitude: wx.getStorageSync('lat'),
                      longitude: wx.getStorageSync('lng'),
                      iconPath: '../../../images/my-address.png',
                      width: 50,
                      height: 64,
                      id: arr.task_id+1
                    },
                    {
                      latitude: wx.getStorageSync('task_lat'),
                      longitude: wx.getStorageSync('task_lng'),//接后台二维码数据
                      iconPath: '../../../images/code-address.png',
                      width: 44,
                      height: 58,
                      id: arr.task_id,
                    },
                  ];
                  console.log(markers);
                  wx.setStorageSync('markers', markers),
                    that.setData({
                      latitude: wx.getStorageSync('lat'),
                      longitude: wx.getStorageSync('lng'),
                      markers: markers,
                    })
                }
              },
            });
          },
          fail: function (error) {
            console.log(error);
          },
        });
      }
    })
  }, 
})