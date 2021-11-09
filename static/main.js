window.onload = init;
const GROUPCLIENT = "group"
let charts = [];

function init() {
    //create the main chart
    createGroupChart();
    window.setInterval(() => {
        tick();
    }, 1000)
// start button  add eventlister
}


function getClientValAverage(recValues) {
    cliVals = [];
    for (const val of recValues) {
        cliVals.push(parseInt(val.value));
    }
    ave = getMeanScore(cliVals);
    return ave;
}


function getMeanScore(scores) {
    return Math.round(scores.reduce((a,b) => a + b, 0) / scores.length);
}


async function tick() {
    const groupChart = charts.find(x => x.client === GROUPCLIENT);
    // get the data from the API
    let recVals = await getRecentValues();
    // console.log(recVals.values);
    recVals = recVals.values;
    
    // if there is any data
    if (recVals.length > 0 && recVals[0].client != null) {
    //     for each client id
        for (const val of recVals) {
            let match = charts.find(x => x.client === val.client);
            if (match) {
                match.update(val.value);
            } else {
                createChart(document.querySelector("#individual_report_container"), val.client);
            }
        }
        for (const chart of charts) {
            let match = recVals.find(x => x.client === chart.client);
            if (!match && chart.client != GROUPCLIENT) {
                chart.remove();
            }
        }
        let value = getClientValAverage(recVals);
        groupChart.update(value);
    } else if (recVals[0].client === null && charts.length > 1) {
        for (const chart of charts) {
            if (chart.client != GROUPCLIENT) {
                chart.remove();
            }
        }
    } else {
        groupChart.update(recVals[0].value);
    }
    console.log(charts);
}


function createGroupChart() {
    let container = document.querySelector("#chartContainer");
    let chart = new Chart(GROUPCLIENT, container, GROUPCLIENT, GROUPCLIENT);
    chart.render();
    charts.push(chart);
}


function createChart(parentContainer, client) {
    let chartElement = document.createElement('div');
    chartElement.classList = ["graphs"];
    chartElement.id = `individual_chart_${client}`;

    let chartContElement = document.createElement('div');
    chartContElement.classList = ["col-xs-6", "col-sm-3", "placeholder", "python_graphs"];
    chartContElement.id = `individual_chart_cont_${client}`;

    chartContElement.appendChild(chartElement)
    parentContainer.appendChild(chartContElement);


    let chart = new Chart(client, chartElement, charts.length, `Student ${charts.length}`);
    chart.render();
    charts.push(chart);
    console.log(`chart id ${chart.client} created at ${chart.element}`);
}



class Chart {
    //need to solve data in options
    constructor(client, element, id, title) {
        this.id = id;;
        this.client = client;
        this.element = element;
        this.chart = null;
        this.data = []
        this.xCount = 1
        this.options = {
            series: [{
                name: 'data',
                data: [{'x': this.xCount, 'y':50}]
            }],
            chart: {
                id: 'realtime',
                height: 350,
                type: 'line',
                animations: {
                    enabled: true,
                    easing: 'linear',
                    dynamicAnimation: {
                        speed: 1000
                    }
                },
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth'
            },
            title: {
                text: title,
                align: 'left'
            },
            markers: {
                size: 0
            },
            xaxis: {
                type: 'numeric',
                range: 10,
            },
            yaxis: {
                max: 100,
                min: 0
            },
            legend: {
                show: false
            },
        }
    }

    render() {
        this.chart = new ApexCharts(
            this.element,
            this.options
        );
        this.chart.render();
    }

    update(val) {
        //create the new data object
        let data = {
            "x": this.xCount,
            "y": val
        }
        this.data.push(data);
        this.chart.updateSeries([{
            data: this.data
        }])
        this.xCount++
    }

    remove() {
        this.chart.destroy();
        this.element.remove();
        let index = charts.findIndex(x => x.client === this.client);
        charts.splice(index, 1);
        console.log(`chart id ${this.client} removed`);
    }
}


async function getRecentValues() {
    const url = "http://127.0.0.1:5000/recentval"
    let result = await get(url);
    return result
}
  

function get(url, params = null) {
    return new Promise((resolve, reject) => {
        const target = new URL(url);

        if (params != null) {
        target.search = formatParams(params);
        }

        const xhr = new XMLHttpRequest();
        xhr.responseType = "json";

        xhr.onload = () => {
        resolve(xhr.response);
        };

        xhr.open("GET", target.toString(), true);
        xhr.send();
    });
}




$("#flexSwitchCheckDefault").change(function() {
    if (this.checked) {
        $("#individual_report_container").toggleClass("opacity1");
    } else {
        $("#individual_report_container").toggleClass("opacity1");
    }
});