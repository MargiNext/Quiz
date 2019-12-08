
<template>
	<div class="is-3" id="padding_ud_4030" style="text-align: center;">
		<!-- <div class="is-size-3">SI部2019年忘年会<br>クイズ大会！</div> -->
		<div :style="'font-size:' + this.title_1 + 'rem;'">SI部2019年忘年会<br>クイズ大会！</div>
		<!-- <div style="font-size: 3.75rem;" id="padding_u_50">みんなが入るまで待っててね！</div> -->
		<div :style="'font-size:' + this.title_2 + 'rem;'" id="padding_u_50">みんなが入るまで待っててね！</div>
		<div id="padding_ud_4030" class="half-circle-spinner" :style="'margin: auto;' + 'width:' + this.circleStyle + 'px;' + 'height:' + this.circleStyle + 'px;' + 'border-radius: 100%;position: relative;'">

			<!-- <div class="circle circle-1" style="'text-align: center;"></div>
			<div class="circle circle-2" style="'text-align: center;"></div> -->
			<div class="circle circle-1" :style="'text-align: center; border:' + this.circleBorderStyle + 'px solid transparent; border-top-color: #ff1d5e;'"></div>
			<div class="circle circle-2" :style="'text-align: center; border:' + this.circleBorderStyle + 'px solid transparent; border-bottom-color: #ff1d5e;'"></div>
			<div :style="'font-size:' + this.title_1 + 'rem; padding:' + this.circleFontStyle + 'px 0px 0px'" id="padding_u_20">{{ this.people }}</div>
		</div>
	</div>
</template>

<script>
import io from 'socket.io-client'

export default {
	props: ['x'],
	data(){
		return{
			people: 0,
		}
	},
	mounted(){
    	// VueインスタンスがDOMにマウントされたらSocketインスタンスを生成する
    	this.socket = io()

		// 参加人数の受け取り
    	this.socket.on('People', people => {
			this.people = people
		})

		// websocket.idをサーバに送信
    	this.socket.on('TopSocket', topSocket => {
			this.socket.emit('TopSocketId', this.socket.id)
    	})
	},
	computed: {
		title_1 : function() {
			return 2 * Number(this.x)
		},
		title_2 : function() {
			return 1.25 * Number(this.x)
		},
		circleStyle : function() {
			return 100 * Number(this.x)
		},
		circleFontStyle : function() {
			return 27 * Number(this.x)
		},
		circleBorderStyle : function() {
			return 8 * Number(this.x)
			// return 8
		}
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#padding_ud_4030 {
  padding: 40px 0px 30px;
}
#padding_u_50 {
  padding: 50px 0px 0px;
}
.half-circle-spinner, .half-circle-spinner * {
	box-sizing: border-box;
}

.half-circle-spinner {
	width: 100px;
	height: 100px;
	border-radius: 100%;
	position: relative;
}

.half-circle-spinner .circle {
	content: "";
	position: absolute;
	width: 100%;
	height: 100%;
	border-radius: 100%;
	border: calc(80px / 10) solid transparent;
}

.half-circle-spinner .circle-1 {
	/* border-top-color: #ff1d5e; */
	animation: half-circle-spinner-animation 1s infinite;
}

.half-circle-spinner .circle.circle-2 {
	/* border-bottom-color: #ff1d5e; */
	/* animation: half-circle-spinner-animation 1s infinite; */
	animation: half-circle-spinner-animation 1s infinite alternate;
}

@keyframes half-circle-spinner-animation {
	0% {
		transform: rotate(0deg);

	}
	100%{
		transform: rotate(360deg);
	}
}
</style>