const TelegramApi = require('node-telegram-bot-api')
const { gameOptions, againOptions } = require('./options')

const token = '5707336249:AAHCyQ5ZK9e3H2WlZBPswEgHVpLkEw6OP4o'

const bot = new TelegramApi(token, { polling: true })

const chats = {}



const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Guess number from 0 to 10')
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'guess !', gameOptions)
}

const start = () => {
    bot.setMyCommands([
        { command: '/start', description: 'Start' },
        { command: '/info', description: 'Get info about user' },
        { command: '/game', description: 'guess the number' }
    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;

        if (text === '/start') {
            return bot.sendMessage(chatId, `welcome`)
        }
        if (text === '/info') {
            return bot.sendMessage(chatId, `your name is ${msg.from.first_name} ${msg.from.last_name === undefined ? '' : msg.from.last_name} `)
        }
        if (text === '/game') {
            startGame(chatId)
        }
        return bot.sendMessage(chatId, 'I don\'t understand you')
    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data === '/again') {
            return startGame(chatId)
        }
        if (parseInt(data) === chats[chatId]) {
            return bot.sendMessage(chatId, 'Congratulation. You won!', againOptions)
        } else {
            return bot.sendMessage(chatId, `You lost :(. The correct answer was number ${chats[chatId]}`, againOptions)
        }
    })
}

start()