<script setup>
import { ref } from 'vue'
import axios from 'axios'

const link = ref('https://wsa-test.vercel.app/')
const result = ref('')

function handleSubmit() {
  axios.get('http://localhost:3000/process-url?url=' + link.value)
    .then(response => {
      result.value = JSON.stringify(response.data, null, 2)
    })
}
</script>

<template>
  <div class="container mx-auto">
    <h1 class="text-3xl">
      Web scraper
    </h1>
    <form @submit.prevent="handleSubmit">
      <input type="text" v-model="link" />
      <br />
      <button type="submit">Submit</button>
    </form>
    <textarea v-model="result"></textarea>
  </div>
</template>
