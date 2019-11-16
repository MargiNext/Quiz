
<template>
	<div class="is-3" id="padding_ud_4030" style="text-align: center;">
		<div class="is-size-3">SI部2019年忘年会<br>クイズ大会！</div>
		<div class="is-size-5" id="padding_u_50">みんなが入るまで待っててね！</div>
		<div id="padding_ud_4030" class="half-circle-spinner" style="margin: auto;">
			<div class="circle circle-1" style="text-align: center;"></div>
			<div class="circle circle-2" style="text-align: center;"></div>
			<div id="padding_u_20">{{ this.people }}</div>
		</div>
	</div>
</template>

<script>
import io from 'socket.io-client'

export default {
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
			console.log(people)
		})

    	this.socket.on('TopSocket', topSocket => {
			this.socket.emit('TopSocketId', this.socket.id)
    	})
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
#padding_u_20 {
  padding: 27px 0px 0px;
	font-size: 30px;
	/* font-weight: 100; */
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

.half-circle-spinner .circle.circle-1 {
	border-top-color: #ff1d5e;
	animation: half-circle-spinner-animation 1s infinite;
}

.half-circle-spinner .circle.circle-2 {
	border-bottom-color: #ff1d5e;
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