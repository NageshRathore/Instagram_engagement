async function fetchInstagramData() {
    const username = document.getElementById('username').value.trim();
    if (!username) {
        document.getElementById('result').innerHTML = "Please enter a username!";
        return;
    }

    // Show loading indicator
    document.getElementById('result').innerHTML = "Loading...";

    // Make API call to fetch Instagram profile data
    const accessToken = '456057667462081|df9UL0l_sIuGZLKpt86W1R5R7_g';  // Replace with your actual access token

    try {
        // Get user ID using the access token
        const userId = await getUserId(accessToken);
        if (!userId) {
            document.getElementById('result').innerHTML = "Failed to get user ID.";
            return;
        }

        const url = `https://graph.instagram.com/${userId}?fields=id,username,media_count&access_token=${accessToken}`;
        console.log('Fetching data from API...');
        const response = await fetch(url);
        console.log('Response received:', response);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Data received:', data);

        if (data && data.username) {
            const mediaCount = data.media_count;

            // Fetch recent media to calculate engagement rate
            const mediaUrl = `https://graph.instagram.com/${data.id}/media?fields=id,like_count,comments_count&access_token=${accessToken}`;
            const mediaResponse = await fetch(mediaUrl);
            const mediaData = await mediaResponse.json();

            let totalLikes = 0;
            let totalComments = 0;
            const posts = mediaData.data;

            // Calculate likes and comments for the most recent 5 posts
            for (let i = 0; i < Math.min(posts.length, 5); i++) {
                totalLikes += posts[i].like_count;
                totalComments += posts[i].comments_count;
            }

            // Placeholder for followers count as it's not provided by the API
            const followers = 1000;  // Replace with actual followers count if available
            const engagementRate = ((totalLikes + totalComments) / followers) * 100;

            document.getElementById('result').innerHTML = `
                Username: @${username} <br>
                Media Count: ${mediaCount} <br>
                Engagement Rate (last 5 posts): ${engagementRate.toFixed(2)}%
            `;
        } else {
            document.getElementById('result').innerHTML = "Username not found or API limit reached.";
        }
    } catch (error) {
        console.error('Error occurred:', error);
        document.getElementById('result').innerHTML = "An error occurred while fetching data.";
    }
}

async function getUserId(accessToken) {
    const url = `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.id;
    } catch (error) {
        console.error('Error occurred:', error);
        return null;
    }
}

// Example usage
const accessToken = 'YOUR_ACCESS_TOKEN_HERE';  // Replace with your actual access token
getUserId(accessToken).then(userId => {
    if (userId) {
        console.log('User ID:', userId);
    } else {
        console.log('Failed to get user ID');
    }
});