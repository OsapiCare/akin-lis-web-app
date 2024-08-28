"use client";
import React, { useState, useEffect } from "react";
import { Chart } from "primereact/chart";

export const dynamic = "force-dynamic";

export default function VerticalBarChart() {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue("--gray-100");
    const textColorSecondary = documentStyle.getPropertyValue("--gray-100");
    const surfaceBorder = documentStyle.getPropertyValue("--surface-border");
    const data = {
      labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
      datasets: [
        {
          label: "Pedidos de Exames",
          // labelColor: documentStyle.getPropertyValue("--gray-100"),
          color: documentStyle.getPropertyValue("--gray-100"),
          backgroundColor: documentStyle.getPropertyValue("--red-700"),
          borderColor: documentStyle.getPropertyValue("--red-500"),
          data: [65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56],
        },
        {
          label: "Exames Concluídos",
          backgroundColor: documentStyle.getPropertyValue("--green-700"),
          borderColor: documentStyle.getPropertyValue("--green-500"),
          data: [28, 48, 40, 19, 86, 27, 90, 65, 59, 80, 81, 56],
        },
      ],
    };
    const options = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            fontColor: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500,
            },
          },
          grid: {
            display: false,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };

    setChartData(data);
    setChartOptions(options);
  }, []);

  return (
    <div className="card">
      <Chart type="bar" data={chartData} options={chartOptions} />
    </div>
  );
}
