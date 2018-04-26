import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutations'
// 打印state修改记录，包括pre-state和next-state
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex)

// 在开发环境中检测state修改是否由提交mutation而产生
const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
