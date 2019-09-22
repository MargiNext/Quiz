<template>
  <section class="section">
    <div id="wrapper" class="container">
      <b-loading :is-full-page="false" :active.sync="isLoading" :can-cancel="false"></b-loading>
			<button class="button is-info" @click="send('0')">Q1</button>
			<button class="button is-info" @click="send('1')">Q2</button>
			<button class="button is-info" @click="send('2')">Q3</button>
    </div>
		<div v-for="(ans, index) in answers" :key="index">
			<p>{{ ans }}</p>
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
			answers: [],
    }
  },
  computed: {
		// 配列の後ろ（新しいもの）から順に表示させたいので反転させる
    reverseMessages: function() {
      return this.answers.slice().reverse()
    },
  },
  mounted() {
    console.log(this.question)

    // VueインスタンスがDOMにマウントされたらSocketインスタンスを生成する
    this.socket = io()

    this.socket.on('Answer', answer => {
      this.answers.push(answer)
    })

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