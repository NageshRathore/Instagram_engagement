async function fetchInstagramData() {
    const username = document.getElementById('username').value.trim();
    if (!username) {
        document.getElementById('result').innerHTML = "Please enter a username!";
        return;
    }

    // API endpoint and token (replace with your actual API key)
    const url = `https://api.apify.com/v2/actor-tasks/SLmgNoGXnDUCrjZ81/run-sync-get-dataset-items?username=${username}`;
    const apiToken = 'apify_api_OxtzvJGARoLrccq9dN4uYxTbjT1ria4hxmFB';  // Your API token from the service

    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiToken}`  // Token passed as a Bearer Token
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
            const profile = data[0];
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
        document.getElementById('result').innerHTML = "An error occurred while fetching data.";
    }
}