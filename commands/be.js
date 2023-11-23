import axios from 'axios'
import * as cheerio from 'cheerio'
import beTemplate from '../templates/be.js'

export default async (event) => {
  try {
    const { data } = await axios.get('https://wdaweb.github.io/')
    const $ = cheerio.load(data)
    const replies = []
    $('#be .card').each(function () {
      // 取出圖片和標題
      const image = $(this).find('img').attr('src')
      const imageUrl = new URL(image, 'https://wdaweb.github.io/')
      const title = $(this).find('.card-title').text().trim()
      // 產生一個新回應訊息模板
      const template = beTemplate()
      // 修改模板內容
      template.hero.url = imageUrl
      template.body.contents[0].text = title
      replies.push(template)
    })
    const result = await event.reply({
      type: 'flex',
      altText: '後端課程',
      contents: {
        type: 'carousel',
        contents: replies
      }
    })
    console.log(result)
  } catch (error) {
    console.log(error)
  }
}
