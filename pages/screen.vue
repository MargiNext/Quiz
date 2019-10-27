<template>
  <section class="section">
    
    <div v-if="show">
			正解は{{ question.answer }}
    </div>

    <!-- <div id="wrapper" class="container">
      <b-loading :is-full-page="false" :active.sync="isLoading" :can-cancel="false"></b-loading>
      <p>{{ question.num }} {{ question.content }}</p>
    </div> -->
    <div v-if="top">
      <p>クイズ大会だよ〜</p>
      <p>みんなが入るまで待っててね</p>
    </div>
    <div v-else>
			<div class="columns">
				<p :class="box" id="padding_d_30">{{ question.num }} {{ question.content }}</p>
			</div>
			<div class="columns">
				<div :style="color_1 + tile_style" :class="[tile_class, front]">{{ question.select_1 }}</div>
				<div :style="color_2 + tile_style" :class="[tile_class]">{{ question.select_2 }}</div>
			</div>
			<div class="columns">
				<div :style="color_3 + tile_style" :class="[tile_class, front]">{{ question.select_3 }}</div>
				<div :style="color_4 + tile_style" :class="[tile_class]">{{ question.select_4 }}</div>
			</div>
			<!-- <div class="columns">
				<button :class="[select_btn, color_1, front]" @click="answer('1')">1. {{ question.select_1 }}</button>
				<button :class="[select_btn, color_2]" @click="answer('2')">2. {{ question.select_2 }}</button>
			</div>
			<div class="columns">
				<button :class="[select_btn, color_3, front]" @click="answer('3')">3. {{ question.select_3 }}</button>
				<button :class="[select_btn, color_4]" @click="answer('4')">4. {{ question.select_4 }}</button>
			</div> -->
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
			styleObject: {
				fontSize: '13px'
			},
      color_1: 'background-color: transparent; border-color: #209cee; color: #209cee;',
      color_2: 'background-color: transparent; border-color: #3273dc; color: #3273dc;',
      color_3: 'background-color: transparent; border-color: #00d1b2; color: #00d1b2;',
      color_4: 'background-color: transparent; border-color: #23d160; color: #23d160;',
			tile_class: 'column is-4-desktop is-size-3',
			tile_style: 'border-style: solid; border-radius: 1em; height: 250px;',
			front: 'is-offset-2-desktop',
      box: "column is-size-3 is-8-desktop is-offset-2-desktop is-offset-1-mobile is-10-mobile",
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
#padding_d_30 {
  padding: 0px 0px 30px;
}
</style>