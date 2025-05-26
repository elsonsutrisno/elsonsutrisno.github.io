// Optional: Fetch GitHub repositories dynamically using the GitHub API
document.addEventListener('DOMContentLoaded', () => {
    const repoList = document.getElementById('repo-list');
    const username = 'elsonsutrisno'; // Replace with your GitHub username

    fetch(`https://api.github.com/users/${username}/repos`)
        .then(response => response.json())
        .then(data => {
            repoList.innerHTML = ''; // Clear placeholder content
            data.slice(0, 4).forEach(repo => { // Show up to 4 repos
                const repoDiv = document.createElement('div');
                repoDiv.className = 'project';
                repoDiv.innerHTML = `
                    <h3>${repo.name}</h3>
                    <p>${repo.description || 'No description available.'} 
                    <a href="${repo.html_url}" target="_blank">View on GitHub</a></p>
                `;
                repoList.appendChild(repoDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching repos:', error);
        });
});