import axios from 'axios'
import { distance } from '../distance.js'
import upup from '../templates/upup.js'
import _ from 'lodash'

export default async (event) => {
  const temp = event.postback.data.split(',')
  try {
    // const id = event.message.text.replace('去哪', '')
    const { data } = await axios.get('https://vipmbr.cpc.com.tw/openData/5typeservicestn')

    const templates = []

    let stations = data
      .map((value) => {
        value.distance = distance(value.緯度, value.經度, temp[1], temp[2], 'K')
        return value
      })
      .filter((value) => {
        return value.distance < 5
      })
      .sort((a, b) => {
        return a.distance - b.distance
      })

    stations = _.uniqWith(stations, (a, b) => {
      return a.站名 === b.站名
    })

    // eslint-disable-next-line no-unused-vars
    stations = stations.slice(0, 5).forEach((value) => {
      const has = templates.some((template) => {
        return template.body.contents[0].text === value.站名
      })
      if (!has) {
        const template = upup()
        template.hero.url =
          'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/CPC_Corporation%2C_Taiwan_Seal.svg/150px-CPC_Corporation%2C_Taiwan_Seal.svg.png' ||
          'https://p2.bahamut.com.tw/B/2KU/97/fcf7ff096fa4aadf8596e8f2c91fyod5.JPG?v=1650353507776'
        template.body.contents[0].text = value.站名
        template.body.contents[1].contents[0].contents[0].text = value.服務類型 || 'none'
        template.body.contents[1].contents[1].contents[0].contents[1].text = value.地址 || 'none'
        template.body.contents[1].contents[2].contents[0].contents[1].text =
          `${Math.floor(value.distance * 1000)} M` || 'none'
        templates.push(template)
        console.log(value)
      }
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
