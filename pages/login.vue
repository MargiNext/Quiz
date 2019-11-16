<template>
  <section class="section">
      <p>ろぐいん</p>
      <div class="field">
        <label class="label">Team Name</label>
        <div class="control">
            <input class="input" type="text" placeholder="Text input" v-model="name">
        </div>
				<a class="button is-primary" @click="login()">ユーザを作成しログイン</a>
			</div>
  </section>
</template>

<script>
import io from 'socket.io-client'

export default {
  components: {
  },
  data() {
    return {
			name: '',
    }
  },
  mounted() {
    this.socket = io()
  },
  methods: {
		login(){
      this.$router.push('/')
      this.socket.emit('name', this.name)
      console.log(this.socket.id)

			// セッションストレージを使用
			sessionStorage.setItem('name', this.name);
		}
  },
}
</script>

<style scoped>
</style>