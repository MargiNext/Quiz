<template>
  <section class="section">
    
		<p>最終結果発表〜</p>
  </section>
</template>

<script>
import io from 'socket.io-client'
import questions from '../assets/api/question.json'
import loading from '~/components/Loading.vue'
import eachResult from '~/components/eachResult.vue'

export default {
  components: {
    loading,
    eachResult
  },
  data() {
    return {
    }
  },
  mounted() {
    // VueインスタンスがDOMにマウントされたらSocketインスタンスを生成する
    this.socket = io()

    // コンソールへ戻るためのトリガの受け取り
    this.socket.on('goScreen', result => {
			this.$router.push('/screen')
    })

  },
  methods: {
  },
  watch: {
  }
}
</script>

<style scoped>
</style>