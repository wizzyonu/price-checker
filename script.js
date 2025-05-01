document.addEventListener('DOMContentLoaded', () => {
    const PRICE_DATA_KEY = 'nigerianPriceTrackerData';
    let priceData = [];
    let currentFilteredData = []; // To hold data after filtering

    const priceForm = document.getElementById('priceForm');
    const productNameInput = document.getElementById('productName');
    const priceInput = document.getElementById('price');
    const marketLocationSelect = document.getElementById('marketLocation');
    const categorySelect = document.getElementById('category');
    const priceTableBody = document.getElementById('priceTableBody');
    const filterCategorySelect = document.getElementById('filterCategory');
    const filterMarketSelect = document.getElementById('filterMarket');
    const productTrendSelect = document.getElementById('productTrendSelect');
    const tableHeaders = document.querySelectorAll('.comparison-table th[data-sort]');

    // Chart instances
    let priceTrendChart;
    let categoryAvgChart;
    let marketAvgChart;

    // Sample Data (including expanded locations and categories)
    const sampleData = [
        { productName: 'Rice (50kg)', price: 55000, marketLocation: 'Lagos', category: 'Food', timestamp: '2023-01-15T10:00:00Z' },
        { productName: 'Rice (50kg)', price: 53000, marketLocation: 'Abuja', category: 'Food', timestamp: '2023-01-20T11:00:00Z' },
        { productName: 'Rice (50kg)', price: 56000, marketLocation: 'Port Harcourt', category: 'Food', timestamp: '2023-01-25T12:00:00Z' },
        { productName: 'Rice (50kg)', price: 54500, marketLocation: 'Ibadan', category: 'Food', timestamp: '2023-02-01T09:00:00Z' },
        { productName: 'Rice (50kg)', price: 53500, marketLocation: 'Kano', category: 'Food', timestamp: '2023-02-05T10:00:00Z' },
        { productName: 'Rice (50kg)', price: 55500, marketLocation: 'Enugu', category: 'Food', timestamp: '2023-02-10T11:00:00Z' },

        { productName: 'Petrol (Litre)', price: 650, marketLocation: 'Lagos', category: 'Fuel', timestamp: '2023-03-01T08:00:00Z' },
        { productName: 'Petrol (Litre)', price: 630, marketLocation: 'Abuja', category: 'Fuel', timestamp: '2023-03-05T09:00:00Z' },
        { productName: 'Petrol (Litre)', price: 660, marketLocation: 'Port Harcourt', category: 'Fuel', timestamp: '2023-03-10T10:00:00Z' },
        { productName: 'Petrol (Litre)', price: 640, marketLocation: 'Ibadan', category: 'Fuel', timestamp: '2023-03-15T11:00:00Z' },
        { productName: 'Petrol (Litre)', price: 620, marketLocation: 'Kano', category: 'Fuel', timestamp: '2023-03-20T12:00:00Z' },
        { productName: 'Petrol (Litre)', price: 655, marketLocation: 'Enugu', category: 'Fuel', timestamp: '2023-03-25T13:00:00Z' },

        { productName: 'Yam (Tuber)', price: 3000, marketLocation: 'Ibadan', category: 'Food', timestamp: '2023-04-01T14:00:00Z' },
        { productName: 'Yam (Tuber)', price: 3200, marketLocation: 'Lagos', category: 'Food', timestamp: '2023-04-05T15:00:00Z' },
        { productName: 'Yam (Tuber)', price: 2800, marketLocation: 'Kano', category: 'Food', timestamp: '2023-04-10T16:00:00Z' },

        { productName: 'Laptop (Mid-range)', price: 450000, marketLocation: 'Lagos', category: 'Electronics', timestamp: '2023-05-01T10:00:00Z' },
        { productName: 'Laptop (Mid-range)', price: 440000, marketLocation: 'Abuja', category: 'Electronics', timestamp: '2023-05-05T11:00:00Z' },

        { productName: 'Liquid Soap (5L)', price: 4500, marketLocation: 'Port Harcourt', category: 'Household', timestamp: '2023-06-01T12:00:00Z' },
        { productName: 'Liquid Soap (5L)', price: 4300, marketLocation: 'Enugu', category: 'Household', timestamp: '2023-06-05T13:00:00Z' },

        { productName: 'T-Shirt (Cotton)', price: 3500, marketLocation: 'Lagos', category: 'Clothing', timestamp: '2023-07-01T14:00:00Z' },
        { productName: 'T-Shirt (Cotton)', price: 3200, marketLocation: 'Kano', category: 'Clothing', timestamp: '2023-07-05T15:00:00Z' },

        { productName: 'Haircut', price: 2000, marketLocation: 'Abuja', category: 'Services', timestamp: '2023-08-01T16:00:00Z' },
        { productName: 'Haircut', price: 1500, marketLocation: 'Ibadan', category: 'Services', timestamp: '2023-08-05T17:00:00Z' },

        { productName: 'Bus Fare (Intra-city)', price: 300, marketLocation: 'Lagos', category: 'Transport', timestamp: '2023-09-01T18:00:00Z' },
        { productName: 'Bus Fare (Intra-city)', price: 200, marketLocation: 'Enugu', category: 'Transport', timestamp: '2023-09-05T19:00:00Z' },
    ];


    // Load data from localStorage or use sample data
    function loadData() {
        const storedData = localStorage.getItem(PRICE_DATA_KEY);
        if (storedData) {
            priceData = JSON.parse(storedData);
        } else {
            priceData = sampleData;
            saveData(); // Save sample data on first load
        }
        currentFilteredData = [...priceData]; // Initialize filtered data
    }

    // Save data to localStorage
    function saveData() {
        localStorage.setItem(PRICE_DATA_KEY, JSON.stringify(priceData));
    }

    // Render the table with provided data
    function renderTable(dataToRender) {
        console.log('renderTable called with data:', dataToRender);
        priceTableBody.innerHTML = ''; // Clear current table body
        console.log('Table body cleared.');

        // Group data by product to find the lowest price for highlighting
        const productGroups = dataToRender.reduce((acc, entry) => {
            if (!acc[entry.productName]) {
                acc[entry.productName] = [];
            }
            acc[entry.productName].push(entry);
            return acc;
        }, {});

        const lowestPrices = {};
        for (const product in productGroups) {
            lowestPrices[product] = Math.min(...productGroups[product].map(item => item.price));
        }

        dataToRender.forEach(entry => {
            console.log('Rendering entry:', entry);
            const row = document.createElement('tr');

            // Add lowest price highlighting class
            if (entry.price === lowestPrices[entry.productName]) {
                row.classList.add('lowest-price');
                console.log('Highlighting lowest price for', entry.productName);
            }

            row.innerHTML = `
                <td>${entry.productName}</td>
                <td>₦${entry.price.toLocaleString()}</td>
                <td>${entry.marketLocation}</td>
                <td>${entry.category}</td>
                <td>${new Date(entry.timestamp).toLocaleString()}</td>
            `;
            priceTableBody.appendChild(row);
            console.log('Row appended for', entry.productName);
        });
        console.log('renderTable finished.');
    }

    // Filter data based on selected category and market
    function filterData() {
        const selectedCategory = filterCategorySelect.value;
        const selectedMarket = filterMarketSelect.value;

        currentFilteredData = priceData.filter(entry => {
            const categoryMatch = selectedCategory === '' || entry.category === selectedCategory;
            const marketMatch = selectedMarket === '' || entry.marketLocation === selectedMarket;
            return categoryMatch && marketMatch;
        });

        renderTable(currentFilteredData);
        updateCharts(currentFilteredData);
        populateProductTrendSelect(currentFilteredData);
    }

    // Sort data
    function sortTable(column, order) {
        currentFilteredData.sort((a, b) => {
            const valueA = a[column];
            const valueB = b[column];

            if (typeof valueA === 'number') {
                return order === 'asc' ? valueA - valueB : valueB - valueA;
            } else {
                const stringA = String(valueA).toLowerCase();
                const stringB = String(valueB).toLowerCase();
                if (stringA < stringB) return order === 'asc' ? -1 : 1;
                if (stringA > stringB) return order === 'asc' ? 1 : -1;
                return 0;
            }
        });
        renderTable(currentFilteredData);
    }

    // Populate product trend select dropdown
    function populateProductTrendSelect(data) {
        const uniqueProducts = [...new Set(data.map(item => item.productName))];
        productTrendSelect.innerHTML = '<option value="">Select a Product</option>'; // Reset options
        uniqueProducts.forEach(product => {
            const option = document.createElement('option');
            option.value = product;
            option.textContent = product;
            productTrendSelect.appendChild(option);
        });
    }

    // Initialize Chart.js charts
    function initializeCharts() {
        console.log('initializeCharts called.');
        const ctxPriceTrend = document.getElementById('priceTrendChart').getContext('2d');
        const ctxCategoryAvg = document.getElementById('categoryAvgChart').getContext('2d');
        const ctxMarketAvg = document.getElementById('marketAvgChart').getContext('2d');
        console.log('Chart contexts obtained.');

        if (!ctxPriceTrend || !ctxCategoryAvg || !ctxMarketAvg) {
            console.error('One or more chart contexts could not be obtained.');
            return; // Stop initialization if contexts are missing
        }

        priceTrendChart = new Chart(ctxPriceTrend, {
            type: 'line',
            data: {
                labels: [], // Dates
                datasets: [{
                    label: 'Price (₦)',
                    data: [], // Prices
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        },
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Price (₦)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Price Trend Over Time'
                    }
                }
            }
        });
        console.log('priceTrendChart initialized:', priceTrendChart);

        categoryAvgChart = new Chart(ctxCategoryAvg, {
            type: 'bar',
            data: {
                labels: [], // Categories
                datasets: [{
                    label: 'Average Price (₦)',
                    data: [], // Average Prices
                    backgroundColor: 'rgba(255, 99, 132, 0.5)'
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Average Price (₦)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Average Price by Category'
                    },
                    legend: {
                        display: false
                    }
                }
            }
        });
        console.log('categoryAvgChart initialized:', categoryAvgChart);

        marketAvgChart = new Chart(ctxMarketAvg, {
            type: 'bar',
            data: {
                labels: [], // Markets
                datasets: [{
                    label: 'Average Price (₦)',
                    data: [], // Average Prices
                    backgroundColor: 'rgba(54, 162, 235, 0.5)'
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Average Price (₦)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Average Price by Market'
                    }
                },
                 legend: {
                        display: false
                    }
            }
        });
        console.log('marketAvgChart initialized:', marketAvgChart);
        console.log('initializeCharts finished.');
    }

    // Update Chart.js charts with provided data
    function updateCharts(dataToRender) {
        console.log('updateCharts called with data:', dataToRender);
        console.log('Chart instances:', { priceTrendChart, categoryAvgChart, marketAvgChart });
        // Update Price Trend Chart (requires product selection)
        const selectedProduct = productTrendSelect.value;
        console.log('Selected product for trend chart:', selectedProduct);
        if (selectedProduct) {
            const productData = dataToRender
                .filter(entry => entry.productName === selectedProduct)
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Sort by date for line chart

            console.log('Product data for trend chart:', productData);
            console.log('Attempting to update priceTrendChart:', priceTrendChart);
            priceTrendChart.data.labels = productData.map(entry => new Date(entry.timestamp));
            priceTrendChart.data.datasets[0].data = productData.map(entry => entry.price);
            priceTrendChart.update();
            console.log('Price trend chart updated.');
        } else {
             // Clear the chart if no product is selected
            priceTrendChart.data.labels = [];
            priceTrendChart.data.datasets[0].data = [];
            priceTrendChart.update();
            console.log('Price trend chart cleared (no product selected).');
        }


        // Update Category Average Chart
        const categoryAverages = dataToRender.reduce((acc, entry) => {
            if (!acc[entry.category]) {
                acc[entry.category] = { sum: 0, count: 0 };
            }
            acc[entry.category].sum += entry.price;
            acc[entry.category].count++;
            return acc;
        }, {});

        const categories = Object.keys(categoryAverages);
        const avgPricesByCategory = categories.map(category =>
            categoryAverages[category].sum / categoryAverages[category].count
        );

        console.log('Category averages:', categoryAverages);
        console.log('Categories for chart:', categories);
        console.log('Average prices by category for chart:', avgPricesByCategory);
        categoryAvgChart.data.labels = categories;
        categoryAvgChart.data.datasets[0].data = avgPricesByCategory;
        categoryAvgChart.update();
        console.log('Category average chart updated.');

        // Update Market Average Chart
        const marketAverages = dataToRender.reduce((acc, entry) => {
            if (!acc[entry.marketLocation]) {
                acc[entry.marketLocation] = { sum: 0, count: 0 };
            }
            acc[entry.marketLocation].sum += entry.price;
            acc[entry.marketLocation].count++;
            return acc;
        }, {});

        const markets = Object.keys(marketAverages);
        const avgPricesByMarket = markets.map(market =>
            marketAverages[market].sum / marketAverages[market].count
        );

        console.log('Market averages:', marketAverages);
        console.log('Markets for chart:', markets);
        console.log('Average prices by market for chart:', avgPricesByMarket);
        marketAvgChart.data.labels = markets;
        marketAvgChart.data.datasets[0].data = avgPricesByMarket;
        marketAvgChart.update();
        console.log('Market average chart updated.');
    }

    // Event Listeners

    // Form submission
    priceForm.addEventListener('submit', (event) => {
        event.preventDefault();
        console.log('Form submitted');

        const productName = productNameInput.value.trim();
        const price = parseFloat(priceInput.value);
        const marketLocation = marketLocationSelect.value;
        const category = categorySelect.value;

        console.log('Input values:', { productName, price, marketLocation, category });

        // Basic validation
        if (!productName || isNaN(price) || price <= 0 || !marketLocation || !category) {
            console.log('Validation failed');
            alert('Please fill in all required fields with valid data.');
            return;
        }
        console.log('Validation passed');

        const newEntry = {
            productName,
            price,
            marketLocation,
            category,
            timestamp: new Date().toISOString()
        };

        priceData.push(newEntry);
        console.log('New entry added:', newEntry);
        console.log('Current priceData:', priceData);
        saveData();
        console.log('Data saved to localStorage');
        filterData(); // Re-filter and update table/charts with new data
        console.log('filterData called');

        // Clear form
        priceForm.reset();
        console.log('Form reset.');
    });

    // Filter changes
    filterCategorySelect.addEventListener('change', filterData);
    filterMarketSelect.addEventListener('change', filterData);
    productTrendSelect.addEventListener('change', () => updateCharts(currentFilteredData));


    // Table header sorting
    tableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const sortColumn = header.getAttribute('data-sort');
            const currentOrder = header.getAttribute('data-order') || 'asc';
            const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';

            // Remove order attribute from other headers
            tableHeaders.forEach(h => h.removeAttribute('data-order'));

            // Set new order attribute
            header.setAttribute('data-order', newOrder);

            sortTable(sortColumn, newOrder);
        });
    });


    // Initial load
    loadData();
    populateProductTrendSelect(currentFilteredData);
    renderTable(currentFilteredData);
    initializeCharts();
    console.log('Charts initialized. Chart instances:', { priceTrendChart, categoryAvgChart, marketAvgChart });
    updateCharts(currentFilteredData); // Initial chart update with loaded data
});