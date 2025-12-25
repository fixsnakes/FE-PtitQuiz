import React from 'react';
import ReactApexChart from 'react-apexcharts';

const LineChart = ({ data = [], categories = [], loading = false }) => {
    const series = data;

    const chartOptions = {
        legend: {
            show: true,
            position: 'top',
            horizontalAlign: 'left',
            fontSize: '14px',
            fontFamily: 'inherit',
            markers: {
                width: 12,
                height: 12,
                radius: 3,
            },
            itemMargin: {
                horizontal: 12,
                vertical: 8,
            },
        },
        colors: ['#3B82F6', '#8B5CF6', '#10B981'],
        chart: {
            fontFamily: 'inherit',
            type: 'area',
            height: 310,
            toolbar: {
                show: false,
            },
            zoom: {
                enabled: false,
            },
        },
        fill: {
            type: 'gradient',
            gradient: {
                enabled: true,
                opacityFrom: 0.55,
                opacityTo: 0,
                stops: [0, 90, 100],
            },
        },
        stroke: {
            curve: 'smooth',
            width: [2.5, 2.5, 2.5],
        },
        markers: {
            size: 0,
            strokeWidth: 0,
            hover: {
                size: 5,
            },
        },
        grid: {
            borderColor: '#e2e8f0',
            strokeDashArray: 4,
            xaxis: {
                lines: {
                    show: false,
                },
            },
            yaxis: {
                lines: {
                    show: true,
                },
            },
            padding: {
                top: 0,
                right: 10,
                bottom: 0,
                left: 10,
            },
        },
        dataLabels: {
            enabled: false,
        },
        tooltip: {
            enabled: true,
            shared: true,
            intersect: false,
            theme: 'light',
            x: {
                format: 'dd/MM/yyyy',
            },
            y: {
                formatter: function (val) {
                    return val.toFixed(0);
                },
            },
        },
        xaxis: {
            type: 'category',
            categories: categories,
            labels: {
                style: {
                    colors: '#64748b',
                    fontSize: '12px',
                },
                rotate: -45,
                rotateAlways: false,
            },
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            tooltip: {
                enabled: false,
            },
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#64748b',
                    fontSize: '12px',
                },
                formatter: function (val) {
                    return val.toFixed(0);
                },
            },
            title: {
                style: {
                    fontSize: '0px',
                },
            },
        },
        responsive: [
            {
                breakpoint: 768,
                options: {
                    legend: {
                        position: 'bottom',
                    },
                    xaxis: {
                        labels: {
                            rotate: -45,
                        },
                    },
                },
            },
        ],
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[310px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[310px] text-slate-500">
                <div className="text-center">
                    <p>Không có dữ liệu để hiển thị</p>
                    <p className="text-sm mt-2">Vui lòng thử lại sau</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-full overflow-x-auto">
            <div className="min-w-[600px]">
                <ReactApexChart
                    type="area"
                    height={450}
                    options={chartOptions}
                    series={series}
                />
            </div>
        </div>
    );
};

export default LineChart;
