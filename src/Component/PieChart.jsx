/* eslint-disable react/prop-types */
import ReactECharts from "echarts-for-react";
import { useEffect, useState } from "react";

const PieChart = ({ data = [], chartMode = true }) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        let A = [];
        if (chartMode) {
            const mergedData = data.reduce((acc, item) => {
                const existingItem = acc.find((el) => el.type === item.type);
                if (existingItem) {
                    existingItem.amount += item.amount;
                } else {
                    acc.push({ type: item.type, amount: item.amount });
                }
                return acc;
            }, []);

            A = mergedData.map((item) => ({
                value: item.amount,
                name: item.type,
                itemStyle: {
                    color: item.type === "income" ? "#008028" : "#ff5a5b",
                },
            }));
        } else {
            A = data.map((item) => ({
                value: item.amount,
                name: item.category.name,
            }));
        }

        setChartData(A);
    }, [data, chartMode]);

    const chartOption = {
        tooltip: {
            trigger: "item",
        },
        series: [
            {
                name: chartMode ? "Type" : "Category",
                type: "pie",
                radius: "50%",
                center: ["50%", "50%"],
                data: chartData,
                selectedMode: "single",
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: "rgba(0, 0, 0, 0.5)",
                    },
                },
            },
        ],
    };

    return <ReactECharts option={chartOption} />;
};

export default PieChart;
