// Get the afk Table stored in the SQLite database
const Afks = require('../databaseFiles/afkTable.js');

module.exports.execute = async (client, message, args) => {
  try {
    if (
      message.content.toLowerCase().indexOf('good') != -1 &&
      !message.content.toLowerCase().indexOf('night') != -1 &&
      !message.content.toLowerCase().indexOf('readers') != -1
    ) {
      //pass
    } else {
      message.delete();
    }
  } catch (err) {
    console.log('Delete error' + err);
  }

  const sender = message.author;

  var afkMessage;

  if (args[1] == 'auto') {
    afkMessage = args[0];
  } else if (args.length > 0) {
    afkMessage = args.join(' ');
  } else {
    afkMessage = "They didn't tell us where they went...";
  }

  Afks.sync().then(() =>
    Afks.findAll({
      where: {
        user: sender.id,
      },
    }).then(findresult => {
      if (findresult.length == 0) {
        Afks.create({
          message: afkMessage,
          user: sender.id,
          cooldown: Date.now(),
          date: Date.now(),
        }).then(() => {
          try {
            message.channel
              .send(
                `I have marked you as AFK, <@${sender.id}>. Anyone who pings you will be notified you are away.\n\`\`\`AFK Message: ${afkMessage}\`\`\``
              )
              .then((msg) => msg.delete({ timeout: 10000 }).catch());
          } catch (err) {
            console.log(err);
          }
        })
        .catch((err) => {
          console.error('Afk sequelize error: ', err);
        });
      } else {
        Afks.destroy({
          where: {
            user: sender.id,
          },
        }).then((result) => {
          // User successfully removed from table
          if (result == 1) {
            return message.channel
              .send(
                `Welcome back, ${
                  message.member.nickname
                    ? message.member.nickname
                    : message.author.username
                }!`
              )
              .then((delmessage) => delmessage.delete({ timeout: 5000 }))
              .catch('Error sending message.');
          }
        });
      }
    })
  );
};

module.exports.config = {
  name: 'afk',
  aliases: ['afk', 'away'],
  module: 'Utility',
  description:
    'I will mark you as being away. When people tag you, they will be notified that you are not present.',
  usage: ['afk [message]'],
};
