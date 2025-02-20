const apiUrl = "https://backend-itse-valtiaat.onrender.com/api/sheet";
let items = [];
let currentIndex = 0;

async function fetchItems() {
    try {
        const response = await fetch(`${apiUrl}`);
        if (response.ok) {
            items = await response.json();
            showItem(currentIndex);
            updateScoreboard();
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
    document.getElementById("item-points").innerText = `Pisteet: ${item.Average || "N/A"}`;
    document.getElementById("item-votes").innerText = `Äänet: ${item.Votes || "N/A"}`;
    document.getElementById("item-airdate").innerText = `Ensilähetys: ${item.Airdate || "N/A"}${item.Year || "N/A"}`;
    document.getElementById("item-duration").innerText = `Kesto: ${item.Duration || "N/A"}`;

    document.getElementById("prev-btn").disabled = index === 0;
    document.getElementById("prevten-btn").disabled = index === 0;
    document.getElementById("next-btn").disabled = index === items.length - 1;
    document.getElementById("nextten-btn").disabled = index === items.length - 10;
}

function updateScoreboard() {
    const sortedItems = [...items].sort((a, b) => parseFloat(b.Average.replace(",", ".")) - parseFloat(a.Average.replace(",", "."))).slice(0, 10);

    const scoreboardList = document.getElementById("scoreboard-list");
    scoreboardList.innerHTML = "";

    sortedItems.forEach(item => {
        const listItem = document.createElement("li");
        listItem.innerText = `${item.Number || "N/A"} ${item.Title || "Title not available"} - ${item.Average || "N/A"} (${item.Votes || "N/A"} ääntä)`;
        scoreboardList.appendChild(listItem);
    })
}

document.getElementById("next-btn").addEventListener("click", () => {
    if (currentIndex < items.length - 1) {
        currentIndex++;
        showItem(currentIndex);
    }
});

document.getElementById("nextten-btn").addEventListener("click", () => {
    if (currentIndex < items.length - 10) {
        currentIndex += 10;
        showItem(currentIndex);
    } else {
        currentIndex = items.length - 1;
        showItem(currentIndex);
    }
});

document.getElementById("prev-btn").addEventListener("click", () => {
    if (currentIndex > 0) {
        currentIndex--;
        showItem(currentIndex);
    }
});

document.getElementById("prevten-btn").addEventListener("click", () => {
    if (currentIndex > 9) {
        currentIndex -= 10;
        showItem(currentIndex);
    } else {
        currentIndex = 0;
        showItem(currentIndex);
    }
});

document.getElementById("score-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const score = parseFloat(document.getElementById("score").value);
    if (score < 1 || score > 10) {
        alert("Anna pisteet 1 ja 10 väliltä");
        return;
    }

    const item = items[currentIndex];
    const itemID = item.ID;

    try {
        const response = await fetch(`${apiUrl}/${itemID}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ score: score })
        });

        if (response.ok) {
            const result = await response.json();
            alert(`Pisteytetty!`);

            item.Points = result.newPoints;
            item.Votes = parseFloat(item.Votes) + 1;
            item.Average = (item.Points / (parseFloat(item.Votes))).toFixed(2);

            document.getElementById("score").value = "";

            showItem(currentIndex);
            updateScoreboard();
        } else {
            alert("Virhe havaittu pisteyttäessä...");
        }
    } catch (error) {
        alert("Virhe havaittu pisteyttäessä...");
        console.error('Error:', error);
    }

    
});

// Initialize the app
fetchItems();
