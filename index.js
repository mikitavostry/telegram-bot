require('dotenv').config()
const sequelize = require('./db')
const TelegramApi = require('node-telegram-bot-api')
const { gameOptions, againOptions } = require('./options')
const UserModel = require('./models')
const { User } = require('../shop project/server/models/models')
const token = process.env.TOKEN

const bot = new TelegramApi(token, { polling: true })

const chats = {}



const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Guess number from 0 to 10')
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'guess !', gameOptions)
}

const start = async () => {

    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (e) {
        console.log(e)
    }
    bot.setMyCommands([
        { command: '/start', description: 'Start' },
        { command: '/info', description: 'Get info about user' },
        { command: '/game', description: 'guess the number' }
    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;

        try {
            if (text === '/start') {
                await UserModel.create({ chatId })
                return bot.sendMessage(chatId, `Welcome`)
            }
            if (text === '/info') {
                const user = await UserModel.findOne({ chatId })
                return bot.sendMessage(chatId, `Your name is ${msg.from.first_name} ${msg.from.last_name === undefined ? '' : msg.from.last_name}.You have ${user.right} right answers and ${user.wrong} wrong answers.`)
            }
            if (text === '/game') {
                startGame(chatId)
            }
            return bot.sendMessage(chatId, 'I don\'t understand you')
        } catch (e) {
            return bot.sendMessage(chatId, 'An error happened :(')
        }

    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data === '/again') {
            return startGame(chatId)
        }
        const user = await UserModel.findOne({ chatId })
        if (parseInt(data) === chats[chatId]) {
            user.right += 1;
            await bot.sendMessage(chatId, 'Congratulation. You won!', againOptions)
        } else {
            user.wrong += 1;
            await bot.sendMessage(chatId, `You lost :(. The correct answer was number ${chats[chatId]}`, againOptions)
        }
        await user.save()
    })
}

start()