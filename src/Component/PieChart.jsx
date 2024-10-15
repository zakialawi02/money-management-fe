/* eslint-disable react/prop-types */
import ReactECharts from "echarts-for-react";
import { useEffect, useState } from "react";

const PieChart = ({ data = [] }) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        // const A = data.map((item) => ({
        //     value: item.amount,
        //     name: item.type,
        //     itemStyle: {
        //         color: item.type === "income" ? "#4cb362" : "#b24d4d",
        //     },
        // }));
        // setChartData(A);

        const A = data.map((item) => ({
            value: item.amount,
            name: item.category.name,
            // itemStyle: {
            //     color: item.type === "income" ? "#4cb362" : "#b24d4d",
            // },
        }));
        setChartData(A);
    }, [data]);

    const chartOption = {
        tooltip: {
            trigger: "item",
        },
        series: [
            {
                name: "Type",
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
