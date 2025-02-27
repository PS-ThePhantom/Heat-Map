document.addEventListener("DOMContentLoaded", () => {
  fetch(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
  )
    .then((res) => res.json())
    .then((data) => {
      displayChart(data);
    })
    .catch((err) => {
      console.log("an error occured: ", err);
    });
});

const displayChart = (data) => {
  const chart = {
    size: {
      width: 1500,
      height: 500
    },
    padding: {
      top: 100,
      left: 100,
      bottom: 60,
      right: 100
    }
  };

  const bars = {
    height: (chart.size.height - chart.padding.bottom - chart.padding.top) / 12,
    width:
      (chart.size.width - chart.padding.left - chart.padding.right) /
      Math.ceil(data.monthlyVariance.length / 12)
  };

  const minYear = d3.min(data.monthlyVariance, (d) => d.year);
  const maxYear = d3.max(data.monthlyVariance, (d) => d.year);

  const xScale = d3
    .scaleLinear()
    .domain([minYear, maxYear + 1])
    .range([chart.padding.left, chart.size.width - chart.padding.right]);

  const yScale = d3
    .scaleBand()
    .domain([12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
    .range([chart.size.height - chart.padding.bottom, chart.padding.top]);

  const svg = d3
    .select("div")
    .append("svg")
    .attr("width", chart.size.width)
    .attr("height", chart.size.height)
    .style("box-shadow", "0 0 10px 5px grey")
    .style("border-radius", "10px");

  svg
    .append("text")
    .attr("id", "title")
    .attr("x", chart.size.width / 2)
    .attr("y", chart.padding.top / 2 - 10)
    .attr("text-anchor", "middle")
    .text("Monthly Global Land-Surface Temperature")
    .style("font-size", "30px")
    .style("font-weight", "bold");

  svg
    .append("text")
    .attr("id", "description")
    .attr("x", chart.size.width / 2)
    .attr("y", chart.padding.top / 2 + 15)
    .attr("text-anchor", "middle")
    .text(
      minYear +
      " - " +
      maxYear +
      ": base temperature " +
      data.baseTemperature +
      "℃"
    )
    .style("font-size", "20px");

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  const yAxis = d3.axisLeft(yScale).tickFormat((d) => months[d - 1]);
  svg
    .append("text")
    .attr("id", "x-axis-decription")
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .text("Year")
    .attr(
      "x",
      chart.padding.left +
      (chart.size.width - chart.padding.left - chart.padding.right) / 2
    )
    .attr("y", chart.size.height - chart.padding.bottom + 40);

  svg
    .append("g")
    .attr("id", "x-axis")
    .attr(
      "transform",
      "translate(0," + (chart.size.height - chart.padding.bottom) + ")"
    )
    .call(xAxis);

  svg
    .append("text")
    .attr("id", "x-axis-decription")
    .attr("text-anchor", "middle")
    .text("Month")
    .style("font-size", "20px")
    .attr("transform", "rotate(-90)")
    .attr(
      "x",
      0 -
      (chart.padding.top +
        (chart.size.height - chart.padding.top - chart.padding.bottom) / 2)
    )
    .attr("y", chart.padding.left - 70);

  svg
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", "translate(" + chart.padding.left + ",0)")
    .call(yAxis);

  const legendColors = [
    "#313695",
    "#4575b4",
    "#74add1",
    "#abd9e9",
    "#e0f3f8",
    "#fee090",
    "#fdae61",
    "#f46d43",
    "#d73027",
    "#a50026"
  ];
  const minTemp =
    Math.floor(
      d3.min(data.monthlyVariance, (d) => data.baseTemperature + d.variance) *
      100
    ) / 100;
  const maxTemp =
    Math.ceil(
      d3.max(data.monthlyVariance, (d) => data.baseTemperature + d.variance) *
      100
    ) / 100;
  const tempRange = maxTemp - minTemp;
  const tempStep = Math.ceil((tempRange / legendColors.length) * 100) / 100;
  const legendRectHeight =
    (chart.size.height - chart.padding.top - chart.padding.bottom) /
    legendColors.length;
  const legendRectWidth = 20;
  const legendRanges = d3.range(minTemp, maxTemp + tempStep, tempStep);

  const tooltipWidth = 120;
  const tooltip = d3
    .select("div")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "rgba(250, 250, 250, 85%)")
    .style("border", "1px solid black")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("width", tooltipWidth + "px")
    .style("text-align", "center")
    .style("box-shadow", "0 0 5px 2px grey");

  svg
    .selectAll("rect")
    .data(data.monthlyVariance)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("data-month", (d) => d.month - 1)
    .attr("data-year", (d) => d.year)
    .attr("data-temp", (d) => data.baseTemperature + d.variance)
    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(d.month))
    .attr("width", bars.width)
    .attr("height", bars.height)
    .attr(
      "fill",
      (d) =>
        legendColors[
        Math.floor((data.baseTemperature + d.variance - minTemp) / tempStep)
        ]
    )
    .on("mouseover", (event, d) => {
      const chartRightEdge = chart.size.width + chart.padding.right * 2;
      const tooltipX =
        event.pageX + tooltipWidth > chartRightEdge
          ? event.pageX - tooltipWidth - 20
          : event.pageX + 20;

      tooltip
        .style("visibility", "visible")
        .attr("data-year", d.year)
        .html(
          `
          ${months[d.month - 1]} ${d.year}<br>
          Temperature: ${Math.round((data.baseTemperature + d.variance) * 10) / 10
          }℃<br>
          Variance: ${Math.round(d.variance * 10) / 10}℃   
        `
        )
        .style("left", tooltipX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
    });

  const legendScale = d3
    .scaleLinear()
    .domain([minTemp, minTemp + legendColors.length * tempStep])
    .range([chart.size.height - chart.padding.bottom, chart.padding.top]);

  const legendAxis = d3
    .axisRight(legendScale)
    .tickValues(legendRanges)
    .tickFormat(d3.format(".2f"));

  svg
    .append("g")
    .attr("id", "legend-axis")
    .attr(
      "transform",
      "translate(" + (chart.size.width - chart.padding.right / 2) + ",0)"
    )
    .call(legendAxis);

  const legend = svg
    .append("g")
    .attr("id", "legend")
    .attr(
      "transform",
      "translate(" + (chart.size.width - chart.padding.right / 2) + ",0)"
    );

  legend
    .selectAll("rect")
    .data(legendColors)
    .enter()
    .append("rect")
    .attr("x", 0 - legendRectWidth)
    .attr("y", (d, i) => legendScale(minTemp + (i + 1) * tempStep))
    .attr("width", legendRectWidth)
    .attr("height", legendRectHeight)
    .attr("fill", (d) => d)
    .attr("stroke", "black");
};