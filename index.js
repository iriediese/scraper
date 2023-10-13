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

      function isLeafElement(element) {
        return !element.querySelector('*');
      }
  
      function getTextContentOfLeaf(element) {
        return element.textContent.trim();
      }

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
        const aElementsWithSpan = Array.from(div.querySelectorAll('a > span'))
        let title = ""
        let description = ""
        aElementsWithSpan.forEach((span) => {
          title = span.nextSibling.textContent.trim()          
          description = span.parentElement.parentElement.nextElementSibling.textContent.trim()
        })

        const descriptions = Array.from(div.querySelectorAll('a > span'))

        completeObjects.push({
          'title': title,
          'description': description 
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
  res.send(JSON.stringify(cards))
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
