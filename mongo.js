const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
const episodeSchema = new mongoose.Schema({
    number: Number,
    title: String,
    airing: String,
    length: String,
});

const get_data = async () => {
    try {
        const episodes = [];
        const specials = [];

        const page = "https://fi.wikipedia.org/w/api.php?" +
            new URLSearchParams({
                origin: "*",
                action: "parse",
                page: "Luettelo televisiosarjan Itse valtiaat jaksoista",
                prop: "sections",
                format: "json",
            });

        const page_req = await fetch(page);
        const page_json = await page_req.json();

        for (let i = 3; i < 17; i++) {
            const section = "https://fi.wikipedia.org/w/api.php?" +
                new URLSearchParams({
                    origin: "*",
                    action: "parse",
                    page: "Luettelo televisiosarjan Itse valtiaat jaksoista",
                    section: i,
                    prop: "wikitext",
                    format: "json",
                });

            const section_req = await fetch(section);
            const section_json = await section_req.json();

            if (!section_json.parse || !section_json.parse.wikitext) {
                console.log(`Skipping section ${i}, no valid data found.`);
                continue;
            }

            section_json["parse"]["wikitext"]["*"].split("|-").forEach((line) => {
                const episode = line.replace("|", " ") 
                                    .replace(/\s|\\n?/g, '')
                                    .split("||");

                if (episode.length > 1 && episode[0] !== "") {
                    episodes.push(episode);
                } else if (episode.length > 3 && episode[0] === "") {
                    specials.push(episode);
                }
            });
        }

        // Connect to MongoDB
        mongoose.set('strictQuery', false);
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");

        const Episode = mongoose.model('Episode', episodeSchema);

        // Insert episodes using for...of loop
        for (const episode of episodes) {
            const newEpisode = new Episode({
                number: parseInt(episode[0]),
                title: episode[1],
                airing: episode[2],
                length: episode[3],
            });

            await newEpisode.save();
            console.log(`Episode ${episode[0]} saved`);
        }

        console.log("All episodes saved!");
        mongoose.connection.close();

    } catch (error) {
        console.error("Error:", error);
        mongoose.connection.close();
    }
};

get_data();
