const express = require('express')
const puppeteer = require('puppeteer')
const axios = require('axios')

const app = express()
const port = 3000

const url = 'https://wsa-test.vercel.app/'

const words = require('./words.json')

app.get('/', async (req, res) => {
  const cards = await getCards(url)
  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(cards, null, 2))
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

async function getCards(url) {
  try {
    const browser = await puppeteer.launch({
      headless: 'new'
    })
    const page = await browser.newPage()

    await page.goto(url)
    await page.waitForSelector('div')
    const content = await page.evaluate(evaluateMainPage)

    for (c of content) {
      await page.goto(c.href)
      await page.waitForSelector('div > a')
      c.sentiment = await page.evaluate(evaluateBlogPost)
      moodResult = getMoodAndWordCount(c.sentiment)
      c.sentiment = moodResult.sentiment
      c.words = moodResult.words
    }

    await browser.close()
    return content
  } catch (error) {
    console.error(error)
  }
}

function evaluateMainPage() {
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
}

function evaluateBlogPost() {
  const backLink = Array.from(document.querySelectorAll('a'))[0]
  const textDiv = Array.from(backLink.parentElement.parentElement.querySelectorAll('div')).filter(
    div => div.querySelectorAll('*').length > 0
  )[0]
  return textDiv.textContent
}

function getMoodAndWordCount(text) {
  const tokens = fixText(text)
    .toLowerCase()
    .split(/\s+/) // split on white space
    .map(word => word.replace(/[.,!?;:]+$/, '')) // remove punctuation

  let totalScore = 0
  for (const token of tokens) {
    totalScore += words[token] || 0
  }

  const result = {
    sentiment: totalScore > 0 ? 'positive' : totalScore < 0 ? 'negative' : 'neutral',
    words: tokens.length
  }

  return result
}

function fixText(text) {
  // Add space between words without spaces (camelCased or PascalCased)
  text = text.replace(/([a-z])([A-Z])/g, '$1 $2')

  // Add space after a dot if there's no space after it
  text = text.replace(/(\w)\.(?=\w)/g, '$1. ')

  return text
}
