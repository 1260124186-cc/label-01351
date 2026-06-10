export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/mine/index',
    'pages/admin/index',
    'pages/review-detail/index',
    'pages/report-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '乡村文化库',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#165dff',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
});
