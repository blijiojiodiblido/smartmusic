<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script>
import BScroll from 'better-scroll'

const DIRECTION_H = 'horizontal'
const DIRECTION_V = 'vertical'

export default {
  props: {
    probeType: {
      type: Number,
      default: 1
    },
    click: {
      type: Boolean,
      default: false
    },
    listenScroll: {
      type: Boolean,
      default: false
    },
    data: {
      type: Array,
      default: null
    },
    pullup: {
      type: Boolean,
      default: false
    },
    beforeScroll: {
      type: Boolean,
      default: false
    },
    refreshDelay: {
      type: Number,
      default: 20
    },
    direction: {
      type: String,
      default: DIRECTION_V
    }
  },
  mounted() {
    setTimeout(() => {
      this._initScroll()
    }, 20)
  },
  methods: {
    _initScroll() {
      if (!this.$refs.wrapper) {
        return
      }
      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        click: this.click,
        eventPassthrough: this.direction === DIRECTION_V ? DIRECTION_H : DIRECTION_V
      })

      if (this.listenScroll) {
        this.scroll.on('scroll', pos => {
          this.$emit('scroll', pos)
        })
      }

      if (this.pullup) {
        this.scroll.on('scrollEnd', () => {
          if (this.scroll.y <= this.scroll.maxScrollY + 50) {
            this.$emit('scrollToEnd')
          }
        })
      }

      if (this.beforeScroll) {
        this.scroll.on('beforeScrollStart', () => {
          this.$emit('beforeScroll')
        })
      }
    },
    disable() {
      this.scroll && this.scroll.disable()
    },
    enable() {
      this.scroll && this.scroll.enable()
    },
    refresh() {
      this.scroll && this.scroll.refresh()
    },
    scrollTo() {
      // 在JavaScript中，函数就是一个对象，函数在没有返回值时默认返回的一个对象。
      // 当一个对象A（this object）没有某个方法，但是其他对象B（other object）有这一方法，我们可以借助call()方法或apply()方法，用其它对象B（other object）的方法来操作。
      // apply()方法与call()方法的第一个参数是对象A（this object），第二个参数为传递给对象B（other object）的该方法的参数。
      // 形式为：B.fn.apply(A,[arguments])或者B.fn.call(A,arg1,arg2,arg3……)
      // 本例中scrollTo方法运行的上下文并未改变，只是传递了参数。因为传递的参数个数并不明确，因此使用apply()方法更加妥当。
      this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
      // this.scroll && this.scroll.scrollTo(args)
    },
    scrollToElement() {
      this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
      // this.scroll && this.scroll.scrollToElement(args)
    }
  },
  watch: {
    data() {
      setTimeout(() => {
        this.refresh()
      }, this.refreshDelay)
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
