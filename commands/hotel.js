import axios from 'axios'
import { distance } from '../distance.js'
import hotel from '../templates/hotel.js'
export default async (event) => {
  const temp = event.postback.data.split(',')
  try {
    // const id = event.message.text.replace('去哪', '')
    const { data } = await axios.get('https://media.taiwan.net.tw/XMLReleaseALL_public/hotel_C_f.json')

    const templates = []
    data.XML_Head.Infos.Info.map((value) => {
      value.distance = distance(value.Py, value.Px, temp[1], temp[2], 'K')
      return value
    })
      .filter((value) => {
        return value.distance < 5
      })
      .sort((a, b) => {
        return a.distance - b.distance
      })
      // .roundTo((num, decimal) => {
      //   return Math.round((num + Number.EPSILON) * Math.pow(10, decimal)) / Math.pow(10, decimal)
      // })

      .slice(0, 5)
      .forEach((value) => {
        const template = hotel()
        template.hero.url =
          value.Picture1 || 'https://p2.bahamut.com.tw/B/2KU/97/fcf7ff096fa4aadf8596e8f2c91fyod5.JPG?v=1650353507776'
        template.body.contents[0].text = value.Name
        template.body.contents[1].contents[0].contents[0].text = value.Description || 'none'
        template.body.contents[1].contents[1].contents[0].contents[1].text = value.Add || 'none'
        template.body.contents[1].contents[3].contents[0].contents[1].text = value.Tel || 'none'
        template.body.contents[1].contents[2].contents[0].contents[1].text =
          `${Math.floor(value.distance * 1000)} M` || 'none'
        templates.push(template)
        console.log(value)
      })

    const result = await event.reply({
      type: 'flex',
      altText: '查詢結果',
      contents: {
        type: 'carousel',
        contents: templates
      }
    })
    console.log(result)
  } catch (error) {
    console.log(error)
  }
}
