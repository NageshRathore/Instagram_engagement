const express = require('express'); 
const axios = require('axios');
const path = require('path'); // Import path module
const app = express();
const port = 3000;

const APIFY_TOKEN = 'apify_api_tNGHMFgy2xvhEDzvzblSKbH1uePLgR1An3UL'; 
const ACTOR_ID = 'apify~instagram-scraper';

app.use(express.static(__dirname));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Serve the HTML file
});

// Endpoint to fetch Instagram data
app.post('/instagram', async (req, res) => {
    const { username } = req.body;
    console.log(`Received request for username: ${username}`);

    try {
        const requestUrl = `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`;
        console.log(`Requesting URL: ${requestUrl}`);

        const response = await axios.post(requestUrl, {
            input: { username },
        });

        console.log('Response from Apify:', response.data);
        
        // Check if items were retrieved
        const items = response.data;

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
                res.json({
                    username,
                    followers,
                    engagementRate: engagementRate.toFixed(2),
                    totalLikes,
                    totalComments,
                });
            } else {
                return res.status(400).json({ error: "Follower count is zero." });
            }
        } else {
            res.status(404).json({ error: "Username not found or no data available" });
        }
    } catch (error) {
        if (error.response) {
            console.error("API Error Response:", error.response.data);
            res.status(error.response.status).json({ error: error.response.data.message || 'An error occurred' });
        } else {
            console.error("Error:", error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
