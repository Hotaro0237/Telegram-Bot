require('dotenv').config()
const { Telegraf } = require('telegraf');
const axios = require('axios')

const bot = new Telegraf(process.env.Bot_Token)
const YOUR_API_KEY = process.env.YOUR_API_KEY

const help = `Hi this is Hotaro 
/help : to see this
/weather <City_name> : to see the weather at any location 
/meme : to see a meme
/meme <any_no.> : to see multiple meme at a time [Max : 50]
/news : to see latest news of India
/news <country_code> : to see the latest news of your choice of country`

bot.start((ctx) => {
  ctx.reply(help)
});

bot.command('help', (ctx) => {
  ctx.reply(help)
})

bot.command('weather', async (ctx) => {
  // const location = ctx.message.text.slice(9)
  const now = new Date();
  const message = `[${now.toLocaleString()}] User ${ctx.from.first_name} (${ctx.from.username}) requested Weather Info`
  ctx.telegram.sendMessage('-1001916976667', message)
  ctx.telegram.sendChatAction(ctx.message.chat.id, 'typing')
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
  const now = new Date();
  const message = `[${now.toLocaleString()}] User ${ctx.from.first_name} (${ctx.from.username}) requested a meme`
  // ctx.telegram.sendMessage('-849365318', message)
  ctx.telegram.sendMessage('-1001916976667', message)
  ctx.telegram.sendChatAction(ctx.message.chat.id, 'upload_photo')
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
      ctx.reply('Sorry, I could not fetch a meme at the moment. Please try again later.');
      console.error(error);
    }
  }
})

bot.command('news', async (ctx) => {
  const now = new Date();
  const message = `[${now.toLocaleString()}] User ${ctx.from.first_name} (${ctx.from.username}) requested News`
  ctx.telegram.sendMessage('-1001916976667', message)
  let location = 'in'; // default location
  const apiKey = process.env.News_Api
  const apiUrl = `https://newsapi.org/v2/top-headlines?country=${location}&apiKey=${apiKey}`

  // check if location is specified in the command
  const commandArgs = ctx.message.text.split(' ');
  if (commandArgs.length > 1) {
    let l = commandArgs[1];
    let apiUrl2 = `https://newsapi.org/v2/top-headlines?country=${l}&apiKey=${apiKey}`;

    try {
      ctx.telegram.sendChatAction(ctx.message.chat.id, 'typing')
      const res = await axios.get(apiUrl2)
      const articles = res.data.articles
      let message = `Here are the latest news headlines from ${l}\n\n`

      for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
        message += `${article.title}\n${article.description}\n\n`;

        if (message.length >= 3000 || i === articles.length - 1) {
          ctx.reply(message);
          message = '';
        }
      }
    } catch (error) {
      console.log(error);
      ctx.reply('Sorry, something went wrong.')
    }
  } else {
    try {
      ctx.telegram.sendChatAction(ctx.message.chat.id, 'typing')
      const res = await axios.get(apiUrl)
      const articles = res.data.articles
      let message = `Here are the latest news headlines from ${location}\n\n`

      for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
        message += `${article.title}\n${article.description}\n\n`;

        if (message.length >= 3000 || i === articles.length - 1) {
          ctx.reply(message);
          message = '';
        }
      }
    } catch (error) {
      console.log(error)
      ctx.telegram.sendChatAction(ctx.message.chat.id, 'typing')
      ctx.reply('Sorry, something went wrong.')
    }
  }
})
bot.mention((ctx) => {
  ctx.reply(`Hi ${ctx.message.from.first_name}! You mentioned me.`)
})

bot.launch(); 
