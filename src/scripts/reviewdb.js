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
        const reviewEl = document.createElement("li")
        reviewEl.innerHTML = `
            <img class="round" src="${review.sender.profilePhoto}">
            <div class="min">
                <h6 class="small">${review.sender.username}</h6>
                <div class="review-comment">${review.comment}</div>
            </div>
        `;

        container.appendChild(reviewEl);
    });
}