// script.js
async function fetchInstagramData() {
    const username = document.getElementById('username').value.trim();
    if (!username) {
        document.getElementById('result').innerHTML = "Please enter a username!";
        return;
    }

    try {
        const response = await fetch(`/instagram/${username}`);
        const data = await response.json();

        if (response.ok) {
            document.getElementById('result').innerHTML = `
                Username: @${username} <br>
                Followers: ${data.followers} <br>
                Engagement Rate (last 5 posts): ${data.engagementRate}% <br>
                Total Likes: ${data.totalLikes} <br>
                Total Comments: ${data.totalComments}
            `;
        } else {
            document.getElementById('result').innerHTML = data.error;
        }
    } catch (error) {
        document.getElementById('result').innerHTML = `An error occurred while fetching data: ${error.message}`;
    }
}
