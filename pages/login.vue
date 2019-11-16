<template>
  <section class="section">
      <p>ろぐいん</p>
      <div class="field">
        <label class="label">Team Name</label>
        <div class="control">
            <input class="input" type="text" placeholder="Text input" v-model="name">
        </div>
        <p v-if='!login'>このグループ名はすでに使用済みです</p>
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
      login: false,
    }
  },
  mounted() {
    this.socket = io()
  },
  methods: {
		login(){
      // this.socket.on('Login', login => {
      //   this.login = login
      // })
      if (this.login) {

      }
      this.$router.push('/')
      this.socket.emit('name', this.name)

			// セッションストレージを使用
			sessionStorage.setItem('name', this.name);
		}
  },
}
</script>

<style scoped>
</style>