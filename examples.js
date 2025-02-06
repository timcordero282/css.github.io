async function loadSalesData() {
    try {
        const response = await fetch('./sales_data_sample.csv');
        const data = await response.text();
        const rows = data.split('\n').slice(1); // Skip header row
        
        // Process data for charts
        const monthlySales = {};
        const prodcutSales = {};
        const orderStatus = {};
        
        rows.forEach(row => {
            const columns = row.split(',');
            if (columns.length > 2) {
                const sales = parseFloat(columns[2]);
                const qty = parseInt(columns[1]);
                const date = new Date(columns[5]);
                const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
                const product = columns[10];
                const status = columns[6];  
                const orderNum = columns[0];

                // Aggregate sales by month
                monthlySales[monthYear] = (monthlySales[monthYear] || 0) + (sales * qty);

                // Aggregate order status                
                prodcutSales[product] = (prodcutSales[product] || 0) + (sales * qty);
                
                orderStatus[status] = (orderStatus[status] || 0) + 1;
            }
        });
        
        // Create Monthly Sales Chart
        const monthlyLabels = Object.keys(monthlySales)
            .sort((a, b) => {
                // Split year and month and convert to numbers for proper comparison
                const [yearA, monthA] = a.split('-').map(Number);
                const [yearB, monthB] = b.split('-').map(Number);
                
                // Compare years first, then months
                if (yearA !== yearB) {
                    return yearA - yearB;
                }
                return monthA - monthB;
            });
        // Create Mothly Sales Line Chart
        new Chart(
            document.getElementById('monthlySales'),
            {
                type: 'line',
                data: {
                    labels: monthlyLabels.map(date => {
                        // Format the label to be more readable
                        const [year, month] = date.split('-');
                        return `${new Date(year, month - 1).toLocaleString('default', { month: 'short' })} ${year}`;
                    }),
                    datasets: [{
                        label: 'Monthly Sales Trend',
                        data: monthlyLabels.map(month => monthlySales[month]),
                        borderColor: 'rgb(37, 99, 235)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        title: {
                            display: false
                        },
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            }
                        }
                    }
                }
            }
        );

        // Sort products by sales amount in descending order
        const sortedProducts = Object.entries(prodcutSales)
            .sort(([,a], [,b]) => b - a)
            .reduce((obj, [key, value]) => {
                obj[key] = value;
                return obj;
            }, {});

        // Create Product Sales Bar Chart
        const productLabels = Object.keys(sortedProducts);
        const productData = Object.values(sortedProducts);        
        const colors = [
            'rgb(37, 99, 235)',   // blue
            'rgb(239, 68, 68)',   // red
            'rgb(34, 197, 94)',   // green
            'rgb(234, 179, 8)',   // yellow
            'rgb(168, 85, 247)',  // purple
            'rgb(236, 72, 153)',  // pink
            'rgb(128, 128, 128)'  // gray
        ];

        new Chart(
            document.getElementById('salesByProductBar'),
            {
                type: 'bar',
                data: {
                    labels: productLabels,
                    datasets: [{                        
                        data: productData,
                        backgroundColor: [
                            'rgb(37, 99, 235)',   // blue
                            'rgb(239, 68, 68)',   // red
                            'rgb(34, 197, 94)',   // green
                            'rgb(234, 179, 8)',   // yellow
                            'rgb(168, 85, 247)',  // purple
                            'rgb(236, 72, 153)',  // pink
                            'rgb(128, 128, 128)'  // gray
                        ]
                    }]
                },                
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        title: {
                            display: true
                        },
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            }
                        }
                    }
                }
            }
        );

        new Chart( 
            document.getElementById('orderStatusPie'),
            {
                type: 'pie',
                data: {
                    labels: Object.keys(orderStatus),
                    datasets: [{
                        data: Object.values(orderStatus),                     
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(tooltipItem) {
                                    return tooltipItem.label + ': ' + tooltipItem.raw;
                                }
                            }
                        }
                    }
                }
            }
        );
    } catch (error) {
        console.error('Error loading or processing data:', error);
    }
}
var rows = [];
async function loadNhlData() {
    try {
        const response = await fetch('./nhl.csv');
        const data = await response.text();
        rows = data.split('\n').slice(1); // Skip header row
       
        const table = new DataTable('#nhlTable');        
        $( "#dialog" ).dialog({
            autoOpen: false,
        });
        

        rows.forEach(row => {
            const columns = row.split(',');
            if (columns.length > 2) {                
                table.row
                .add([
                    columns[0],
                    columns[1],
                    columns[4],
                    columns[6],
                    columns[7],
                    columns[8],
                    "<td>" + '<button style="float:right" onclick="onClickView('+ columns[0] + ')">View</button>' + "</td>"
                ])
                .draw(false);                                
            }
        });
    }    
    catch (error) {
        console.error('Error loading or processing data:', error);
    }
}

function onClickView(id) {        
    var player = rows.find(function(e) {  
        e = e.split(',');        
        return e[0] == id
    });
    player = player.split(',');
    let playerDialog = document.getElementById("dialog"); 
    playerDialog.innerHTML = "Name: " + player[1] + "<br>Age: " + player[2] + "<br>Team: " + player[3] + "<br>Position: " + player[4];
    $("#dialog").dialog("open");
}


function openTab(evt, tabName) {
    evt.preventDefault();
    
    // Hide all tab content
    const tabContents = document.getElementsByClassName("tab-content");
    for (let content of tabContents) {
        content.classList.remove("active");
    }

    // Remove active class from all tab buttons
    const tabs = document.getElementsByClassName("tab");
    for (let tab of tabs) {
        tab.classList.remove("active");
    }

    // Show the selected tab content and mark button as active
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

// Initialize dashboard and nhl when the page loads
document.addEventListener('DOMContentLoaded', loadSalesData); 
document.addEventListener('DOMContentLoaded', loadNhlData); 