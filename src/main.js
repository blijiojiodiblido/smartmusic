import 'babel-polyfill'
import 'common/js/hack'
import Vue from 'vue'
import App from './App'
import router from './router'
import fastclick from 'fastclick'
import VueLazyload from 'vue-lazyload'
import store from './store'
import { SET_PLAY_HISTORY, SET_FAVORITE_LIST } from './store/mutation-types'
import { loadPlay, loadFavorite } from 'common/js/cache'
import { processSongsUrl } from 'common/js/song'

import 'common/stylus/index.styl'

/* eslint-disable no-unused-vars */
// import vConsole from 'vconsole'

fastclick.attach(document.body)

Vue.use(VueLazyload, {
  loading: require('common/image/default.png')
})

const historySongs = loadPlay()
processSongsUrl(historySongs).then(songs => {
  store.commit(SET_PLAY_HISTORY, songs)
})

const favoriteSongs = loadFavorite()
processSongsUrl(favoriteSongs).then(songs => {
  store.commit(SET_FAVORITE_LIST, songs)
})

/** ↓↓↓↓↓路由导航全局守卫↓↓↓↓↓ **/

let userStatusConfig = 1
const USER_LOGIN_STATUS = 1

router.beforeEach((to, from, next) => {
  if (to.path === '/user') {
    if (userStatusConfig !== USER_LOGIN_STATUS) {
      console.log('已检测用户登陆状态，此时用户的用户状态为：未登陆，并返回首页。')
      next({ path: '/' })
    } else {
      console.log('已检测用户登陆状态，此时用户的登陆状态为：已登陆')
      next()
    }
  } else {
    console.log('未检测用户登陆状态，此时用户的登陆状态为：未知')
    next()
  }
})

/** ↑↑↑↑↑路由导航全局守卫↑↑↑↑↑ **/

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
