async function fetchInstagramData() {
    const username = document.getElementById('username').value.trim();
    if (!username) {
        document.getElementById('result').innerHTML = "Please enter a username!";
        return;
    }

    // Show loading indicator
    document.getElementById('result').innerHTML = "Loading...";

    // Make API call to fetch Instagram profile data
    const url = `https://instagram-scraper-2022.p.rapidapi.com/ig/profile?user=${username}`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'YOUR_API_KEY_HERE',  // Replace with your actual API key
            'X-RapidAPI-Host': 'instagram-scraper-2022.p.rapidapi.com'
        }
    };

    try {
        console.log('Fetching data from API...');
        const response = await fetch(url, options);
        console.log('Response received:', response);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Data received:', data);

        if (data && data.graphql) {
            const followers = data.graphql.user.edge_followed_by.count;
            const posts = data.graphql.user.edge_owner_to_timeline_media.edges;
            let totalLikes = 0;
            let totalComments = 0;

            // Calculate likes and comments for the most recent 5 posts
            for (let i = 0; i < Math.min(posts.length, 5); i++) {
                totalLikes += posts[i].node.edge_liked_by.count;
                totalComments += posts[i].node.edge_media_to_comment.count;
            }

            const engagementRate = ((totalLikes + totalComments) / followers) * 100;

            document.getElementById('result').innerHTML = `
                Username: @${username} <br>
                Followers: ${followers} <br>
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