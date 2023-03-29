const { Telegraf } = require('telegraf');
const axios = require('axios')
const cron = require('node-cron')
const bot = new Telegraf('5383319279:AAHozd2gIDj3ql2ZH2GVxVHCq2No_WWoIpo');
const YOUR_API_KEY = '4efa5d4ad649afc087650a8168c8a9c1'

const help = `Hi this is Hotaro 
/weather <City_name> : to see the weather at any location 
/help : to see this`

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
      
      const message =`Weather Report: 
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

cron.schedule('0 6 * * *', () => {
  sendWeatherReport(chatId)
})
bot.launch(); 
