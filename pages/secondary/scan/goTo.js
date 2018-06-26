// pages/secondary/scan/goTo.js
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.js');
var qqmapsdk = new QQMapWX({
  key: 'ST5BZ-GJFKG-CBKQN-ITYQI-JR425-KTBYR'
});
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goList:null,
    latitude:null,
    longitude:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  click(){
    wx.openLocation({
      latitude: getApp().globalData.latitude1,
      longitude: getApp().globalData.longitude1,
      // latitude: 30.268015,
      // longitude: 120.238705, 
      scale: 14,
      success(res) {
        console.log(res);
        console.log(333)
      },
      fail(error) {
        console.log(error);
        console.log(111)
      }
    });
  },
  onLoad: function (options) {
    var that =this;
    if (options.goList){
      that.data.goList = JSON.parse(options.goList); 
    }else{
      console.log('pp')
      wx.navigateTo({
        url: './go?id=11',
      })
    }
    
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
        })
        // console.log(res.latitude),
        // console.log(res.longitude),
          getApp().globalData.latitude1 = that.data.goList.markers[1].latitude,
          getApp().globalData.longitude1 = that.data.goList.markers[1].longitude,
          console.log(getApp().globalData.longitude1);
        that.click(); 
      },
    })
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})