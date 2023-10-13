const express = require('express')
const puppeteer = require('puppeteer')
const axios = require('axios')

const app = express()
const port = 3000

const url = 'https://wsa-test.vercel.app/'

const words = {
  joyful: 2,
  rewarding: 2,
  happiness: 2,
  positive: 1,
  vibrant: 2,
  encourage: 2,
  enchanting: 2,
  satisfaction: 1,
  peace: 1,
  effective: 2,
  incredible: 2,
  opportunities: 2,
  support: 2,
  green: 1,
  calm: 1,
  peaceful: 1,
  beautiful: 1,
  wonder: 2,
  cherish: 2,
  embrace: 2,
  magnificent: 2,
  cool: 1,
  delightful: 2,
  good: 1,
  masterpiece: 2,
  approval: 1,
  negative: -1,
  coping: -1,
  rot: -2,
  harmful: -2,
  overwhelming: -2,
  distress: -2,
  expensive: -1,
  pollution: -1,
  stresses: -2,
  challenge: -2,
  challenges: -2,
  negative: -1,
  hefty: -1,
  noise: -2,
  bad: -1,
  nonsensical: -2,
  disapproval: -1,
  disappointing: -2,
  downside: -1,
  obesity: -2,
  'heart disease': -2,
  diabetes: -2,
  waste: -2,
  harming: -2,
  'not-so-rosy': -1
}

function getMood(text, flag) {
  const tokens = text
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.replace(/[.,!?;:]+$/, ''))
  let totalScore = 0
  for (const token of tokens) {
    totalScore += words[token] || 0
  }

  if (totalScore > 0) {
    return 'positive'
  } else if (totalScore < 0) {
    return 'negative'
  } else {
    return 'neutral'
  }
}

async function getCards(url) {
  try {
    const browser = await puppeteer.launch({
      headless: 'new'
    })
    const page = await browser.newPage()
    await page.goto(url)

    await page.waitForSelector('div')

    const content = await page.evaluate(() => {
      const divElements = Array.from(document.querySelectorAll('div'))
      const divsWithAAndDiv = []

      divElements.forEach(div => {
        const children = Array.from(div.children)
        const hasA = children.some(child => child.tagName === 'A')
        const hasDiv = children.some(child => child.tagName === 'DIV')

        if (hasA && hasDiv) {
          divsWithAAndDiv.push(div)
        }
      })

      const completeObjects = []

      divsWithAAndDiv.forEach(div => {
        let title = ''
        let description = ''
        let image = ''
        let href = ''
        let date = ''

        image = Array.from(div.querySelectorAll('img'))[0].getAttribute('src')
        absouluteImageURL = new URL(image, window.location.href)
        image = absouluteImageURL.toString()

        date = Array.from(div.querySelectorAll('time'))[0].textContent.trim()

        const aElementsWithSpan = Array.from(div.querySelectorAll('a > span'))
        aElementsWithSpan.forEach(span => {
          title = span.nextSibling.textContent.trim()
          description = span.parentElement.parentElement.nextElementSibling.textContent.trim()
          absoluteURL = new URL(span.parentElement.getAttribute('href'), window.location.href)
          href = absoluteURL.toString()
        })

        completeObjects.push({
          title: title,
          short_description: description,
          image: image,
          href: href,
          date: date
        })
      })

      return completeObjects
    })

    for (c of content) {
      await page.goto(c.href)
      await page.waitForSelector('div > a')
      c.mood = await page.evaluate(() => {
        const backLink = Array.from(document.querySelectorAll('a'))[0]
        const textDiv = Array.from(
          backLink.parentElement.parentElement.querySelectorAll('div')
        ).filter(div => div.querySelectorAll('*').length > 0)[0]
        return textDiv.textContent
      })
      c.mood = getMood(c.mood, c.title === 'Neutral Observations on Modern Art')
    }

    await browser.close()
    return content
  } catch (error) {
    console.error(error)
  }
}

app.get('/', async (req, res) => {
  const cards = await getCards(url)
  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(cards, null, 2))
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
