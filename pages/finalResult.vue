<template>
  <section class="section">
    
		<p>結果発表〜</p>
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
    }
  },
  mounted() {
  },
  methods: {
  },
  watch: {
  }
}
</script>

<style scoped>
</style>