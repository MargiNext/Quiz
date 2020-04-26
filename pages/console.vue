<template>
  <!-- <section class="section"> -->
  <div>
    <!-- トップバー -->
    <div class="card">
      <div class="card-content">
        <div class="media">
          <div class="media-left">
            <b-icon
              icon="account"
              size="is-large"
              type="is-grey"
              class="colmun"
            />
          </div>
          <div class="media-content">
            <p class="is-4" style="font-weight: bold; font-size:18px;">{{ this.admin.name }}
            <p>groupId : {{this.admin.groupId}}</p>
          </div>
          <div class="media-right">
          </div>
        </div>
      </div>
    </div>
    <div id="wrapper" class="container">
      <b-loading :is-full-page="false" :active.sync="isLoading" :can-cancel="false"></b-loading>
      <!-- Topのときもindex.jsのロジックを変えるのが手間なのでtimeに10を入れておきます -->
      <button class="button is-outlined is-info" style="margin: 0px 5px;" @click="send(-1,null,groupId)">Top</button><br>
      <span v-for="(question, index) in question" :key="index">
        <div v-if="question.id == 0" style="padding: 20px 0 20px;">
          <button class="button is-outlined is-info" style="margin: 0px 5px;" @click="send(Number(question.id),Number(question.time),groupId)">練習問題</button>
        </div>
        <button v-else class="button is-outlined is-info" style="margin: 10px 5px 10px;" @click="send(Number(question.id),Number(question.time),groupId)">{{ question.num }}</button>
      </span><br>
      <div style="padding: 20px 0 20px;">
        <button class="button is-outlined is-danger" @click="limit_trigger(true)">タイムリミットを表示</button>
      </div>
      <div style="padding: 20px 0 20px;">
        <button class="button is-outlined is-success" @click="rate_trigger(true)">回答割合を表示</button>
        <button class="button is-outlined is-success" @click="ans_trigger(true)">答えを表示</button>
      </div>
      <div style="padding: 20px 0 20px;">
        <button class="button is-outlined is-info" @click="res_trigger(true)">結果発表</button>
        <button class="button is-outlined is-info" @click="rank_trigger(true)">順位表示</button>
      </div>
      <div style="padding: 20px 0 20px;">
        <button class="button is-outlined is-danger" @click="con_trigger(true)">緊急！スクリーンに戻りたい！</button>
      </div>
    </div>

		<span v-for="(rank, index) in finalResult" :key="index">
			<span>{{ rank.rank }} </span>
		</span>

		<div v-for="(ans, index) in reverseAns" :key="index">
			<p>{{ ans }}</p>
		</div>
  </div>
  <!-- </section> -->
</template>

<script>
import io from 'socket.io-client'
import question from '../assets/api/question.json'

export default {
  data() {
    return {
      groupId: '',
      socket: '',
      isLoading: true,
      question: question,
			quiz: '',
			answers: [],
      rank: '',
      finalResult: '',
      admin: '',
    }
  },
  computed: {
    reverseAns: function() {
      return this.answers.slice().reverse()
    },
  },
  mounted() {
    // セッションストレージから名前を取り出す
    this.admin = sessionStorage.getItem('admin') ? JSON.parse(sessionStorage.getItem('admin')) : ''
    if(this.admin == ''){
			this.$router.push('/console_login')
    }
    this.groupId = this.admin.groupId

    // VueインスタンスがDOMにマウントされたらSocketインスタンスを生成する
    this.socket = io()

    this.socket.on('Answer', answer => {
      this.answers.push(answer)
    })

    // 最終結果発表トリガの受け取り
    this.socket.on('finalResult', result => {
      this.finalResult = result
    })

    // コンポーネントがマウントされてから1秒間はローディングする
    setTimeout(() => {
      this.isLoading = false
    }, 1000)
  },
  methods: {
    send(quizId, quizTime, groupId) {
      let quiz = {
        id: quizId,
        time: quizTime,
        groupId: groupId,
      }

      // サーバー側にクイズ番号を送信する
      this.socket.emit('QuizId', quiz)
      // 要素を空にする
      this.quiz = ''
    },
    rate_trigger(boolean) {
      let groupId = this.groupId

      // サーバー側に回答結果を表示するためのトリガを送信する
			this.socket.emit('rateResult', groupId)
    },
    ans_trigger(boolean) {
      let groupId = this.groupId

      // サーバー側に回答結果を表示するためのトリガを送信する
			this.socket.emit('eachResult', groupId)
    },
    res_trigger(boolean) {
      let groupId = this.groupId

      // サーバー側に最終結果を表示するためのトリガを送信する
			this.socket.emit('finalResult', groupId)
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
      let groupId = this.groupId

      // サーバー側に制限時間開始のトリガを送信する
      this.socket.emit('timeLimit', groupId)
    }
  }
}
</script>

<style scoped>
</style>