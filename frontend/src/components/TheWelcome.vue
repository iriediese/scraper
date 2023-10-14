<script setup>
import { ref } from 'vue'
import axios from 'axios'

const link = ref('https://wsa-test.vercel.app/')
const result = ref('')
const isLoading = ref(false)

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function handleSubmit() {
  isLoading.value = true
  axios.get('http://localhost:3000/process-url?url=' + link.value)
    .then(response => {
      result.value = JSON.stringify(response.data, null, 2)
      isLoading.value = false
    })
}
</script>

<template>
  <div class="container text-center mx-auto">
    <br />
    <h1 class="text-3xl">
      Web scraper
    </h1>
    <br />
    <form @submit.prevent="handleSubmit">
      <input type="text" class="border min-w-[17%] min-h-[4vh] text-center rounded bg-slate-100" v-model="link" />
      <br /> <br />
      <button type="submit" class="bg-blue-700 text-white font-bold py-2 px-4 rounded">Submit</button>
    </form>
    <br />
    <textarea v-show="result != ''" v-model="result"
      class="w-9/12 bg-slate-100 h-screen resize-none border rounded"></textarea>

    <div v-show="isLoading" class="border shadow rounded w-9/12 mx-auto">
      <div v-for="i in range(1, 10)" :key="i" class="animate-pulse flex space-x-4">
        <div class="flex-1 space-y-6 py-1">
          <div class="h-2 bg-slate-200 rounded"></div>
          <div class="space-y-3">
            <div class="grid grid-cols-3 gap-4">
              <div class="h-2 bg-slate-200 rounded col-span-2"></div>
              <div class="h-2 bg-slate-200 rounded col-span-1"></div>
            </div>
            <div class="h-2 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
    <br /><br /><br />
  </div>
</template>
