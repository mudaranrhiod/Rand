document.addEventListener("astro:page-load", () => {
const userId = "807170846497570848";

fetchReviews();

async function fetchReviews() {
    try {
        const response = await fetch(`https://manti.vendicated.dev/api/reviewdb/users/${userId}/reviews`)
        if (!response.ok) {
            throw new Error ("Error")
        }
        const data = await response.json()
        console.log(data)
        data.reviews = data.reviews.filter(reviews => reviews.id !== 0);
        displayReviews(data.reviews);
    }
    catch(error) {
        console.error(error)
    }
}

function displayReviews(reviews) {
    const container = document.getElementById("user-reviews");
    container.innerHTML = '';
    reviews.forEach(review => {
        const reviewEl = document.createElement("li");
        reviewEl.innerHTML = `
            <div style="background-color: transparent" class="avatar-container shape sided-cookie9">
                <img src="${review.sender.profilePhoto}" class="responsive" />
            </div>
            <div class="min">
                <a style="display:inline;" href="https://discord.com/users/${review.sender.discordID}" target="_blank"><h6 class="small" style="color:var(--on-surface)">${review.sender.username}</a>
                <span style="color:var(--on-surface-variant); font-size: 12px;">${review.timestamp}</span></h6>
                <div class="review-comment" style="color:var(--secondary)">${review.comment}</div>
            </div>
        `;
        container.appendChild(reviewEl);
    });
}
})