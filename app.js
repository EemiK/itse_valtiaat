const apiUrl = "http://localhost:5000/api/sheet";
let items = [];
let currentIndex = 0;

async function fetchItems() {
    try {
        const response = await fetch(`${apiUrl}`);
        if (response.ok) {
            items = await response.json();
            showItem(currentIndex);
        } else {
            console.error('Error fetching items');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


function showItem(index) {
    if (items.length === 0) {
        document.getElementById("item-title").innerText = "No data available";
        return;
    }

    const item = items[index];
    document.getElementById("item-title").innerText = `${item.Number || "N/A"} ${item.Title || "Title not available"}`;
    document.getElementById("item-points").innerText = `Points: ${item.Points/item.Votes || "N/A"}`;
    document.getElementById("item-airdate").innerText = `Airdate: ${item.Airdate || "N/A"}${item.Year || "N/A"}`;
    document.getElementById("item-duration").innerText = `Duration: ${item.Duration || "N/A"}`;

    document.getElementById("prev-btn").disabled = index === 0;
    document.getElementById("next-btn").disabled = index === items.length - 1;
}

document.getElementById("next-btn").addEventListener("click", () => {
    if (currentIndex < items.length - 1) {
        currentIndex++;
        showItem(currentIndex);
    }
});

document.getElementById("prev-btn").addEventListener("click", () => {
    if (currentIndex > 0) {
        currentIndex--;
        showItem(currentIndex);
    }
});

document.getElementById("score-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const score = document.getElementById("score").value;
    if (score < 1 || score > 10) {
        alert("Please provide a score between 1 and 10");
        return;
    }

    const itemId = items[currentIndex].ID;
    try {
        const response = await fetch(`${apiUrl}/${itemId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ score: score })
        });

        if (response.ok) {
            const result = await response.json();
            alert(`Score submitted! New score: ${result.newPoints}`);
            // Update points on the page
            document.getElementById("item-points").innerText = `Points: ${result.newPoints}`;
        } else {
            alert("Error submitting score");
        }
    } catch (error) {
        alert("Error submitting score");
        console.error('Error:', error);
    }
});

// Initialize the app
fetchItems();
