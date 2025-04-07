import { useEffect, useState } from "react";
import { Chart, BarElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";


// Register required Chart.js components
Chart.register(BarElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const STATUS_MAP = {
    "Off Duty": 0,
    "Sleeper Berth": 1,
    "Driving": 2,
    "On Duty (Not Driving)": 3,
};
  
const COLORS = {
    0: "gray",
    1: "purple",
    2: "blue",
    3: "orange",
};

function ELDLogChart() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logsByDate, setLogsByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://127.0.0.1:8000/api/eld_logs_by_date/", {
          method: "GET",
          headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Failed to fetch logs:", response.status, errorText);
          throw new Error(`Failed to fetch logs: ${response.status}`);
        }

        const logsData = await response.json();
        setLogsByDate(logsData);
        
        const logDates = Object.keys(logsData);
        if (logDates.length === 0) {
          console.warn("No ELD logs available.");
          setLoading(false);
          return;
        }

        setSelectedDate(logDates[0]);  // Set the first available date as the default

        setLoading(false);
      } catch (error) {
        console.error("Error fetching logs:", error);
        setLoading(false);
      }
    }

    fetchLogs();
  }, []);

  useEffect(() => {
    if (selectedDate && logsByDate[selectedDate]) {
      const logs = logsByDate[selectedDate];

      let datasets = Object.keys(STATUS_MAP).map((status) => ({
        label: status,
        backgroundColor: COLORS[STATUS_MAP[status]],
        borderColor: COLORS[STATUS_MAP[status]],
        borderWidth: 1,
        data: [],
      }));

      logs.forEach((log) => {
        let startHour = parseInt(log.start_time.split(":")[0]) + parseInt(log.start_time.split(":")[1]) / 60;
        let endHour = parseInt(log.end_time.split(":")[0]) + parseInt(log.end_time.split(":")[1]) / 60;
      
        if (endHour <= startHour) {
            endHour += 24; // Adjust the end hour by adding 24 hours for the next day
        }

        if (endHour <= startHour) {
            console.warn(`Skipping invalid log entry: ${log.start_time} - ${log.end_time}`);
            return;
          }

        const statusIndex = Object.keys(STATUS_MAP).indexOf(log.status);
        if (statusIndex === -1) {
            console.warn(`Invalid status: ${log.status}`);
            return;
        }

        datasets[statusIndex].data.push({
          x: [startHour, endHour],
          y: log.status,
        });
      });

      datasets.forEach((dataset, index) => {
        if (dataset.data.length === 0) {
          dataset.data.push({ x: [0, 0.01], y: Object.keys(STATUS_MAP)[index] });
        }
      });

      setChartData({
        datasets: datasets.map((dataset) => ({
          label: dataset.label,
          backgroundColor: dataset.backgroundColor,
          borderColor: dataset.borderColor,
          borderWidth: dataset.borderWidth,
          data: dataset.data.map((entry) => ({
            x: entry.x,
            y: entry.y,
          })),
        })),
      });

      setDailyTotals(calculateTotals(logs));

    }
  }, [selectedDate, logsByDate]);  // Re-run when date or logs change

  const [dailyTotals, setDailyTotals] = useState({});

  function calculateTotals(logs) {
    const totals = {
      "Off Duty": 0,
      "Sleeper Berth": 0,
      "Driving": 0,
      "On Duty (Not Driving)": 0,
    };
  
    const startOfDay = 0;     // 00:00 in hours
    const endOfDay = 24;      // 24:00 in hours
  
    logs.forEach((log) => {
      let start = parseInt(log.start_time.split(":")[0]) + parseInt(log.start_time.split(":")[1]) / 60;
      let end = parseInt(log.end_time.split(":")[0]) + parseInt(log.end_time.split(":")[1]) / 60;
  
      // Handle logs that cross midnight
      if (end <= start) {
        end += 24;
      }
  
      // Clip to the current day
      const clippedStart = Math.max(start, startOfDay);
      const clippedEnd = Math.min(end, endOfDay);
  
      const duration = clippedEnd - clippedStart;
  
      if (duration > 0 && totals.hasOwnProperty(log.status)) {
        totals[log.status] += duration;
      }
    });
  
    return totals;
  }
  

  const handlePrevDate = () => {
      const logDates = Object.keys(logsByDate).sort(); // Ensure dates are sorted
      if (logDates.length === 0) return; // Prevent errors if logs are empty

      const currentIndex = logDates.indexOf(selectedDate);
      if (currentIndex > 0) {
          setSelectedDate(logDates[currentIndex - 1]);
      }
  };

  const handleNextDate = () => {
      const logDates = Object.keys(logsByDate).sort(); // Ensure dates are sorted
      if (logDates.length === 0) return; // Prevent errors if logs are empty

      const currentIndex = logDates.indexOf(selectedDate);
      if (currentIndex < logDates.length - 1) {
          setSelectedDate(logDates[currentIndex + 1]);
      }
  };

  // Ensure selectedDate is initialized with the first available log date
  useEffect(() => {
      const logDates = Object.keys(logsByDate).sort();
      if (logDates.length > 0 && !selectedDate) {
          setSelectedDate(logDates[0]); // Default to the earliest date
      }
  }, [logsByDate]);

  if (loading) return <p>Loading chart...</p>;
  if (!chartData) return <p>No data available.</p>;

  
  return (
    <div style={{ display: "flex", padding: "16px" }}>
      {/* Main Chart Area */}
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "16px" }}>ELD Logs Chart</h2>
        <div style={{ marginBottom: "16px" }}>
          <button onClick={handlePrevDate} disabled={!selectedDate} className="btn btn-light">Previous</button>
          <span style={{ margin: "0 16px" }}>{selectedDate}</span>
          <button onClick={handleNextDate} disabled={!selectedDate} className="btn btn-light">Next</button>
        </div>

        <div style={{ display: "flex" }}>
          {/* Chart */}
          <div style={{ width: "1200px", height: "700px" }}>
            <Bar
              data={chartData}
              options={{
                maintainAspectRatio: false,
                indexAxis: "y",
                scales: {
                  x: {
                    type: "linear",
                    min: 0,
                    max: 24,
                    ticks: { stepSize: 1, callback: (value) => `${value}:00` },
                    title: { display: true, text: "Time (Hours)" },
                  },
                  y: { title: { display: true, text: "Duty Status" } },
                },
                plugins: { legend: { display: true } },
              }}
            />
          </div>

          {/* Right Sidebar with Aligned Totals */}
          <div style={{
            marginLeft: "40px",
            paddingTop: "55px", // Align vertically with chart bars
            minWidth: "200px",
          }}>
            <div>
              {Object.entries(dailyTotals).map(([status, total]) => (
                <div
                  key={status}
                  style={{
                    height: "140px", // One block per status — must match the bar row height
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px solid #eee",
                    fontSize: "1rem",
                    fontWeight: "500",
                  }}
                >
                  <span style={{ width: "140px" }}>{status}</span>
                  <span>{total.toFixed(2)}h</span>
                </div>
              ))}
              <div style={{
                marginTop: "16px",
                paddingTop: "8px",
                borderTop: "2px solid #bbb",
                fontSize: "1rem",
                fontWeight: "600",
              }}>
                Total: {Object.values(dailyTotals).reduce((a, b) => a + b, 0).toFixed(2)}h
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ELDLogChart;
