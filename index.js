require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios')
const cron = require('node-cron')
const bot = new Telegraf(process.env.Bot_Token)
const YOUR_API_KEY = process.env.YOUR_API_KEY

const help = `Hi this is Hotaro 
/weather <City_name> : to see the weather at any location 
/help : to see this
/meme : to see a Dankmeme
/meme <any_no.> : to see multiple meme at a time [Max : 50]`

bot.start((ctx) => {
  ctx.reply(help)
});

bot.command('help', (ctx) => {
  ctx.reply(help)
})

const chatId = '1628311206'
// const location = 'Haldwani'

bot.command('weather', async (ctx) => {
  // const location = ctx.message.text.slice(9)
  const location = ctx.message.text.split(' ')[1];
  if (!location) return ctx.reply('Please specify a city');
  async function sendWeatherReport(chatId) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${YOUR_API_KEY}&units=metric`

    try {
      const response = await axios.get(url)
      const { temp, feels_like, humidity } = response.data.main
      const { description } = response.data.weather[0]

      const message = `Weather Report: 
      Location : ${location}
      Temp. : ${temp}°C 
      Feels Like : ${feels_like}°C
      Humidity : ${humidity}%
      Weather : ${description}`

      bot.telegram.sendMessage(chatId, message)
    } catch (error) {
      console.error(error)
      bot.telegram.sendMessage(chatId, 'Sorry, we could not retrieve the weather information for your location. Please try again later.')
    }
  }
  sendWeatherReport(ctx.chat.id)
})

bot.command('meme', async (ctx) => {
  const count = ctx.message.text.split(' ')[1];
  // console.log(count);
  if (count) {
    try {
      const response = await axios.get(`https://meme-api.com/gimme/${count}`);
      const memes = response.data.memes;
      for (const meme of memes) {
        ctx.replyWithPhoto(meme.url, { caption: meme.title });
      }
    } catch (error) {
      ctx.reply('Sorry, I could not fetch a meme at the moment. Please try again later.');
    }
  } else {
    try {
      const res = await axios.get('https://meme-api.com/gimme')
      const { url, title } = res.data
      ctx.replyWithPhoto(url, { caption: title })
    } catch (error) {
      console.error(error);
      ctx.reply('Sorry, I could not fetch a meme at the moment. Please try again later.');
    }
  }
})
cron.schedule('0 6 * * *', () => {
  sendWeatherReport(chatId)
})

bot.launch(); 
