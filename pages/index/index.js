//index.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
let canSubmit = false;
let sendCodeCD = false;
const intervalTime = 60 ;
let sendCodeInterVal ;

Page({
  data: {
    banner: "http://wx-test.melktech.com/b2c/images/banner.jpg",
    sendCode:"发送",
    mobile : "",
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function () {
   
  },
  getMobile: function(e){
    const self = this;
    self.mobile = e.detail.value;
  },
  sendCode: function(e){
    const self = this;
    if (sendCodeCD){
      return false;
    }else{
      sendCodeCD = true;
    }
    if (!util.checkMobile(self.mobile)){
      wx.showToast({
        title: '手机号码有误',
        duration: 2000,
        icon: 'none'
      });
      sendCodeCD = false;
      return false;
    }
    let timeTemp = intervalTime;
    sendCodeInterVal = setInterval(function(e){
      timeTemp--;
      self.setData({
        sendCode: timeTemp
      })
      if(timeTemp<0){
        clearInterval(sendCodeInterVal);
        sendCodeCD = false;
        self.setData({
          sendCode: "发送"
        })
      }
    },1000);
    wx.request({
      url: app.globalData.baseUrl + 'employee/apiTool/sendCode',
      method: 'POST',
      dataType: 'json',
      data: {
        telPhoneNubmer: self.mobile
      },
      header: {
        "Cookie": app.globalData.sessionId
      },
      success(res) {
        const msg = "msg" in res.data ? res.data.msg : "失败";
        wx.showToast({
          title: msg,
          duration: 2000,
          icon: 'none'
        });
        canSubmit = true;
      },fail(e){
        wx.showToast({
          title: '发送失败，系统错误',
          duration: 2000,
          icon: 'none'
        });
      }
    })
  },
  formSubmit: function(e){
    wx.showLoading({title:'登陆中',mask:true});
    if (!canSubmit){
      wx.hideLoading();
      wx.showToast({title: '请先发送验证码',duration: 2000,icon: 'none'});
      return false;
    }
    const jobNum = e.detail.value.jobNum;
    const mobile = e.detail.value.mobile;
    const identifyingCode = e.detail.value.identifyingCode;
    if (jobNum.length > 20){
      wx.hideLoading();
      wx.showToast({title: "工号长度不能超过20位",duration: 2000,icon: 'none'});
      return false;
    }else if(!util.checkMobile(mobile)){
      wx.hideLoading();
      wx.showToast({ title: "手机号不合法", duration: 2000, icon: 'none' });
      return false;
    } else if (!util.checkIdentifyingCode(identifyingCode)){
      wx.hideLoading();
      wx.showToast({ title: "验证码不合法", duration: 2000, icon: 'none' });
      return false;
    }
    wx.request({
      url: app.globalData.baseUrl +'employee/apiOther4Employee/login',
      method: 'POST',
      dataType: 'json',
      data: {
        type: 0, //用于表示 是绑定登陆 还是一键登陆
        jobNum: jobNum,
        mobile: mobile,
        identifyingCode: identifyingCode
      },
      header: {
        "Cookie": app.globalData.sessionId
      },
      success(res) {
        wx.hideLoading();
        const msg = "msg" in res.data ? res.data.msg : "失败";
        wx.showToast({
          title: msg,
          duration: 2000,
          icon: 'none'
        });
        if(res.data.ret == "0"){
          app.globalData.jobNum = res.data.jobNum;
          wx.navigateTo({
            url: '../scanPage/scanPage'
          })
        }
      }, fail(e) {
        wx.hideLoading();   
        wx.showToast({
          title: '发送失败，系统错误',
          duration: 2000,
          icon: 'none'
        });
      }
    })
  },
  wxOneStepLogin: function(e){
    wx.showLoading({ title: '登陆中', mask: true });
    wx.request({
      url: app.globalData.baseUrl+'employee/apiOther4Employee/login',
      method: 'POST',
      dataType: 'json',
      data: {
        type: 1 //用于表示 是绑定登陆 还是一键登陆
      },
      header: {
        "Cookie": app.globalData.sessionId
      },
      success(res) {
        wx.hideLoading();
        const msg = "msg" in res.data ? res.data.msg : "失败";
        wx.showToast({
          title: msg,
          duration: 2000,
          icon: 'none'
        });
        if (res.data.ret == "0") {
          app.globalData.jobNum = res.data.jobNum;
          wx.navigateTo({
            url: '../scanPage/scanPage'
          })
        }
      }, fail(e) {
        wx.hideLoading();
        wx.showToast({
          title: '发送失败，系统错误',
          duration: 2000,
          icon: 'none'
        });
      }
    })
  }

})
