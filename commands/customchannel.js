const customChannelTable = require('../databaseFiles/customChannelTable');
const Discord = require("discord.js");

module.exports.execute = async (client, message, args) => {
  switch (args[0].toLowerCase()) {
    case 'drop':
      if (message.member.hasPermission('ADMINISTRATOR')) {
        customChannelTable.drop()
        .then(message.channel.send(`Custom channel database has been wiped!`));
      } else {
        return message.channel.send("You do not have permissions to wipe the custom channel database!");
      }
    break;
    case 'add':
      if (message.member.hasPermission('ADMINISTRATOR')) {
        args.shift();
        console.log("1" + args);
        var clean = args.join(' ');
        clean = clean.split(",");
        clean = clean.map(s => s.trim());
        console.log("2" + clean);

        var roleid = clean[0];
        var name = clean[1];
        var cleanname = name.replace(/\W/g, '');
        var description = clean[2];

        try {
          customChannelTable.sync().then(() =>
            customChannelTable.create({
              roleid: roleid,
              name: name,
              cleanname: cleanname,
              description: description
            })
            .then(() => {
              try {
                message.channel
                  .send(
                    `Custom channel has been added to database!`
                  );
              } catch (err) {
                console.log(err);
              }
            })
            .catch((err) => {
              if (err.name == 'SequelizeUniqueConstraintError' && args[1] != 'auto') {
                return message.channel.send("There seems to already be such a channel added!");
              }
              console.error('Sequelize error: ', err);
            })
          );
        } catch(err) {
          return message.channel.send("There was an error adding that to the database! Are you sure you used commas around every value?");
        }
      } else {
        return message.channel.send("You do not have permissions to add a custom channel!");
      }
    break;
    case 'remove':
      if (message.member.hasPermission('ADMINISTRATOR')) {
        args.shift();
        var removechannelname = args.join(' ');

        if (removechannelname) {
          try {
            customChannelTable.sync().then(() =>
              customChannelTable.destroy({
                where: {
                  name: removechannelname
                }
              })
              .then(() => {
                try {
                  message.channel
                    .send(
                      `Custom channel has been removed from database!`
                    );
                } catch (err) {
                  console.log(err);
                }
              })
              .catch((err) => {
                if (err.name == 'SequelizeUniqueConstraintError' && args[1] != 'auto') {
                  return message.channel.send("There seems to be no such channel!");
                }
                console.error('Sequelize error: ', err);
              })
            );
          } catch(err) {
            return message.channel.send("There was an error removing that from the database!");
          }
        }
      } else {
        return message.channel.send("You do not have permissions to remove a custom channel!");
      }
    break;
    case 'list':
      await customChannelTable.sync().then(() => {
        customChannelTable.findAll({
          attributes: ["name", "description"]
        }).then((result) => {
          let helpMessage = new Discord.RichEmbed()
          .setColor('#750384')
          .setTitle(`Custom Channels`)
          .setDescription(
            `Listing all custom channels you can join.`
          );

          if (result.length >= 1) {
            var i;
            for (i = 0; i < result.length; i++) {
              helpMessage.addField(result[i].name, result[i].description);
            }
          } else {
            helpMessage.addField("None Found", "No custom channels found in the database.");
          }

          return message.channel.send(helpMessage);
        });
      });
    break;
    case 'join':
      args.shift();
      var channelname = args.join(' ');
      channelname = channelname.replace(/\W/g, '');

      await customChannelTable.sync().then(() => {
        customChannelTable.findAll({
          where: {
            cleanname: channelname
          }
        }).then((result) => {
          if (result.length == 1) {
            // get role by ID
            let userrole = message.guild.roles.get(result[0].roleid);
            message.member.addRole(userrole)
            .then(message.channel.send("You have joined the channel!"))
            .catch(err => console.error("Custom Channel error, " + err));
          } else {
            return message.channel.send("No such custom channel found in the database. Make sure you typed the name correctly.");
          }
        });
      });
    break;
    case 'leave':
      args.shift();
      var leavechannelname = args.join(' ');
      leavechannelname = leavechannelname.replace(/\W/g, '');

      await customChannelTable.sync().then(() => {
        customChannelTable.findAll({
          where: {
            cleanname: leavechannelname
          }
        }).then((result) => {
          if (result.length == 1) {
            // get role by ID
            let userrole = message.guild.roles.get(result[0].roleid);
            message.member.removeRole(userrole)
            .then(message.channel.send("You have left the channel."))
            .catch(err => console.error("Custom Channel error, " + err));
          } else {
            return message.channel.send("No such custom channel found in the database. Make sure you typed the name correctly.");
          }
        });
      });
    break;
    default:
      return await message.channel.send(`I don't recognize that subcommand! Please try again.`);
  }
};

module.exports.config = {
  name: 'customchannel',
  aliases: ['cc'],
  module: "Utility",
  description: 'Join custom channels from people who have bought them from UnbelievaBoat for 1 million red bookmarks!',
  usage: ['customchannel [add <role ID>, <name>, <description> | join <name> | leave <name> | list | remove <name> | drop <name>]']
};
