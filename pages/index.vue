<template>
  <section class="section">
    <loading v-if="showModal" />
    <div id="wrapper" class="container">
      <p>あなたのお名前：{{ name }}</p>
      <b-loading :is-full-page="false" :active.sync="isLoading" :can-cancel="false"></b-loading>
      <p>{{ question.num }} {{ question.content }}</p>
    </div>
    <div v-if="top">
      <p>クイズ大会だよ〜</p>
      <p>みんなが入るまで待っててね</p>
    </div>
    <div v-else>
      <button class="button is-info" @click="answer('1')">1</button>
      <button class="button is-info" @click="answer('2')">2</button>
      <button class="button is-info" @click="answer('3')">3</button>
      <button class="button is-info" @click="answer('4')">4</button>
    </div>
  </section>
</template>

<script>
import io from 'socket.io-client'
import questions from '../assets/api/question.json'
import loading from '~/components/Loading.vue'

export default {
  components: {
    loading
  },
  data() {
    return {
      socket: '',
      isLoading: true,
      questions: questions,
      question: '',
      loading: false,
      showModal: false,
      top: true,
			name: ''
    }
  },
  mounted() {
    // セッションストレージから名前を取り出す
    this.name = sessionStorage.getItem('name');

    // VueインスタンスがDOMにマウントされたらSocketインスタンスを生成する
    this.socket = io()

    this.socket.on('Question', question => {
      this.question = questions[question.id]
    })

    // コンポーネントがマウントされてから1秒間はローディングする
    setTimeout(() => {
      this.isLoading = false
    }, 1000)
  },
  methods: {
    answer(value){
      let ans = {
        id: '',
        ans: value,
        correct: '',
      }

      // idと正解かどうかもサーバに送る
      ans.id = this.name
      ans.correct = (ans.ans == this.question.answer) ? true : false

      // サーバー側に回答を送信する
      this.socket.emit('Answer', ans)
      // 要素を空にする
      ans = ''
      this.loading = true
      this.showModal = true
    }
  },
  watch: {
    question: function(){
      this.showModal = false
      this.top = (this.question.id == 0) ? true : false
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