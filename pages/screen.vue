<template>
  <section class="section">
    <!-- タイムアップ画面 -->
    <time-up v-if="timeup" />

    <div v-if="isTop[0]">
			<top x="3" />
    </div>
    <div v-else>
			<div class="columns" id="padding_d_30">
				<div class="column is-8-desktop is-offset-2-desktop is-offset-1-mobile is-10-mobile">
					<div class="columns">
						<div :class="box_1"><span style="font-weight: bold; font-size: 4.5rem;">{{ question.num }}</span> <br> {{ question.content }}</div>
						<div :class="box_2" :style="countDown">{{ timeLimit[0] }}</div>
					</div>
				</div>
			</div>
			<div class="columns">
				<div :style="color_1 + tile_style" :class="[tile_class, front]">{{ question.select_1 }}
					<div v-if="rateShow" :style="color_text_1 + tile_style2">
						<div :style="rate_style + rate_color_1">{{this.rateShow[1]}}</div>
					</div>
				</div>
				<div :style="color_2 + tile_style" :class="[tile_class]">{{ question.select_2 }}
					<div v-if="rateShow" :style="color_text_2 + tile_style2">
						<div :style="rate_style + rate_color_2">{{this.rateShow[2]}}</div>
					</div>
				</div>
			</div>
			<div class="columns">
				<div :style="color_3 + tile_style" :class="[tile_class, front]">{{ question.select_3 }}
					<div v-if="rateShow" :style="color_text_3 + tile_style2">
						<div :style="rate_style + rate_color_3">{{this.rateShow[3]}}</div>
					</div>
				</div>
				<div :style="color_4 + tile_style" :class="[tile_class]">{{ question.select_4 }}
					<div v-if="rateShow" :style="color_text_4 + tile_style2">
						<div :style="rate_style + rate_color_4">{{this.rateShow[4]}}</div>
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
			tile_class: 'column is-4-desktop is-size-2',
			tile_style: 'border-style: solid; border-radius: 0.6em; height: 300px; position: relative;',
			tile_style2: 'border-style: solid; border-radius: 0.4em; height: 50%; width: 50%; bottom: 0; right: 0; position: absolute;',
			front: 'is-offset-2-desktop',
			box_1: "column is-10 is-size-2",
			box_2: "column is-2 has-text-weight-bold circle",
			rate_style: 'text-align: center; padding-top: 15px; font-size: 4.5rem; font-weight: bold;',
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
      isTop: [true],
      name: '',
			interval_id_1: '',
			interval_id_2: '',
			count_1: 0,
			count_2: 0,
			timeLimit: [30],
			countDown: 'text-align: center; color: white;',
			timeup: false,
			groupId: '',
			start_time: '',
    }
	},
	beforeMount () {
    if(!this.$route.query.login){
			console.log(this.$route.query.login)
			this.$router.push('/screen_login')
		}
		else {
			console.log(this.$route.query.login)
		}
  },
  watch: {
  },
  mounted() {
		this.groupId = sessionStorage.getItem('groupId')

    // VueインスタンスがDOMにマウントされたらSocketインスタンスを生成する
    this.socket = io()

    // 問題の受け取り
    this.socket.on('Question', question => {
      if (question.groupId == this.groupId) {
        if (question.id > -1) {
          this.isTop.splice(0, 1, false)
          this.question = questions[question.id]
          sessionStorage.setItem('timeLimit', this.question.time)
          this.timeLimit.splice(0, 1, this.question.time)
        }
        else {
          this.isTop.splice(0, 1, true)
        }
      }
		})

	  // 制限時間の受け取り
	  this.socket.on('timeLimit', limit => {
		  // this.timeLimit = limit.time
      if (limit.groupId == this.groupId) {
				this.start_time = limit.date
      }
	  })

    // 割合トリガの受け取り
    this.socket.on('rateResult', info => {
			if (info.groupId == this.groupId) {
				this.rateShow = info.counts
				this.timeup = false
				this.regular()
			}
		})

    // 回答トリガの受け取り
    this.socket.on('eachResult', groupId => {
			if (groupId == this.groupId) {
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
			}
		})

    // 最終結果発表トリガの受け取り
    this.socket.on('finalResult', info => {
			if (info.groupId == this.groupId) {
				this.$router.push({ path: '/finalResult', query: info.rank})
			}
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
			// this.top = (this.question.id == null) ? true : false
      // this.top = (this.question.id == 0) ? true : false
      this.color_1 = 'background-color: transparent; border-color: #209cee; color: #209cee;'
      this.color_2 = 'background-color: transparent; border-color: #3273dc; color: #3273dc;'
      this.color_3 = 'background-color: transparent; border-color: #00d1b2; color: #00d1b2;'
			this.color_4 = 'background-color: transparent; border-color: #23d160; color: #23d160;'
			this.count_1 = 0
			this.count_2 = 0
		},
    start_time: {
      handler: function (start_time) {
        let that = this
        if(that.timeLimit[0] <= 0){
        }
        else{
          var id = setInterval(function () {
            if(that.timeLimit[0] <= 0){
              clearInterval(id)
              that.timeup = true
              that.isAns =false
              start_time = ''
            }
            else{
              let date = new Date()
              this.current_time = date.setTime(date.getTime() + 1000*60*60*9)
              // that.timeLimit = Number(sessionStorage.getItem('timeLimit')) - Math.floor((this.current_time - start_time)/1000)
              that.timeLimit.splice(0, 1, Number(sessionStorage.getItem('timeLimit')) - Math.floor((this.current_time - start_time)/1000))
            }
          }, 1000)
        }
			},
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
#padding_d_30 {
  padding: 0px 0px 30px;
}
</style>