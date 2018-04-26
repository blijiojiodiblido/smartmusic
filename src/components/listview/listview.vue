<template>
  <scroll @scroll="scroll" :listen-scroll="listenScroll" :probe-type="probeType" :data="data" class="listview" ref="listview">
    <ul>
      <li v-for="group in data" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <uL>
          <li @click="selectItem(item)" v-for="item in group.items" class="list-group-item">
            <img class="avatar" v-lazy="item.avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </uL>
      </li>
    </ul>
    <div class="list-shortcut" @touchstart.stop.prevent="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove" @touchend.stop>
      <ul>
        <li v-for="(item, index) in shortcutList" :data-index="index" class="item" :class="{'current':currentIndex===index}">{{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" ref="fixed" v-show="fixedTitle">
      <div class="fixed-title">{{fixedTitle}} </div>
    </div>
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>

<script>
import Scroll from 'components/scroll/scroll'
import Loading from 'components/loading/loading'
import { getData } from 'common/js/dom'

const TITLE_HEIGHT = 30
const ANCHOR_HEIGHT = 18

export default {
  props: {
    data: {
      type: Array,
      default: []
    }
  },
  computed: {
    shortcutList() {
      return this.data.map(group => {
        return group.title.substr(0, 1)
      })
    },
    fixedTitle() {
      if (this.scrollY > 0) {
        return ''
      }
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    }
  },
  data() {
    return {
      scrollY: -1,
      currentIndex: 0,
      diff: -1
    }
  },
  created() {
    this.probeType = 3
    this.listenScroll = true
    this.touch = {}
    this.listHeight = []
  },
  methods: {
    selectItem(item) {
      this.$emit('select', item)
    },
    // html5的touchstart事件
    onShortcutTouchStart(e) {
      // 点触目标（锚点）的索引
      let anchorIndex = getData(e.target, 'index')
      // 点触时的位置
      let firstTouch = e.touches[0] // touches是记录的触摸的点数，一个点为一个对象
      this.touch.y1 = firstTouch.pageY
      this.touch.anchorIndex = anchorIndex

      this._scrollTo(anchorIndex)
    },
    // html5的touchmove事件
    onShortcutTouchMove(e) {
      // 触摸移动过程中的位置
      let firstTouch = e.touches[0]
      this.touch.y2 = firstTouch.pageY
      // 手指在屏幕Y轴上的偏移量。
      let delta = ((this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT) | 0
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta

      this._scrollTo(anchorIndex)
    },
    refresh() {
      this.$refs.listview.refresh()
    },
    scroll(pos) {
      this.scrollY = pos.y
    },
    // 计算初始化时每个首字母标签块的顶部和底部距离父容器顶部的距离。如：热门块儿的上高度为listHeight[0]，下高度为listHeight[1]。A字母块儿的上高度为listHeight[1]，下高度为listHeight[2]
    _calculateHeight() {
      this.listHeight = []
      const list = this.$refs.listGroup
      let height = 0
      this.listHeight.push(height)
      for (let i = 0; i < list.length; i++) {
        let item = list[i]
        height += item.clientHeight
        this.listHeight.push(height)
      }
    },
    _scrollTo(index) {
      if (!index && index !== 0) {
        return
      }
      if (index < 0) {
        index = 0
      } else if (index > this.listHeight.length - 2) {
        index = this.listHeight.length - 2
      }
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0) // 第二个参数代表滚动是否存在动画。
      this.scrollY = this.$refs.listview.scroll.y
    }
  },
  watch: {
    data() {
      setTimeout(() => {
        this._calculateHeight()
      }, 20)
    },
    scrollY(newY) {
      const listHeight = this.listHeight
      // 当滚动到顶部，再往下拉，则newY > 0，currentIndex始终为0。
      if (newY > 0) {
        this.currentIndex = 0
        return
      }
      // 在中间部分滚动
      // 循环到数组（listHeight）长度减“1”为止是因为数组的值为歌手列表的上下高度值，数组（listHeight）长度比歌手列表长度多“1”
      for (let i = 0; i < listHeight.length - 1; i++) {
        // 首字母标签块的顶部高度值
        let height1 = listHeight[i]
        // 首字母标签块的底部高度值
        let height2 = listHeight[i + 1]
        // 如果新的scrollY值在字母块的height1与height2之间，则currentIndex为该字母块的索引值。
        if (-newY >= height1 && -newY < height2) {
          this.currentIndex = i
          this.diff = height2 + newY
          return
        }
      }
      // 当滚动到页面底部，再往上拉，则-newY大于最后一个元素的底部高度值，currentIndex始终为最后一个字母块的索引值。
      this.currentIndex = listHeight.length - 2
    },
    diff(newVal) {
      // 页面初始化时，此函数不会执行，滚动页面才会执行此函数。
      // 页面初始化后第一次开始滚动之时，“newVal”远远大于“TITLE_HEIGHT”，此时fixedTop的值为“0”
      let fixedTop = newVal > 0 && newVal < TITLE_HEIGHT ? newVal - TITLE_HEIGHT : 0
      if (this.fixedTop === fixedTop) {
        // diff第一次发生变化时，“this.fixedTop” 还未定义，return语句不会执行，执行后面的赋值语句
        return
      }
      // “fixedTop”的值不为“0”时，“this.fixedTop”的值会随着“fixedTop”的变化而变化
      this.fixedTop = fixedTop
      this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
    }
  },
  components: {
    Scroll,
    Loading
  }
}
</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable'

.listview {
  position: relative
  width: 100%
  height: 100%
  overflow: hidden
  background: $color-background

  .list-group {
    padding-bottom: 30px

    .list-group-title {
      height: 30px
      line-height: 30px
      padding-left: 20px
      font-size: $font-size-small
      color: $color-text-l
      background: $color-highlight-background
    }

    .list-group-item {
      display: flex
      align-items: center
      padding: 20px 0 0 30px

      .avatar {
        width: 50px
        height: 50px
        border-radius: 50%
      }

      .name {
        margin-left: 20px
        color: $color-text-l
        font-size: $font-size-medium
      }
    }
  }

  .list-shortcut {
    position: absolute
    z-index: 30
    right: 0
    top: 50%
    transform: translateY(-50%)
    width: 20px
    padding: 20px 0
    border-radius: 10px
    text-align: center
    background: $color-background-d
    font-family: Helvetica

    .item {
      padding: 3px
      line-height: 1
      color: $color-text-l
      font-size: $font-size-small

      &.current {
        color: $color-theme
      }
    }
  }

  .list-fixed {
    position: absolute
    top: 0
    left: 0
    width: 100%

    .fixed-title {
      height: 30px
      line-height: 30px
      padding-left: 20px
      font-size: $font-size-small
      color: $color-text-l
      background: $color-highlight-background
    }
  }

  .loading-container {
    position: absolute
    width: 100%
    top: 50%
    transform: translateY(-50%)
  }
}
</style>
