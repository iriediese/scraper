const express = require('express')
const puppeteer = require('puppeteer')
const axios = require('axios')

const app = express()
const port = 3000

const url="https://wsa-test.vercel.app/"

async function getCards(url) {
  try {
    const browser = await puppeteer.launch({
      headless: "new"
    });
    const page = await browser.newPage()
    await page.goto(url)

    await page.waitForSelector('div')

    const content = await page.evaluate(() => {
      const divElements = Array.from(document.querySelectorAll('div'))
      const divsWithAAndDiv = [];
      const divsWithAOnly = [];

      divElements.forEach((div) => {
        const children = Array.from(div.children)
        const hasA = children.some((child) => child.tagName === 'A')
        const hasDiv = children.some((child) => child.tagName === 'DIV')

        if (hasA && hasDiv) {
          divsWithAAndDiv.push(div.innerHTML)
        } else if (hasA) {
          divsWithAOnly.push(div.innerHTML)
        }
      })
      return { 
        'divsWithAAndDiv': divsWithAAndDiv.length,
        'divsWithAonly': divsWithAOnly.length
      }
    });
    await browser.close()
    return content
    
  } catch (error) {
    console.error(error)
  }
}

app.get('/', async (req, res) => {
  const cards = await getCards(url)
  res.send('Hello World! ' + JSON.stringify(cards))
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
