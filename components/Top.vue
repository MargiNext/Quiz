
<template>
	<div class="is-3" id="padding_ud_30" style="text-align: center;">
		<div class="is-size-3">SI部2019年忘年会<br>クイズ大会！</div>
		<div class="is-size-5" id="padding_ud_30">みんなが入るまで待っててね！</div>
		<div id="padding_ud_30" class="half-circle-spinner" style="margin: auto;">
			<div class="circle circle-1" style="text-align: center;"></div>
			<div class="circle circle-2" style="text-align: center;"></div>
		</div>
	</div>
</template>

<script>
export default {
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#padding_ud_30 {
  padding: 40px 0px 30px;
}
.half-circle-spinner, .half-circle-spinner * {
	box-sizing: border-box;
}

.half-circle-spinner {
	width: 60px;
	height: 60px;
	border-radius: 100%;
	position: relative;
}

.half-circle-spinner .circle {
	content: "";
	position: absolute;
	width: 100%;
	height: 100%;
	border-radius: 100%;
	border: calc(60px / 10) solid transparent;
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