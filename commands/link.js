const fs = require('fs');

module.exports = {
    name: "link",
    description: "Link a Valorant username to a Discord ID",

    execute(message) {

        // Read file
        const accounts = JSON.parse(
            fs.readFileSync("./accounts.json", "utf8", function (error) {
                if (error) console.log(error);
            })
        );

        const args = message.content
            .slice(6)
            .trim()
            .split(/ +/g);

        if (!args[0]) return message.reply('Please include your Valorant username and tag (USERNAME-TAG)')

        let str = args[0]

        for (i = 1; i < args.length; i++)
            str += '%20' + args[i];

        var username = str.toLowerCase();

        accounts[message.author.id] = {
            username: username
        };

        // Write to file
        fs.writeFile("./accounts.json", JSON.stringify(accounts), error => {
            if (error) console.error(error);
        });
        message.reply("You have successfully linked your Valorant account!");

    }

}