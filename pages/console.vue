<template>
  <section class="section">
    <div id="wrapper" class="container">
      <b-loading :is-full-page="false" :active.sync="isLoading" :can-cancel="false"></b-loading>
			<button class="button is-info" @click="send('0')">Top</button>
			<button class="button is-info" @click="send('1')">Q1</button>
			<button class="button is-info" @click="send('2')">Q2</button>
			<button class="button is-info" @click="send('3')">Q3</button>
			<button class="button is-info" @click="send('4')">Q4</button>
			<button class="button is-info" @click="rate_trigger(true)">回答割合を表示</button>
			<button class="button is-info" @click="ans_trigger(true)">答えを表示</button>
			<button class="button is-info" @click="res_trigger(true)">結果発表</button>
			<button class="button is-danger" @click="con_trigger(true)">緊急！スクリーンに戻りたい！</button>
			<button class="button is-info" @click="rank_trigger(true)">順位表示</button>
			<button class="button is-info" @click="limit_trigger(true)">タイムリミットを表示</button>
    </div>
		<div v-for="(ans, index) in reverseAns" :key="index">
			<p>{{ ans }}</p>
		</div>
  </section>
</template>

<script>
import io from 'socket.io-client'
import question from '../assets/api/question.json'

export default {
  data() {
    return {
      socket: '',
      isLoading: true,
      question: question,
			quiz: '',
			answers: [],
			rank: '',
    }
  },
  computed: {
    reverseAns: function() {
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
      // 要素を空にする
      this.quiz = ''
    },
    rate_trigger(boolean) {
      let trigger = boolean

      // サーバー側に回答結果を表示するためのトリガを送信する
			this.socket.emit('rateResult', trigger)
    },
    ans_trigger(boolean) {
      let trigger = boolean

      // サーバー側に回答結果を表示するためのトリガを送信する
			this.socket.emit('eachResult', trigger)
    },
    res_trigger(boolean) {
      let trigger = boolean

      // サーバー側に最終結果を表示するためのトリガを送信する
			this.socket.emit('finalResult', trigger)
    },
    con_trigger(boolean) {
      let trigger = boolean

      // サーバー側にスクリーン画面へ戻るためのトリガを送信する
			this.socket.emit('goScreen', trigger)
    },
    rank_trigger(boolean) {
      let trigger = boolean

      // サーバー側に順位トリガを送信する
      this.socket.emit('Rank', trigger)
    },
    limit_trigger(boolean) {
      let trigger = boolean

      // サーバー側に制限時間開始のトリガを送信する
      this.socket.emit('timeLimit', trigger)
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