const { ApifyClient } = require('apify-client');

const client = new ApifyClient({
    token: 'apify_api_OxtzvJGARoLrccq9dN4uYxTbjT1ria4hxmFB', // Replace with your actual Apify token
});

async function fetchInstagramData() {
    const username = document.getElementById('username').value.trim();
    if (!username) {
        document.getElementById('result').innerHTML = "Please enter a username!";
        return;
    }

    try {
        // Start the actor and wait for it to finish
        const { defaultDatasetId } = await client.actor('apify/instagram-scraper').call({
            username: username
        });

        // Fetch the dataset items
        const { items } = await client.dataset(defaultDatasetId).listItems();

        if (items && items.length > 0) {
            const profile = items[0];
            const followers = profile.followersCount;
            const posts = profile.posts;
            let totalLikes = 0;
            let totalComments = 0;

            // Calculate likes and comments for the most recent 5 posts
            for (let i = 0; i < Math.min(posts.length, 5); i++) {
                totalLikes += posts[i].likesCount;
                totalComments += posts[i].commentsCount;
            }

            const engagementRate = ((totalLikes + totalComments) / followers) * 100;

            document.getElementById('result').innerHTML = `
                Username: @${username} <br>
                Followers: ${followers} <br>
                Engagement Rate (last 5 posts): ${engagementRate.toFixed(2)}%
            `;
        } else {
            document.getElementById('result').innerHTML = "Username not found.";
        }
    } catch (error) {
        console.error('Error occurred:', error);
        document.getElementById('result').innerHTML = `An error occurred while fetching data: ${error.message}`;
    }
}