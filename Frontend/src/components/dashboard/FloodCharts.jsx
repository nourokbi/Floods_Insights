import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import {
  formatPopulation,
  formatAxisLabel,
  getYearFieldName,
  AVAILABLE_YEARS,
} from "../../utils/formatters";
import { getBaseChartOptions, getDatasetStyle } from "../../utils/chartHelpers";
import { COLORS } from "../../utils/constants";
import "./FloodCharts.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * FloodCharts Component - Displays trend and top 10 charts
 * TODO: Adapt for flood data instead of population
 */
function FloodCharts({
  dataLayer,
  selectedCountry,
  theme,
  selectedYear,
  worldData,
}) {
  const [trendData, setTrendData] = useState(null);
  const [top10Data, setTop10Data] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingTop10, setLoadingTop10] = useState(false);

  useEffect(() => {
    if (!dataLayer) return;

    let isMounted = true;
    setLoading(true);
    const datasetStyle = getDatasetStyle();

    if (selectedCountry) {
      // Fetch specific country data
      const query = dataLayer.createQuery();
      query.where = `COUNTRY = '${selectedCountry}'`;
      query.outFields = ["*"];

      dataLayer
        .queryFeatures(query)
        .then((results) => {
          if (!isMounted) return;

          if (results.features.length > 0) {
            const attributes = results.features[0].attributes;
            const data = AVAILABLE_YEARS.map(
              (year) => attributes[`F${year}_Population`] || 0
            );

            const hasValidData = data.some((value) => value > 0);

            if (hasValidData) {
              setTrendData({
                labels: AVAILABLE_YEARS,
                datasets: [
                  {
                    label: `${selectedCountry} Data`,
                    data: data,
                    ...datasetStyle,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                  },
                ],
              });
            } else {
              setTrendData(null);
            }
          } else {
            setTrendData(null);
          }
          setLoading(false);
        })
        .catch((error) => {
          if (isMounted) {
            console.error("Error fetching country data:", error);
            setTrendData(null);
            setLoading(false);
          }
        });
    } else if (worldData) {
      const worldDataArray = AVAILABLE_YEARS.map(
        (year) => worldData[String(year)] || 0
      );

      setTrendData({
        labels: AVAILABLE_YEARS,
        datasets: [
          {
            label: "World Data",
            data: worldDataArray,
            ...datasetStyle,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      });
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [dataLayer, selectedCountry, worldData]);

  // Fetch top 10 countries for the selected year
  useEffect(() => {
    if (!dataLayer || !selectedYear) return;

    let isMounted = true;
    setLoadingTop10(true);
    const fieldName = getYearFieldName(selectedYear);
    const query = dataLayer.createQuery();
    query.where = "1=1";
    query.outFields = ["COUNTRY", fieldName];

    dataLayer
      .queryFeatures(query)
      .then((results) => {
        if (!isMounted) return;

        const countriesData = results.features
          .map((feature) => ({
            country: feature.attributes.COUNTRY,
            population: feature.attributes[fieldName] || 0,
          }))
          .filter((item) => item.population > 0)
          .sort((a, b) => b.population - a.population)
          .slice(0, 10);

        const labels = countriesData.map((item) => item.country);
        const data = countriesData.map((item) => item.population);

        const backgroundColors = countriesData.map((_, index) => {
          const opacity = 1 - index * 0.05;
          return `rgba(37, 99, 235, ${opacity})`;
        });

        setTop10Data({
          labels: labels,
          datasets: [
            {
              label: `Data (${selectedYear})`,
              data: data,
              backgroundColor: backgroundColors,
              borderColor: COLORS.primary,
              borderWidth: 2,
              borderRadius: 6,
              hoverBackgroundColor: COLORS.primaryDark,
            },
          ],
        });
        setLoadingTop10(false);
      })
      .catch((error) => {
        if (isMounted) {
          console.error("Error fetching top 10 data:", error);
          setLoadingTop10(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [dataLayer, selectedYear]);

  const options = getBaseChartOptions(theme, {
    plugins: {
      title: {
        display: true,
        text: `Data Trend (1970-2022)`,
        color: theme === "dark" ? COLORS.textLight : COLORS.textDark,
        font: {
          size: 16,
          weight: "bold",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            const value = context.parsed.y;
            label += formatPopulation(value);
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function (value) {
            return formatAxisLabel(value);
          },
        },
      },
    },
  });

  const barOptions = getBaseChartOptions(theme, {
    indexAxis: "y",
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `Top 10 Countries (${selectedYear})`,
        color: theme === "dark" ? COLORS.textLight : COLORS.textDark,
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return formatPopulation(context.parsed.x);
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return formatAxisLabel(value);
          },
        },
      },
      y: {
        ticks: {
          font: {
            size: 11,
          },
        },
        grid: {
          display: false,
        },
      },
    },
  });

  return (
    <div className="charts-section">
      <div className="chart-container">
        <div className="chart-wrapper">
          {loading ? (
            <div className="chart-loading">Loading chart data...</div>
          ) : trendData ? (
            <Line data={trendData} options={options} />
          ) : selectedCountry ? (
            <div className="chart-no-data">
              <p>No data available for {selectedCountry}</p>
            </div>
          ) : (
            <div className="chart-loading">No data available</div>
          )}
        </div>
      </div>
      <div className="chart-container">
        <div className="chart-wrapper">
          {loadingTop10 ? (
            <div className="chart-loading">Loading chart data...</div>
          ) : top10Data ? (
            <Bar data={top10Data} options={barOptions} />
          ) : (
            <div className="chart-loading">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FloodCharts;
