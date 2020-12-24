const bookmarkActions = require('../eventActions/bookmarkActions');
const starboardActions = require('../eventActions/starboardActions');

module.exports = async (client, reaction, user) => {
  console.log('----------ONE------------');
  console.log(reaction);
  console.log(user);
  if (reaction.message.partial) await reaction.message.fetch();
  // Bookmark messages in DMs
  bookmarkActions.bookmarkMessage(client, user, reaction);
  // Check if message should be added to starboard or if starboard message should be updated
  starboardActions.checkStar(client, user, reaction);
};
