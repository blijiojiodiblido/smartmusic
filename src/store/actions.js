import * as types from './mutation-types'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/util'
import { saveSearch, clearSearch, deleteSearch, savePlay, saveFavorite, deleteFavorite } from 'common/js/cache'

/**
 * 返回歌曲对象在歌曲数组中的索引值
 * @param {Array} list 歌曲数组
 * @param {Object} song 歌曲对象
 */
function findIndex(list, song) {
  return list.findIndex(item => {
    return item.id === song.id
  })
}

// 选择指定歌曲开始播放，初始播放模式可能是顺序播放或者随机播放
export const selectPlay = function({ commit, state }, { list, index }) {
  commit(types.SET_SEQUENCE_LIST, list)
  if (state.mode === playMode.random) {
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    index = findIndex(randomList, list[index])
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

// 点击随机播放按钮，初始播放模式为随机播放
export const randomPlay = function({ commit }, { list }) {
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  let randomList = shuffle(list)
  commit(types.SET_PLAYLIST, randomList)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

// 在当前播放列表中插入歌曲
export const insertSong = function({ commit, state }, song) {
  // 定义播放列表（数组）的副本
  let playlist = state.playlist.slice()
  // 定义顺序列表（数组）的副本
  let sequenceList = state.sequenceList.slice()
  // 当前播放歌曲在播放列表中的位置
  let currentIndex = state.currentIndex
  // 当前播放的歌曲
  let currentSong = playlist[currentIndex]
  // 查找播放列表中是否有当前待插入的歌曲,并返回它的索引值
  let fpIndex = findIndex(playlist, song)
  // 插入歌曲时，插入的位置为当前播放歌曲的下一曲，则播放插入歌曲的索引需加“1”
  currentIndex++
  // 在播放列表插入歌曲
  playlist.splice(currentIndex, 0, song)
  // 如果播放列表中存在插入的歌曲
  // 删除原来的歌曲
  if (fpIndex > -1) {
    if (currentIndex > fpIndex) {
      // 如果插入歌曲的位置在已存在的相同歌曲的位置的后面
      // 已存在的相同歌曲的索引值（fpIndex）在插入歌曲后不会改变，直接删除即可。但删除后currentIndex需要减“1”
      playlist.splice(fpIndex, 1)
      currentIndex--
    } else {
      // 如果插入歌曲的位置在已存在的相同歌曲的位置的前面
      // 已存在的相同歌曲的索引值在插入歌曲后会加“1”，在删除时，它的索引值（fpIndex）需要加“1”
      playlist.splice(fpIndex + 1, 1)
    }
  }

  // 插入歌曲在顺序列表中插入的位置应为：当前播放歌曲在顺序列表中的索引加“1”
  let currentSIndex = findIndex(sequenceList, currentSong) + 1
  // 查找顺序列表中是否有当前待插入的歌曲,并返回它的索引值
  let fsIndex = findIndex(sequenceList, song)
  // 在顺序列表插入歌曲
  sequenceList.splice(currentSIndex, 0, song)

  // 如果顺序列表中存在插入的歌曲
  // 删除原来的歌曲
  if (fsIndex > -1) {
    if (currentSIndex > fsIndex) {
      // 如果插入歌曲在顺序列表中的位置在已存在的相同歌曲的位置的后面
      // 已存在的相同歌曲的索引值（fsIndex）在插入歌曲后不会改变，直接删除即可。
      sequenceList.splice(fsIndex, 1)
    } else {
      // 如果插入歌曲在顺序列表中的位置在已存在的相同歌曲的位置的前面
      // 已存在的相同歌曲的索引值会在插入歌曲后加“1”，删除时索引值（fsIndex）需要加“1”
      sequenceList.splice(fsIndex + 1, 1)
    }
  }

  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

// 保存搜索历史
export const saveSearchHistory = function({ commit }, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

// 删除搜索历史
export const deleteSearchHistory = function({ commit }, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

// 清除搜索历史
export const clearSearchHistory = function({ commit }) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

// 从播放列表及展示列表中删除歌曲
export const deleteSong = function({ commit, state }, song) {
  // 定义播放列表（数组）的副本
  let playlist = state.playlist.slice()
  // 定义顺序列表（数组）的副本
  let sequenceList = state.sequenceList.slice()
  // 当前播放歌曲在播放列表中的位置
  let currentIndex = state.currentIndex
  // 查找播放列表待删除歌曲的索引值
  let pIndex = findIndex(playlist, song)
  // 播放列表中删除歌曲
  playlist.splice(pIndex, 1)
  // 查找顺序列表待删除的索引值
  let sIndex = findIndex(sequenceList, song)
  // 顺序列表中删除歌曲
  sequenceList.splice(sIndex, 1)
  // 如果当前播放歌曲在待删除歌曲的前面，则无需处理currentIndex的值
  // 如果当前播放歌曲在待删除歌曲的后面，则歌曲删除以后，当前播放歌曲的索引会减“1”。
  // 如果当前播放歌曲是播放列表（playList）中的最后一首歌，此时删除它（播放列表中的最后一首歌）后，currentIndex的值刚好等于播放列表长度的值，则currentIndex的值需要减“1”才能找到对应的正确歌曲
  if (currentIndex > pIndex || currentIndex === playlist.length) {
    currentIndex--
  }

  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)

  if (!playlist.length) {
    commit(types.SET_PLAYING_STATE, false)
  } else {
    commit(types.SET_PLAYING_STATE, true)
  }
}

// 清空播放列表和展示列表
export const deleteSongList = function({ commit }) {
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_PLAYING_STATE, false)
}

// 保存播放历史
export const savePlayHistory = function({ commit }, song) {
  commit(types.SET_PLAY_HISTORY, savePlay(song))
}

// 保存当前歌曲到收藏列表
export const saveFavoriteList = function({ commit }, song) {
  commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}

// 从收藏列表中删除当前歌曲
export const deleteFavoriteList = function({ commit }, song) {
  commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}
