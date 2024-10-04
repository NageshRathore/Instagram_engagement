const express = require('express');
const axios = require('axios');
const path = require('path'); 
const app = express();
const port = 3000;
const APIFY_TOKEN = 'apify_api_tNGHMFgy2xvhEDzvzblSKbH1uePLgR1An3UL'; 
const ACTOR_ID = 'apify~instagram-scraper';

app.use(express.static(__dirname));
app.use(express.json());

app.get('/', (req, res) => {
    console.log("Serving index.html");
    res.sendFile(path.join(__dirname, 'index.html')); 
});

app.post('/instagram', async (req, res) => {
    const { username } = req.body;
    console.log(`Received request for Instagram username: ${username}`);

    try {
        console.log("Starting scraper execution...");
        const runScraperUrl = `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}`;
        console.log(`Requesting scraper execution with URL: ${runScraperUrl}`);
        
        const runResponse = await axios.post(runScraperUrl, { input: { username } });
        console.log('Response from Apify run execution:', runResponse.data);
        const datasetId = runResponse.data.defaultDatasetId;
        console.log(`Dataset ID retrieved: ${datasetId}`);
        const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`;
        console.log(`Fetching dataset with URL: ${datasetUrl}`);
        const dataResponse = await axios.get(datasetUrl);
        const items = dataResponse.data;
        console.log('Items retrieved from the dataset:', items);
        if (Array.isArray(items) && items.length > 0) {
            const profile = items[0];
            const followers = profile.followersCount || 0;
            const posts = profile.posts || [];
            let totalLikes = 0;
            let totalComments = 0;

            for (let i = 0; i < Math.min(posts.length, 5); i++) {
                totalLikes += posts[i].likesCount || 0;
                totalComments += posts[i].commentsCount || 0;
            }

            if (followers > 0) {
                const engagementRate = ((totalLikes + totalComments) / followers) * 100;
                console.log(`Engagement rate calculated: ${engagementRate}`);
                res.json({
                    username,
                    followers,
                    engagementRate: engagementRate.toFixed(2),
                    totalLikes,
                    totalComments,
                });
            } else {
                console.error("Follower count is zero");
                return res.status(400).json({ error: "Follower count is zero." });
            }
        } else {
            console.error("No data found for the username");
            res.status(404).json({ error: "Username not found or no data available" });
        }
    } catch (error) {
        if (error.response) {
            console.error("API Error Response:", error.response.data);
            res.status(error.response.status).json({ error: error.response.data.message || 'An error occurred' });
        } else {
            console.error("Unexpected Error:", error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
