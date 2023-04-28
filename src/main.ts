import { SccResult } from "./scc";
import "./style.css";

import * as echarts from "echarts";
import _ from "lodash";

const chartEl = document.getElementById("chart")!;
const myChart = echarts.init(chartEl);

const projectNames = ["kraulie", "typescript"];

interface Project {
  name: string;
  data: XyTupel[];
}

type XyTupel = [number, number];

async function start() {
  const projects: Project[] = [];

  for (const projectName of projectNames) {
    const sccResult: SccResult = await fetch("/data/" + projectName + ".json")
      .then((r) => r.json());
    console.log(`Loaded project ${projectName}`, sccResult);
    const allFiles = sccResult.flatMap((filesByType) => filesByType.Files);
    const allFilesGroupedByMetric = _.groupBy(allFiles, (file) => file.Lines);
    const metricValues = _(allFiles.map((file) => file.Lines)).uniq().sortBy(
      _.identity,
    ).value();
    console.log(`metricValues ${projectName}`, metricValues);

    const project: Project = {
      name: projectName,
      data: new Array<XyTupel>(metricValues.length),
    };

    let sum = 0;
    for (let i = metricValues.length - 1; i >= 0; i--) {
      const metricValue = metricValues[i];
      const files = allFilesGroupedByMetric[metricValue];
      sum += files.length;
      project.data[i] = [metricValue, sum];
    }

    console.log(`Project ${projectName}:`, project);

    projects.push(project);
  }

  myChart.setOption({
    title: {
      text: "Files with at least X lines ",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {},
    grid: {
      left: "30px",
      right: "30px",
      bottom: "30px",
      containLabel: true,
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    xAxis: {
      type: "log",
      name: "Lines",
      nameLocation: "middle",
      nameTextStyle: {
        padding: 10,
        fontSize: 14,
        fontWeight: "bold",
      },
    },
    yAxis: [{
      name: "File Count",
      nameLocation: "middle",
      nameTextStyle: {
        padding: 10,
        fontSize: 14,
        fontWeight: "bold",
      },
    }, {
      name: "File Count 2",
      nameLocation: "middle",
      nameTextStyle: {
        padding: 20,
        fontSize: 14,
        fontWeight: "bold",
      },
    }],
    series: projects.map((project, i) => ({
      name: project.name,
      data: project.data,
      type: "line",
      connectNulls: true,
      smooth: true,
      yAxisIndex: i
    })),
  });
}

start();
