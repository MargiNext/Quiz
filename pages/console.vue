<template>
  <section class="section">
    <div id="wrapper" class="container">
      <b-loading :is-full-page="false" :active.sync="isLoading" :can-cancel="false"></b-loading>
			<button class="button is-info" @click="send('0')">Q1</button>
			<button class="button is-info" @click="send('1')">Q2</button>
			<button class="button is-info" @click="send('2')">Q3</button>
    </div>
  </section>
</template>

<script>
import io from 'socket.io-client'
import question from '../assets/api/question.json'
// Import question

export default {
  data() {
    return {
      socket: '',
      isLoading: true,
      question: question,
      quiz: '',
    }
  },
  computed: {
  },
  mounted() {
    console.log(this.question)

    // VueインスタンスがDOMにマウントされたらSocketインスタンスを生成する
    this.socket = io()

    // コンポーネントがマウントされてから1秒間はローディングする
    setTimeout(() => {
      this.isLoading = false
    }, 1000)
  },
  methods: {
    send(value) {
      let quiz = {
        id: value,
      }

      // サーバー側にクイズ番号を送信する
      this.socket.emit('QuizId', quiz)
      // input要素を空にする
      this.quiz = ''
    },
  }
}
</script>

<style scoped>
#wrapper
{
  max-width: 600px;
}
</style>