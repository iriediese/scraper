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
      const timeElements = Array.from(document.querySelectorAll('time'))
      const divsWithAAndDiv = [];
      const divsWithAOnly = [];

      divElements.forEach((div) => {
        const children = Array.from(div.children)
        const hasA = children.some((child) => child.tagName === 'A')
        const hasDiv = children.some((child) => child.tagName === 'DIV')

        if (hasA && hasDiv) {
          divsWithAAndDiv.push(div)
        } else if (hasA) {
          divsWithAOnly.push(div)
        }
      })

      // const leafText = []
      const completeObjects = []

      divsWithAAndDiv.forEach((div) => {
        let title = ""
        let description = ""
        let image = ""
        let href = ""

        image = Array.from(div.querySelectorAll('img'))[0].getAttribute('src')
        absouluteImageURL = new URL(image, window.location.href)
        image = absouluteImageURL.toString()
        
        const aElementsWithSpan = Array.from(div.querySelectorAll('a > span'))
        aElementsWithSpan.forEach((span) => {
          title = span.nextSibling.textContent.trim()          
          description = span.parentElement.parentElement.nextElementSibling.textContent.trim()
          absoluteURL = new URL(span.parentElement.getAttribute('href'), window.location.href)
          href = absoluteURL.toString()          
        })

        completeObjects.push({
          'title': title,
          'short_description': description,
          'image': image,
          'href': href 
        })
        /*
        const leaves = Array.from(div.querySelectorAll('*')).filter(isLeafElement)
        leafText.push(leaves.map(getTextContentOfLeaf))
        */
      })

      return completeObjects
    });
    await browser.close()
    return content
    
  } catch (error) {
    console.error(error)
  }
}

app.get('/', async (req, res) => {
  const cards = await getCards(url)
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(cards, null, 2))
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
