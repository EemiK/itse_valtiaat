const apiUrl = "https://backend-itse-valtiaat.onrender.com/api/sheet";
let items = [];
let sort = true;
let currentIndex = 0;

async function fetchItems(keepIndex = false) {
    try {
        const response = await fetch(`${apiUrl}`);
        if (response.ok) {
            const newItems = await response.json();

            if (keepIndex && items.length > 0) {
                const currentID = items[currentIndex]?.ID;
                items = newItems;

                const newIndex = items.findIndex(item => item.ID === currentID);
                currentIndex = newIndex !== -1 ? newIndex: 0;
            } else {
                items = newItems;
                currentIndex = 0;
            }
            
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
    document.getElementById("list-view").style.display = "none";
    document.getElementById("scoreboard").style.display = "block";
    document.getElementById("single-view").style.display = "block";
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

function displayList(listItems) {
    document.getElementById("list-view").style.display = "block";
    document.getElementById("sort-score").style.display = sort ? "" : "none";
    document.getElementById("sort-number").style.display = sort ? "none" : "block";
    document.getElementById("scoreboard").style.display = "none";
    document.getElementById("single-view").style.display = "none";

    const tableBody = document.getElementById("items-table");
    tableBody.innerHTML = "";

    listItems.forEach((item, index) => {
        const score = item.Average == "#DIV/0!" ? "N/A" : item.Average;
        const row = `<tr>
            <td>${item.Number || index + 1}</td>
            <td>${item.Title || "Title not available"}</td>
            <td>${score}</td>
            <td>${item.Votes || "N/A"}</td>
        </tr>`;
        tableBody.innerHTML += row;
    });
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

document.getElementById("toggle-list-view").addEventListener("click", () => {
    if (document.getElementById("list-view").style.display === "none") {
        displayList(items);
    } else {
        showItem(currentIndex);
    }
});

document.getElementById("sort-score").addEventListener("click", () => {
    sort = !sort;
    listItems = [...items].sort((a, b) => {
            const aScore = parseFloat(a.Average.replace(",", "."));
            const bScore = parseFloat(b.Average.replace(",", "."));
            return bScore - aScore;
    });
    
    displayList(listItems);
});

document.getElementById("sort-number").addEventListener("click", () => {
    sort = !sort;
    displayList(items);
});

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

document.getElementById("refresh-btn").addEventListener("click", () => {
    fetchItems(true);
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

            document.getElementById("score").value = "";

            fetchItems(true);
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
