window.onload = init;


String.prototype.repeat = function( num ) {
    return new Array( num + 1 ).join(this);
}

const GROUPCLIENT = "group"
let charts = [];
let apexCharts = [];
let interval;

const random_sentences = [
    "...thanks for clarification...",
      "...when you design your system you need to know exactly who you are designing for...",
      "...Does everyone understand this point...",
      "...So does everyone understand what AES-128 is...",
      "...How does this kind of thing effect our choice of technique...",
      "...This is a really important area for understanding...",
      "...Does everyone understand what the four different techniques are...",
      "...Any further questions about what we will cover on the exam...",
      "...all these things mentioned in the spec should be considered...",
      "...another friend of yours asked the same question...",
      "...encryption is an important consideration in all software...haha",
      "...we will do our best to put you on the right paths...",
      "...SHA-256 is stronger than SHA-128...",
      "...we would be more than happy to go there to answer your questions...",
      "...Thanks Jim, Can everyone get that version working...",
      "...So no idea what would be the possible system?...",
      "...What else?...",
      "...Does everyone understand what is happening in the project...",
      "...So that is what a HMAC is, and why its so important to security...",
      "...What is it that the IV does, anyone know...."       
  ]

  const random_questions = [
    "Why is ___?",
    "What is exactly ___?",
    "Where could I ___?",
    "When should I ___?",
    "How come is ___?"
  ]

function init() {
    //create the main chart
    createGroupChart();
    interval = window.setInterval(() => {
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
    chartContElement.classList.add("col-xs-6", "col-sm-3", "placeholder", "python_graphs");
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
        this.id = id;
        this.client = client;
        this.htmlId = `#individual_chart_cont_${this.client}`;
        this.element = element;
        this.chart = null;
        this.data = [];
        this.title = title;
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
            tooltip: {
                custom: undefined
            }
        }
    }

    render() {
        this.chart = new ApexCharts(
            this.element,
            this.options
        );
        apexCharts.push(this.chart);
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
        this.warning();
        this.xCount++
    }

    remove() {
        this.chart.destroy();
        this.element.remove();
        let index = charts.findIndex(x => x.client === this.client);
        charts.splice(index, 1);
        console.log(`chart id ${this.client} removed`);
    }

    warning() {
        let min_warning_score = 30
        if (this.data[this.data.length - 1].y < min_warning_score) {
            if (!$(this.htmlId).hasClass("warning")) {
                $(this.htmlId).toggleClass("warning");
            } else {
                if ($(this.htmlId).hasClass("warning")) {
                    $(this.htmlId).toggleClass("warning");
                }
            }
        }
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

function individual_question_panel_generator(num_students) {
    console.log("working");
    let str_question_panels = '<div class="question_panels"></div>';
    let num_question_panels = num_students;
    $str_question_panels = $(str_question_panels.repeat(num_question_panels));

    let id_question_panel_container_name = "individual_question_panel_container";
    let id_question_panel_name = "individual_question_panel";
    for (let i = 1; i < num_question_panels; i++) {
      rand_num = Math.round(Math.random());
      if (rand_num == 0) {
        $(charts[i].htmlId).prepend(str_question_panels);
        $(charts[i].htmlId).find(".question_panels").attr('id', "student" + i);
        $("#student" + i).html('<div class="jumbotron"><div class="container"><div class="card-heading-container"><span><b>Student' + i + '</b></span><i class="fa fa-times" style="cursor: pointer;" aria-hidden="true"></i></div><h3>Question</h3><p>' + random_questions[Math.floor(Math.random()*random_questions.length)] +'</p></div>');
      }
    }
}

$('#individual_report_container').on("click", ".fa.fa-times", function() {
    $(this).parent().parent().parent().parent().css('transition', 'opacity 1s');
    $(this).parent().parent().parent().parent().css('opacity', '0.0');
});



$("#flexSwitchCheckDefault").change(function() {
    if (this.checked) {
        $("#individual_report_container").toggleClass("opacity1");
    } else {
        $("#individual_report_container").toggleClass("opacity1");
    }
});

$('.btn-danger').click(function() {
    clearInterval(interval);

    let num_iterations = apexCharts.length
    for (let i = 0; i < num_iterations; i++) {
        
        let chart = apexCharts[i];
        console.log(chart);
        let data_y = chart.data.twoDSeries;
        let data_x = chart.data.twoDSeriesX;
        let last_x_value = data_x.at(-1);

        let options = {
            series: [{
                name: 'data',
                data: data_y.slice()
            }],
            chart: {
                id: 'line',
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
                text: charts[i].title,
                align: 'left'
            },
            markers: {
                size: 0
            },
            xaxis: {
                type: 'numeric',
                range: last_x_value,
            },
            yaxis: {
                max: 100,
                min: 0
            },
            legend: {
                show: false
            },
            tooltip: {
                custom: function({series, seriesIndex, dataPointIndex, w}) {
                    return '<div class="arrow_box">' + '<span>' + random_sentences[Math.floor(Math.random()*random_sentences.length)] + "</span>" + "</div>";
                }
            },
        };
        
        let newChart;
        if (i == 0) {
            charts[i].chart.destroy();
            newChart = new ApexCharts(document.querySelector("#chartContainer"), options);
        } else {
            charts[i].chart.destroy();
            newChart = new ApexCharts(document.querySelector(charts[i].htmlId), options);
        }
        newChart.render();
    }
    console.log(apexCharts);
    console.log(charts);
    individual_question_panel_generator(num_iterations);

});