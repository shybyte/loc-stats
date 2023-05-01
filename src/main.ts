import { SccFile, SccResult } from "./scc";
import "./style.css";

import * as echarts from "echarts";
import "echarts/lib/component/brush";
import _ from "lodash";
import { COLORS, Project, XyTupel } from "./types";
import { renderTable } from "./table";

const projects: Project[] = [];
const chartEl = document.getElementById("chart")!;
const myChart = echarts.init(chartEl);

// myChart.on('select', function(params) {
//   console.log('Selected item:', params);
// });

myChart.on("click", function (params: any) {
  console.log("Click", params);

  // const xValue = params.event.offsetX;
  // const xAxis = myChart.getModel().getComponent('xAxis');
  // const xIndex = xAxis.getAxis().findIndex(x => x <= xValue);

  // myChart.dispatchAction({
  //   type: 'legendSelect',
  //   name: myChart.getOption().legend.data[xIndex],
  // });
});

var zr = myChart.getZr();
zr.on('click', function (params) {
  var pointInPixel = [params.offsetX, params.offsetY];
  var pointInGrid = myChart.convertFromPixel('grid', pointInPixel);
  if (myChart.containPixel('grid', pointInPixel)) {
   console.log('pointInGrid',pointInGrid);
   renderTable(projects, metricSelector.value as (keyof SccFile), pointInGrid[0]);
  }
});

const percentCheckbox = document.getElementById(
  "percentCheckbox",
) as HTMLInputElement;
percentCheckbox.addEventListener("change", () => {
  renderChart();
});

const logScaleCheckbox = document.getElementById(
  "logScaleCheckbox",
) as HTMLInputElement;
logScaleCheckbox.addEventListener("change", () => {
  renderChart();
});

const metricSelector = document.getElementById(
  "metricSelector",
) as HTMLInputElement;
metricSelector.addEventListener("change", () => {
  renderChart();
});


const projectNames = ["kraulie", "typescript"];
// const projectNames = ["typescript"];
// const projectNames = ["kraulie"];



async function loadProjects() {
  let i = 0;

  for (const projectName of projectNames) {
    const sccResult: SccResult = await fetch("/data/" + projectName + ".json")
      .then((r) => r.json());
    console.log(`Loaded project ${projectName}`, sccResult);

    const project: Project = {
      name: projectName,
      sccResult,
      data: [],
      color: COLORS[i]
    };

    projects.push(project);

    i += 1;
  }
}

function renderChart() {
  const selectedMetric = metricSelector.value as (keyof SccFile);
  const isInPercent = percentCheckbox.checked;

  renderTable(projects, selectedMetric, 0);

  for (const project of projects) {
    const allFiles = project.sccResult.flatMap((filesByType) =>
      filesByType.Files
    );
    const allFilesGroupedByMetric = _.groupBy(
      allFiles,
      (file) => file[selectedMetric],
    );
    const metricValues = _(
      allFiles.map((file) => file[selectedMetric] as number),
    ).uniq().sortBy(
      _.identity,
    ).value();
    console.log(`metricValues ${project.name}`, metricValues);

    project.data = new Array<XyTupel>(metricValues.length);

    let sum = 0;
    for (let i = metricValues.length - 1; i >= 0; i--) {
      const metricValue = metricValues[i];
      const files = allFilesGroupedByMetric[metricValue];
      sum += files.length;
      project.data[i] = [metricValue > 0 ? metricValue : 0.1, sum];
    }

    if (isInPercent) {
      for (const dataPoint of project.data) {
        dataPoint[1] = dataPoint[1] / sum * 100;
      }
    }

    console.log(`Project ${project.name}:`, project);
  }

  const tooltipFormatter = (
    params: Array<Parameters<echarts.LabelFormatterCallback>[0]>,
  ) => {
    const x = (params[0].value as XyTupel)[0];
    const colors = myChart.getOption().color as string[];
    // console.log("Params", params, x, colors);

    const projectsHtml = projects.map((project, projectIndex) => {
      const valueTupel = project.data.find((xyTupel) => xyTupel[0] >= x);
      const value = valueTupel?.[1] ?? 0;
      const valueFormatted = isInPercent
        ? value.toFixed(2) + "%"
        : Math.round(value);
      const marker = `<span class="serie-marker" style="background-color: ${
        colors[projectIndex]
      }"></span>`;
      return `<div class="project-row"><span>${marker}${project.name}:</span> <span>${valueFormatted}</span></div>`;
    }).join("\n");

    // var result = params[0].name + '<br/>';
    // params.forEach((item: any) => {
    //   result += item.seriesName + ': ' + item.value.toFixed(2) + '<br/>';
    // });
    return '<div class="my-tooltip">' +
      `<div class="tooltip-title">${selectedMetric} >= ${x}</div>` +
      projectsHtml +
      "</div>";
  };

  myChart.setOption({
    color: COLORS,
    title: {
      text: "Files With at Least X " + selectedMetric,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        snap: true,
      },
      formatter: tooltipFormatter,
    },
    legend: {
      // align: "center",
      // right: 30,
    },
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 100,
        throttle: 50,
      },
    ],
    grid: {
      left: "30px",
      right: "30px",
      bottom: "30px",
      containLabel: true,
    },
    toolbox: {
      feature: {
        // saveAsImage: {},
        dataZoom: {
          yAxisIndex: "none",
        },
        // restore: {},
      },
    },
    xAxis: {
      type: logScaleCheckbox.checked ? "log" : "value",
      name: selectedMetric,
      nameLocation: "middle",
      axisLabel: {
        precision: 1,
        formatter: (value: number, _index: number) => {
          return Math.round(value);
        },
      },
      nameTextStyle: {
        padding: 10,
        fontSize: 14,
        fontWeight: "bold",
      },
      triggerEvent: true,
    },
    yAxis: [{
      name: isInPercent ? "Percent of Files" : "File Count",
      nameLocation: "middle",
      nameTextStyle: {
        padding: 20,
        fontSize: 14,
        fontWeight: "bold",
      },
    }],
    series: projects.map((project) => ({
      name: project.name,
      data: project.data,
      type: "line",
      connectNulls: true,
      smooth: true,
    })),
  });
}

async function main() {
  await loadProjects();
  renderChart();
}

main();
