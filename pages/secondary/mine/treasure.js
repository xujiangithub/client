var url = getApp().globalData.url;

var md5 = require('../../../utils/md5.js');
var util = require('../../../utils/util.js');
var encryption = util.encrypt();//后台传签名
var page = 1;
var http =  function(that){
  // that.setData({
  //   hidden: false
  // }); 
  var time_stamp = new Date().getTime();
  var nonce_str = util.getNum();
  console.log(page);
  // if(page<=2){
    var params = {
      app_id: getApp().globalData.app_id,
      time_stamp: time_stamp,
      nonce_str: nonce_str,

      user_id: wx.getStorageSync('user_id'),
      page: page,
      status: that.data.status,
    };
    var stringA = util.sort(params);
    console.log(stringA)
    var stringSignTemp = stringA + "&app_secert=1f8bcb22b633c72adf3d1e8bcf9bc1d4";
    var sign = md5.hexMD5(stringSignTemp).toUpperCase();
 
    wx.request({
      url: url + '/frog-web/api/user/task/allMyTask',
      data: {
        user_id: wx.getStorageSync('user_id'),
        page: page,
        status: that.data.status,
        
        sign:sign,
        app_id: getApp().globalData.app_id,
        time_stamp: time_stamp,
        nonce_str: nonce_str,
      },
      success(res) {
        console.log(res);
        // var list;
        // if (res.data.r) {
        //   list = JSON.parse(res.data.r);
        //   that.setData({
        //     taskList: list.myTaskList,
        //     haveMore: list.haveMore,
        //     take_id: list.myTaskList[0].take_id ? list.myTaskList[0].take_id:' ',
        //   })}
        // // console.log(that.data.take_id);
        //   if (that.data.taskList.length >= 5){
        //     page++;

        //     // that.setData({
        //     //   hidden: true
        //     // });  
        //   }
          // 注释
          var l = that.data.taskList;
          if (res.data.r) {
            var list = JSON.parse(res.data.r).myTaskList;
            var haveMore = JSON.parse(res.data.r).haveMore;
            for (var i = 0; i < list.length; i++) {
              l.push(list[i])
            }
          }
          if (list[0].take_id){
            that.setData({
              taskList: l,
              haveMore: haveMore,
              take_id: list[0].take_id,
            })
          }else{
            that.setData({
              taskList: l,
              haveMore: haveMore,
            })
          }
          if (that.data.haveMore == 1){
            page++;
          }

        console.log(that.data.taskList)
      },
      fail(error) {
        console.log(error)
      },
    })
  }

// } 
Page({
  data: {
    // page: 1,
    hidden: true, 
    totalPage: 1,
    taskOff:true,
    taskList: [],
    haveMore:null,//是否有更多
    status:0,
    scrollTop: 0,//竖向滚动条的位置
    scrollHeight: 0,//竖向可视窗口的高度
    take_id:'',
  },
  //点击完成
  finish(){
    var that = this;
    var take_id = that.data.take_id;
    // console.log(take_id);
    var time_stamp = new Date().getTime();
    var nonce_str = util.getNum();
    var params = {
      app_id: getApp().globalData.app_id,
      time_stamp: time_stamp,
      nonce_str: nonce_str,
      user_id: wx.getStorageSync('user_id'),
      take_id: take_id,
      type: 2,
    };
    // console.log(take_id)
    var stringA = util.sort(params);
    console.log(stringA)
    var stringSignTemp = stringA + "&app_secert=1f8bcb22b633c72adf3d1e8bcf9bc1d4";
    var sign = md5.hexMD5(stringSignTemp).toUpperCase();
    // console.log(sign);
    wx.request({
      url: url + '/frog-web/api/user/task/taskOperate',
      data: {
        user_id: wx.getStorageSync('user_id'),
        take_id: take_id,
        type: 2,

        sign:sign,
        app_id: getApp().globalData.app_id,
        time_stamp: time_stamp,
        nonce_str: nonce_str,
      },
      success(res) {
        console.log(res);
        // wx.showToast({
        //   title: '任务已完成',
        //   icon: 'none',
        //   duration: 1000,
        // })
        // that.setData({
        //   taskOff: false,
        // })
        // http(that);
        wx.redirectTo({
          url: './treasure',
          // url:'../../index/index'
        });
        
      },
      fail(error) {
        // console.log(error)
      }
    }) 
  },
 
  //切换状态
  changeTask(){
    var that = this;
    page = 1
    that.setData({
      taskOff: !that.data.taskOff,
      page:1,
    })
    console.log(that.data.taskOff)
    if (that.data.taskOff) {
      that.setData({
        status: 0 ,
        taskList: [],
      }) 
      http(that);
    }else{  
      that.setData({
        status: 2,
        taskList: [],
      })
      http(that);
    }
    console.log(that.data.status)
  
  },
  //进入页面加载函数
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        // console.info(res.windowHeight);
        that.setData({
          scrollHeight: res.windowHeight
        });
      }
    });
    var status;
    http(that);
  },
  // onShow(){
  //   var that = this;
  //   http(that); 
  // },
  //滑到底部
  // onReachBottom: function () {
  bindDownLoad(){
    var that = this;
    http(that);   
  },
  //滑到顶部
  // onPullDownRefresh(){
  refresh(){
    page =1;
    this.setData({
      taskList: [],
      scrollTop: 0
    });
    http(this);
  },
  scroll: function (event) {
    this.setData({
      scrollTop: event.detail.scrollTop,
    });
    // console.log(event.detail.scrollTop)
  },
})