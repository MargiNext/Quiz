<template>
  <section class="section">
    
    <!-- ローディング画面 -->
    <loading v-if="showModal" />
    <!-- 各結果を表示 -->
    <each-result v-if="showModal_re" :is_correct="this.ans.correct" />

    <div id="wrapper" class="container">
      <p>あなたのお名前：{{ name }}</p>
      <p>あなたの正解数：{{ this.corNum_before }}</p>
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
      showModal_re: false,
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
    // セッションストレージから名前を取り出す
    this.name = sessionStorage.getItem('name');

    // 最新の情報をとってくる
    this.corNum = sessionStorage.getItem('corNum');

    // VueインスタンスがDOMにマウントされたらSocketインスタンスを生成する
    this.socket = io()

    // 問題の受け取り
    this.socket.on('Question', question => {
      this.question = questions[question.id]
      console.log('ボタンおされたよ2')
    })

    // 回答トリガの受け取り
    this.socket.on('eachResult', result => {
      this.showModal_re = result
      console.log('ボタンおされたよ')
    })

    // コンポーネントがマウントされてから1秒間はローディングする
    setTimeout(() => {
      this.isLoading = false
    }, 1000)
  },
  methods: {
    answer(value){
      this.ans.ans = value
      // idと正解かどうかもサーバに送る
      this.ans.id = this.name
      this.ans.correct = (this.ans.ans == this.question.answer) ? true : false

      // サーバー側に回答を送信する
      this.socket.emit('Answer', this.ans)

      // 正解数をセッションストレージに格納
      this.ans.correct ? this.corNum++ : this.corNum
      sessionStorage.setItem('corNum', this.corNum);
      console.log(this.corNum)

      this.loading = true
      this.showModal = true
    }
  },
  watch: {
    question: function(){
      this.showModal = false
      this.showModal_re = false
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