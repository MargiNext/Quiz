<template>
  <section class="section">
    <!-- タイムアップ画面 -->
    <time-up v-if="timeup" />

    <div v-if="top">
			<top />
    </div>
    <div v-else>
			<div class="columns" id="padding_d_30">
				<div class="column is-8-desktop is-offset-2-desktop is-offset-1-mobile is-10-mobile">
					<div class="columns">
						<div :class="box_1"><span style="font-weight: bold;">{{ question.num }}</span> <br> {{ question.content }}</div>
						<div :class="box_2" :style="countDown">{{ timeLimit }}</div>
					</div>
				</div>
			</div>
			<div class="columns">
				<div :style="color_1 + tile_style" :class="[tile_class, front]">{{ question.select_1 }}
					<div v-if="rateShow" :style="color_text_1 + tile_style2">
						<div :style="rate_style + rate_color_1" class="is-size-1">{{this.rateShow[1]}}</div>
					</div>
				</div>
				<div :style="color_2 + tile_style" :class="[tile_class]">{{ question.select_2 }}
					<div v-if="rateShow" :style="color_text_2 + tile_style2">
						<div :style="rate_style + rate_color_2" class="is-size-1">{{this.rateShow[2]}}</div>
					</div>
				</div>
			</div>
			<div class="columns">
				<div :style="color_3 + tile_style" :class="[tile_class, front]">{{ question.select_3 }}
					<div v-if="rateShow" :style="color_text_3 + tile_style2">
						<div :style="rate_style + rate_color_3" class="is-size-1">{{this.rateShow[3]}}</div>
					</div>
				</div>
				<div :style="color_4 + tile_style" :class="[tile_class]">{{ question.select_4 }}
					<div v-if="rateShow" :style="color_text_4 + tile_style2">
						<div :style="rate_style + rate_color_4" class="is-size-1">{{this.rateShow[4]}}</div>
					</div>
				</div>
			</div>
    </div>
  </section>
</template>

<script>
import io from 'socket.io-client'
import questions from '../assets/api/question.json'
import loading from '~/components/Loading.vue'
import eachResult from '~/components/eachResult.vue'
import top from '~/components/Top'
import timeUp from '~/components/timeUp'

export default {
  components: {
    loading,
		eachResult,
		top,
		timeUp,
  },
  data() {
    return {
      color_1: 'background-color: transparent; border-color: #209cee; color: #209cee;',
      color_2: 'background-color: transparent; border-color: #3273dc; color: #3273dc;',
      color_3: 'background-color: transparent; border-color: #00d1b2; color: #00d1b2;',
      color_4: 'background-color: transparent; border-color: #23d160; color: #23d160;',
      color_text_1: 'background-color: #209cee; border-color: #209cee; color: #209cee;',
      color_text_2: 'background-color: #3273dc; border-color: #3273dc; color: #3273dc;',
      color_text_3: 'background-color: #00d1b2; border-color: #00d1b2; color: #00d1b2;',
      color_text_4: 'background-color: #23d160; border-color: #23d160; color: #23d160;',
			tile_class: 'column is-4-desktop is-size-3',
			tile_style: 'border-style: solid; border-radius: 1em; height: 250px; position: relative;',
			tile_style2: 'border-style: solid; border-radius: 0.8em; height: 50%; width: 50%; bottom: 0; right: 0; position: absolute;',
			front: 'is-offset-2-desktop',
			box_1: "column is-10 is-size-3",
			box_2: "column is-2 has-text-weight-bold circle",
			rate_style: 'text-align: center; padding-top: 25px; font-weight: bold;',
			rate_color_1: 'color: white',
			rate_color_2: 'color: white',
			rate_color_3: 'color: white',
			rate_color_4: 'color: white',
      socket: '',
      isLoading: true,
      questions: questions,
      question: '',
      loading: false,
			rateShow: false,
      top: true,
      name: '',
			interval_id_1: '',
			interval_id_2: '',
			count_1: 0,
			count_2: 0,
			timeLimit: 0,
			countDown: 'text-align: center; color: white;',
			timeup: false,
    }
  },
  mounted() {
    // VueインスタンスがDOMにマウントされたらSocketインスタンスを生成する
    this.socket = io()

    // 問題の受け取り
    this.socket.on('Question', question => {
      if (question.id != null) {
        this.question = questions[question.id]
				this.timeLimit = this.question.time
				this.top = question.top
      }
      else {
        this.top = true
      }
		})

		// 制限時間の受け取り
		this.socket.on('timeLimit', timeLimit => {
			this.timeLimit = timeLimit
			if (timeLimit <= 0)  {
						this.timeup = true
						this.isAns =false
			}
		})

    // 割合トリガの受け取り
    this.socket.on('rateResult', result => {
      // for debug
			this.rateShow = result
			this.timeup = false
			this.regular()
		})

    // 回答トリガの受け取り
    this.socket.on('eachResult', result => {
			this.timeup = false

			// ここから回答表示
			this.interval_id_1 = setInterval(() => {
				this.solid(this.question.answer)
				this.count_1++
				if(this.count_1 > 6){
					clearInterval(this.interval_id_1)
					this.solid(this.question.answer)
				}
			}, 500)
			this.interval_id_2 = setInterval(() => {
				this.regular()
				this.count_2++
				if(this.count_2 > 2){
					clearInterval(this.interval_id_2)
					this.solid(this.question.answer)
				}
			}, 1000)
		})

    // 最終結果発表トリガの受け取り
    this.socket.on('finalResult', result => {
			this.$router.push({ path: '/finalResult', query: result})
    })

    // コンポーネントがマウントされてから1秒間はローディングする
    setTimeout(() => {
      this.isLoading = false
    }, 1000)
  },
  methods: {
		solid(num){
			if(num == 1){
				this.color_1 = 'background-color: red; border-color: red; color: white;'
				this.color_text_1 = 'background-color: white; border-color: white; color: red;'
				this.rate_color_1 = 'color: red'
			}
			if(num == 2){
				this.color_2 = 'background-color: red; border-color: red; color: white;'
				this.color_text_2 = 'background-color: white; border-color: white; color: red;'
				this.rate_color_2 = 'color: red'
			}
			if(num == 3){
				this.color_3 = 'background-color: red; border-color: red; color: white;'
				this.color_text_3 = 'background-color: white; border-color: white; color: red;'
				this.rate_color_3 = 'color: red'
			}
			if(num == 4){
				this.color_4 = 'background-color: red; border-color: red; color: white;'
				this.color_text_4 = 'background-color: white; border-color: white; color: red;'
				this.rate_color_4 = 'color: red'
			}
		},
		regular(){
			this.color_1 = 'background-color: transparent; border-color: #209cee; color: #209cee;'
			this.color_2 = 'background-color: transparent; border-color: #3273dc; color: #3273dc;'
			this.color_3 = 'background-color: transparent; border-color: #00d1b2; color: #00d1b2;'
			this.color_4 = 'background-color: transparent; border-color: #23d160; color: #23d160;'
			this.color_text_1 = 'background-color: #209cee; border-color: #209cee; color: #209cee;'
			this.color_text_2 = 'background-color: #3273dc; border-color: #3273dc; color: #3273dc;'
			this.color_text_3 = 'background-color: #00d1b2; border-color: #00d1b2; color: #00d1b2;'
			this.color_text_4 = 'background-color: #23d160; border-color: #23d160; color: #23d160;'
			this.rate_color_1 = 'color: white'
			this.rate_color_2 = 'color: white'
			this.rate_color_3 = 'color: white'
			this.rate_color_4 = 'color: white'
		},
  },
  watch: {
    question: function(){
			this.timeup = false
			this.rateShow = false
			this.top = (this.question.id == null) ? true : false
      // this.top = (this.question.id == 0) ? true : false
      this.color_1 = 'background-color: transparent; border-color: #209cee; color: #209cee;'
      this.color_2 = 'background-color: transparent; border-color: #3273dc; color: #3273dc;'
      this.color_3 = 'background-color: transparent; border-color: #00d1b2; color: #00d1b2;'
			this.color_4 = 'background-color: transparent; border-color: #23d160; color: #23d160;'
			this.count_1 = 0
			this.count_2 = 0
    }
  }
}
</script>

<style scoped>
.circle{
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: #FF5192	;
  margin: 10px auto;
	padding: 10px 0 0px;
	font-size: 90px;
}
#wrapper
{
  max-width: 600px;
}
#padding_d_30 {
  padding: 0px 0px 30px;
}
</style>