document.addEventListener("DOMContentLoaded", function() {
    const populationDataContainer = document.getElementById("population-data");
    const searchBox = document.getElementById("search-box");
    const searchButton = document.getElementById("search-button");
    const viewBarGraphButton = document.getElementById("view-bar-graph-button");
    const apiUrl = "https://datausa.io/api/data?drilldowns=Nation&measures=Population";

    async function fetchData() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching data:", error);
            return null;
        }
    }

    function displayBarGraph(years, populations, highlightedYear) {
        const ctx = document.createElement("canvas");
        ctx.width = 800;
        ctx.height = 400;
        populationDataContainer.appendChild(ctx);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: years,
                datasets: [{
                    label: 'Population',
                    data: populations,
                    backgroundColor: years.map(year => (year === highlightedYear ? 'rgba(255, 99, 132, 0.5)' : 'rgba(54, 162, 235, 0.2)')),
                    borderColor: years.map(year => (year === highlightedYear ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)')),
                    borderWidth: 1
                }]
            },
            options: {
                layout: {
                    padding: {
                        left: 10,
                        right: 10,
                        top: 20,
                        bottom: 10
                    }
                },
                scales: {
                    xAxes: [{
                        barThickness: 40,
                        categoryPercentage: 0.8,
                        barPercentage: 0.9,
                        ticks: {
                            autoSkip: false
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });

        viewBarGraphButton.style.display = "none";
    }

    fetchData().then(data => {
        let isDataDisplayed = false;
        let isSearching = false;

        searchButton.addEventListener("click", async function() {
            if (isSearching) return;
            isSearching = true;

            const year = searchBox.value.trim();

            if (year && /^\d{4}$/.test(year)) {
                const populationData = data.data.find(item => item.Year == year);
                if (populationData) {
                    if (isDataDisplayed) {
                        populationDataContainer.innerHTML = "";
                    }

                    const details = [
                        `ID Nation: ${populationData["ID Nation"]}`,
                        `Nation: ${populationData.Nation}`,
                        `ID Year: ${populationData["ID Year"]}`,
                        `Population: ${populationData.Population}`,
                        `Slug Nation: ${populationData["Slug Nation"]}`
                    ];

                    for (let i = 0; i < details.length; i++) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        populationDataContainer.innerHTML += `<p>${details[i]}</p>`;
                    }

                    viewBarGraphButton.style.display = "block";
                    isDataDisplayed = true;
                } else {
                    populationDataContainer.innerHTML = "<p>No data found for the entered year</p>";
                    viewBarGraphButton.style.display = "none";
                }
            } else {
                populationDataContainer.innerHTML = "<p>Please enter a valid year</p>";
                viewBarGraphButton.style.display = "none";
            }
            
            isSearching = false;
        });

        viewBarGraphButton.addEventListener("click", function() {
            const years = data.data.map(item => item.Year);
            const populations = data.data.map(item => item.Population);
            const year = searchBox.value.trim();

            if (year && /^\d{4}$/.test(year)) {
                displayBarGraph(years, populations, year);
            } else {
                alert("Please enter a valid year before viewing the bar graph.");
            }
        });

        searchBox.addEventListener("input", function() {
            populationDataContainer.innerHTML = "";
            viewBarGraphButton.style.display = "none";
            isDataDisplayed = false;
        });
    });
});
