import _ from "lodash";
import { SccFile } from "./scc";
import { Project } from "./types";

const metricNameTableHeader = document.getElementById(
  "metricNameTableHeader",
) as HTMLElement;
const fileTableBody = document.getElementById("fileTableBody") as HTMLElement;

interface RowVm {
  file: SccFile;
  metricValue: number;
  project: Project;
}

export function renderTable(
  projects: Project[],
  selectedMetric: keyof SccFile,
  minMetricValue: number,
) {
  metricNameTableHeader.innerText = selectedMetric;

  const rows: RowVm[] = projects.flatMap((project) =>
    project.sccResult.flatMap((filesByType) =>
      filesByType.Files.map((file) => ({
        file: file,
        metricValue: file[selectedMetric] as number,
        project: project,
      }))
    )
  ).filter((file) => file.metricValue >= minMetricValue);

  const sortedRows = _.orderBy(rows, (row) => row.metricValue, "desc");

  console.log("allFiles", rows);

  fileTableBody.innerHTML = sortedRows.map((file) => {
    const marker =
      `<span class="serie-marker" style="background-color: ${file.project.color}"></span>`;
    return `<tr><th>${marker} ${file.file.Filename}</th><td>${file.metricValue}</td></tr>`;
  }).join("");
}
