import 'dotenv/config'
import linebot from 'linebot'
import wh from './commands/where.js'
import upup from './commands/upup.js'
import hotel from './commands/hotel.js'
import youbike from './commands/youbike.js'

// import { distance } from './distance.js'
// https://crontab.guru/once-a-day
// scheduleJob('0 0 * * *', () => {
//   usdtwd.update()
// })
// usdtwd.update()

const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

bot.on('message', (event) => {
  if (process.env.DEBUG === 'true') {
    console.log(event)
  }
  if (event.message.type === 'location') {
    event.reply({
      type: 'text',
      text: '選擇查詢內容',
      quickReply: {
        items: [
          {
            type: 'action',
            action: {
              type: 'postback',
              label: '附近有什麼',
              data: `景點,${event.message.latitude},${event.message.longitude}`
            }
          },
          {
            type: 'action',
            action: {
              type: 'postback',
              label: '加油站',
              data: `加油站,${event.message.latitude},${event.message.longitude}`
            }
          },
          {
            type: 'action',
            action: {
              type: 'postback',
              label: '住宿',
              data: `住宿,${event.message.latitude},${event.message.longitude}`
            }
          },
          {
            type: 'action',
            action: {
              type: 'postback',
              label: 'youbike即時查詢',
              data: `youbike,${event.message.latitude},${event.message.longitude},${event.message.address}`
            }
          }
        ]
      }
    })
  }
})

bot.on('postback', (event) => {
  if (process.env.DEBUG === 'true') {
    console.log(event)
  }
  const data = event.postback.data.split(',')
  if (data[0] === '景點') {
    wh(event)
  } else if (data[0] === '加油站') {
    upup(event)
  } else if (data[0] === '住宿') {
    hotel(event)
  } else if (data[0] === 'youbike') {
    youbike(event)
  }
})

bot.listen('/', process.env.PORT || 3000, () => {
  console.log('機器人啟動')
})
