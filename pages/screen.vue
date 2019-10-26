<template>
  <section class="section">
    
    <div v-if="show">
			正解は{{ question.answer }}
    </div>

    <div id="wrapper" class="container">
      <b-loading :is-full-page="false" :active.sync="isLoading" :can-cancel="false"></b-loading>
      <p>{{ question.num }} {{ question.content }}</p>
    </div>
    <div v-if="top">
      <p>クイズ大会だよ〜</p>
      <p>みんなが入るまで待っててね</p>
    </div>
    <div v-else>
      <button class="button is-primary is-outlined" @click="answer('1')">1. {{ question.select_1 }}</button>
      <button class="button is-success is-outlined" @click="answer('2')">2. {{ question.select_2 }}</button>
      <button class="button is-info is-outlined" @click="answer('3')">3. {{ question.select_3 }}</button>
      <button class="button is-link is-outlined" @click="answer('4')">4. {{ question.select_4 }}</button>
    </div>
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
      socket: '',
      isLoading: true,
      questions: questions,
      question: '',
      loading: false,
      showModal: false,
      show: false,
      top: true,
      name: '',
      corNum: 0,
			corNum_before: 0,
      ans: {
        id: '',
        ans: '',
        correct: false,
      }
    }
  },
  mounted() {
    // VueインスタンスがDOMにマウントされたらSocketインスタンスを生成する
    this.socket = io()

    // 問題の受け取り
    this.socket.on('Question', question => {
      this.question = questions[question.id]
    })

    // 回答トリガの受け取り
    this.socket.on('eachResult', result => {
      this.show = result
		})

    // 最終結果発表トリガの受け取り
    this.socket.on('finalResult', result => {
			this.$router.push('/finalResult')
    })

    // コンポーネントがマウントされてから1秒間はローディングする
    setTimeout(() => {
      this.isLoading = false
    }, 1000)
  },
  methods: {
  },
  watch: {
    question: function(){
      this.show = false
      this.top = (this.question.id == 0) ? true : false
      this.corNum_before = this.corNum
      console.log(this.top)
    }
  }
}
</script>

<style scoped>
#wrapper
{
  max-width: 600px;
}
</style>