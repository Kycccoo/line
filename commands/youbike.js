import axios from 'axios'
import { distance } from '../distance.js'
import youbike from '../templates/youbike.js'

export default async (event) => {
  const temp = event.postback.data.split(',')
  try {
    // const id = event.message.text.replace('去哪', '')
    let url = 'https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json'
    if (temp[3].includes('新北市')) {
      url = 'https://data.ntpc.gov.tw/api/datasets/71CD1490-A2DF-4198-BEF1-318479775E8A/json?page=0&size=1000'
    } else if (temp[3].includes('桃園')) {
      url = 'https://data.tycg.gov.tw/api/v1/rest/datastore/a1b4714b-3b75-4ff8-a8f2-cc377e4eaa0f?format=json'
    } else if (temp[3].includes('台北市')) {
      url = 'https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json'
    } else if (temp[3].includes('高雄')) {
      url = 'https://data.tycg.gov.tw/api/v1/rest/datastore/a1b4714b-3b75-4ff8-a8f2-cc377e4eaa0f?format=json'
    } else {
      event.reply('不支援所在城市')
      return
    }

    const { data } = await axios.get(url)

    let bikes = []
    if (temp[3].includes('桃園')) {
      bikes = data.result.records
    } else if (temp[3].includes('高雄')) {
      bikes = data.data.retVal
    } else {
      bikes = data
    }

    const templates = []
    bikes
      .map((value) => {
        value.distance = distance(value.lat, value.lng, temp[1], temp[2], 'K')
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
        const template = youbike()
        template.hero.url =
          'https://www.youbike.com.tw/region/_next/image/?url=%2Fregion%2F_next%2Fstatic%2Fmedia%2F01.d70b2c0e.jpg&w=2048&q=75' ||
          'https://p2.bahamut.com.tw/B/2KU/97/fcf7ff096fa4aadf8596e8f2c91fyod5.JPG?v=1650353507776'
        template.body.contents[0].text = value.sna || 'none'
        template.body.contents[1].contents[0].contents[1].text = value.tot.toString() || 'none'
        template.body.contents[1].contents[1].contents[0].contents[1].text = value.sbi.toString() || 'none'
        template.body.contents[1].contents[2].contents[0].contents[1].text =
          `${Math.floor(value.distance * 1000)} M` || 'none'
        template.body.contents[1].contents[3].contents[0].contents[1].text = value.ar || 'none'
        template.body.contents[1].contents[4].contents[0].contents[1].text = value.updateTime || 'none'
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
