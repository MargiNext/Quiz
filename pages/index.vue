<template>
  <section class="section">
    <div id="wrapper" class="container">
      <b-loading :is-full-page="false" :active.sync="isLoading" :can-cancel="false"></b-loading>
      <p>{{ question.num }}. {{ question.content }}</p>
    </div>
    <button class="button is-info" @click="answer('0')">1</button>
    <button class="button is-info" @click="answer('1')">2</button>
    <button class="button is-info" @click="answer('2')">3</button>
    <button class="button is-info" @click="answer('3')">4</button>
  </section>
</template>

<script>
import io from 'socket.io-client'
import questions from '../assets/api/question.json'

export default {
  data() {
    return {
      socket: '',
      isLoading: true,
      questions: questions,
      question: '',
    }
  },
  mounted() {
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
      }

      // サーバー側にクイズ番号を送信する
      this.socket.emit('Answer', ans)
      // 要素を空にする
      this.ans = ''
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