require('dotenv/config');
const {Client} = require(`discord.js`);
const {OpenAI} = require (`openai`);


const client = new Client ({
   intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent']
});


client.on('ready', () => {
   console.log('The bot is online')
})


const IGNORE_PREFIX = "!"; //If someone sends a message beginning with ! it will ignore it
const CHANNELS = ['1220447253995454624']


//OPEN AI CONFIG


const openai = new OpenAI({
   apiKey : process.env.OPENAI_KEY,
})






client.on('messageCreate', async (message) => {
   if (message.author.bot) return;
   if (message.content.startsWith(IGNORE_PREFIX)) return;






   if (message.content.startsWith('ban')) {
       // Check if the user has permissions to ban
       if (!message.member.permissions.has('BAN_MEMBERS')) {
           return message.reply('You cant ban stupeh.');
       }

       const userToBan = message.mentions.members.first();
       if (!userToBan) {
           return message.reply('Please mention the person you want to ban.');
       }
      
       // Ban the user


       try {
           await userToBan.ban();
           return message.channel.send(`${userToBan.user.tag} has been deported.`);
       } catch (error) {
           console.error('Error banning user:', error);
           return message.reply('There was an error while trying to ban the user.');
       }
   }


   if (!CHANNELS.includes(message.channelId)&& !message.mentions.users.has(client.user.id)) return;


   await message.channel.sendTyping();




   const sendTypingInterval = setInterval(() => {
       message.channel.sendTyping();
   },5000)






   let conversation = [];
   conversation.push({
       role: 'system',
       content: 'Chat GPT is a friendly chatbot',
   });


   let prevMessages = await message.channel.messages.fetch({limit: 10})
   prevMessages.reverse();


   prevMessages.forEach((msg) => {
       if (msg.author.bot && msg.author.id !== client.user.id) return;
       if (msg.content.startsWith(IGNORE_PREFIX)) return;
       const username = msg.author.username.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '');
       if (msg.author.id === client.user.id) {
            conversation.push({
                role: 'assistant',
                name: username,
                content: msg.content,
            });


            return;
       }


       conversation.push({
           role:'user',
           name: username,
           content: msg.content,
       });
   }) 


   const response = await openai.chat.completions
   .create({
       model: 'gpt-3.5-turbo',
       messages:conversation,


   }) .catch((error) => console.error('OpenAI Error:\n', error))


   clearInterval(sendTypingInterval);


   if(!response){
       message.reply("Error communicating with openAI")
       return;
   }
   message.reply(response.choices[0].message.content)


})
client.login(process.env.TOKEN);




