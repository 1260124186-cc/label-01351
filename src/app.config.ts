export default defineAppConfig({
  pages: [
    'pages/dashboard/index',
    'pages/review/index',
    'pages/reports/index',
    'pages/config/index',
    'pages/review-detail/index',
    'pages/report-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '管理后台',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#165dff',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/dashboard/index',
        text: '看板'
      },
      {
        pagePath: 'pages/review/index',
        text: '审核'
      },
      {
        pagePath: 'pages/reports/index',
        text: '举报'
      },
      {
        pagePath: 'pages/config/index',
        text: '配置'
      }
    ]
  }
});
