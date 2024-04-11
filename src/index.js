// Wait for the DOMContentLoaded event before executing the script
document.addEventListener("DOMContentLoaded", function() {
    // Get references to HTML elements
    const populationDataContainer = document.getElementById("population-data"); // Container for population data
    const searchBox = document.getElementById("search-box"); // Input box for search
    const searchButton = document.getElementById("search-button"); // Button to trigger search
    const viewBarGraphButton = document.getElementById("view-bar-graph-button"); // Button to view bar graph

    // Define the API endpoint URL
    const apiUrl = "https://datausa.io/api/data?drilldowns=Nation&measures=Population";

    // Function to fetch data from the API
    async function fetchData() {
        try {
            // Fetch data from the API
            const response = await fetch(apiUrl);

            // Check if the response is successful
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            // Parse the JSON response
            const data = await response.json();
            return data;
        } catch (error) {
            // Handle errors in fetching data
            console.error("Error fetching data:", error);
            return null;
        }
    }

    // Function to display the bar graph
    function displayBarGraph(years, populations, highlightedYear) {
        // Create canvas element for the chart
        const ctx = document.createElement("canvas");
        ctx.width = 800; // Set canvas width
        ctx.height = 400; // Set canvas height
        populationDataContainer.appendChild(ctx); // Append canvas to container

        // Create a new Chart instance
        new Chart(ctx, {
            type: 'bar', // Specify the type of chart as bar
            data: {
                labels: years, // X-axis labels
                datasets: [{
                    label: 'Population', // Label for dataset
                    data: populations, // Population data
                    backgroundColor: years.map(year => (year === highlightedYear ? 'rgba(255, 99, 132, 0.5)' : 'rgba(54, 162, 235, 0.2)')), // Background color for bars
                    borderColor: years.map(year => (year === highlightedYear ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)')), // Border color for bars
                    borderWidth: 1 // Border width for bars
                }]
            },
            options: {
                layout: {
                    padding: {
                        left: 10, // Padding left
                        right: 10, // Padding right
                        top: 20, // Padding top
                        bottom: 10 // Padding bottom
                    }
                },
                scales: {
                    xAxes: [{
                        barThickness: 40, // Bar width
                        categoryPercentage: 0.8, // Padding between bars
                        barPercentage: 0.9, // Padding between bars
                        ticks: {
                            autoSkip: false // Disable label auto-skipping
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true // Start y-axis from zero
                        }
                    }]
                }
            }
        });

        // Hide the view bar graph button
        viewBarGraphButton.style.display = "none";
    }

    // Call the fetchData function to initiate the API request
    fetchData().then(data => {
        // Flag to track whether data is being displayed
        let isDataDisplayed = false;

        // Flag to track whether a search is in progress
        let isSearching = false;

        // Event listener for search button
        searchButton.addEventListener("click", async function() {
            // If search is already in progress, ignore subsequent clicks
            if (isSearching) return;

            // Set the search flag to true
            isSearching = true;

            // Get the year entered by the user
            const year = searchBox.value.trim();

            // Check if the entered year is valid
            if (year && /^\d{4}$/.test(year)) {
                const populationData = data.data.find(item => item.Year == year);
                if (populationData) {
                    // Clear previous data if it's being displayed
                    if (isDataDisplayed) {
                        populationDataContainer.innerHTML = "";
                    }

                    // Add a heading for population data
                    const heading = document.createElement("h2");
                    heading.textContent = "US POPULATION DATA RANGING 2013-2021";
                    populationDataContainer.appendChild(heading);

                    // Append details with a delay
                    const details = [
                        `ID Nation: ${populationData["ID Nation"]}`,
                        `Nation: ${populationData.Nation}`,
                        `ID Year: ${populationData["ID Year"]}`,
                        `Population: ${populationData.Population}`,
                        `Slug Nation: ${populationData["Slug Nation"]}`
                    ];

                    for (let i = 0; i < details.length; i++) {
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay of 1000 milliseconds
                        populationDataContainer.innerHTML += `<p>${details[i]}</p>`;
                    }

                    // Show the view bar graph button
                    viewBarGraphButton.style.display = "block";

                    // Set the flag to true since data is being displayed
                    isDataDisplayed = true;
                } else {
                    // Display message if data for the entered year is not found
                    populationDataContainer.innerHTML = "<p>No data found for the entered year</p>";

                    // Hide the view bar graph button
                    viewBarGraphButton.style.display = "none";
                }
            } else {
                // Display message if the entered year is invalid
                populationDataContainer.innerHTML = "<p>Please enter a valid year</p>";

                // Hide the view bar graph button
                viewBarGraphButton.style.display = "none";
            }

            // Reset the search flag after processing the click
            isSearching = false;
        });

        // Event listener for view bar graph button
        viewBarGraphButton.addEventListener("click", function() {
            // Collect all years and corresponding populations
            const years = data.data.map(item => item.Year);
            const populations = data.data.map(item => item.Population);

            // Get the year entered by the user
            const year = searchBox.value.trim();

            // If the year is valid, display the bar graph
            if (year && /^\d{4}$/.test(year)) {
                displayBarGraph(years, populations, year);
            } else {
                // Display message if the entered year is invalid
                alert("Please enter a valid year before viewing the bar graph.");
            }
        });

        // Event listener for search box for input change
        searchBox.addEventListener("input", function() {
            // Clear the displayed data and hide the view bar graph button
            populationDataContainer.innerHTML = "";
            viewBarGraphButton.style.display = "none";

            // Set the flag to false since data is no longer being displayed
            isDataDisplayed = false;
        });
    });
});
