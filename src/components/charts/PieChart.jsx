import React from 'react';
import ReactApexChart from 'react-apexcharts';

const PieChart = ({ 
    data = [], 
    labels = [], 
    loading = false, 
    title = "",
    height = 350,
    showLegend = false,
    colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899']
}) => {
    const series = data;

    const chartOptions = {
        chart: {
            type: 'pie',
            fontFamily: 'inherit',
            toolbar: {
                show: false,
            },
        },
        labels: labels,
        colors: colors,
        legend: {
            show: showLegend,
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '13px',
            fontFamily: 'inherit',
            markers: {
                width: 10,
                height: 10,
                radius: 2,
            },
            itemMargin: {
                horizontal: 8,
                vertical: 6,
            },
            formatter: function(seriesName, opts) {
                const value = opts.w.globals.series[opts.seriesIndex];
                const total = opts.w.globals.series.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${seriesName}: ${percentage}%`;
            },
        },
        dataLabels: {
            enabled: !showLegend,
            formatter: function (val) {
                return val.toFixed(1) + '%';
            },
            style: {
                fontSize: '14px',
                fontFamily: 'inherit',
                fontWeight: 600,
                colors: ['#fff']
            },
            dropShadow: {
                enabled: true,
                top: 1,
                left: 1,
                blur: 1,
                opacity: 0.45
            }
        },
        tooltip: {
            enabled: true,
            theme: 'light',
            custom: function({ series, seriesIndex, dataPointIndex, w }) {
                const label = w.config.labels[seriesIndex];
                const value = series[seriesIndex];
                const total = series.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                
                return `<div class="px-3 py-2">
                    <div class="font-semibold text-slate-900">${label}</div>
                    <div class="text-sm text-slate-600 mt-1">${percentage}%</div>
                </div>`;
            },
        },
        plotOptions: {
            pie: {
                expandOnClick: true,
                donut: {
                    size: '0%',
                },
                dataLabels: {
                    offset: 0,
                    minAngleToShowLabel: 10
                },
            },
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['#fff']
        },
        responsive: [
            {
                breakpoint: 768,
                options: {
                    chart: {
                        height: 300,
                    },
                    legend: {
                        position: 'bottom',
                        fontSize: '12px',
                    },
                    dataLabels: {
                        style: {
                            fontSize: '10px',
                        }
                    }
                },
            },
        ],
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!data || data.length === 0 || data.every(val => val === 0)) {
        return (
            <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
                <div className="text-center text-slate-500">
                    <p>Không có dữ liệu để hiển thị</p>
                    <p className="text-sm mt-2">Vui lòng thử lại sau</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-lg p-4">
            {title && (
                <h3 className="text-base font-semibold text-slate-900 mb-4">{title}</h3>
            )}
            <div className="max-w-full">
                <ReactApexChart
                    type="pie"
                    height={height}
                    options={chartOptions}
                    series={series}
                />
            </div>
        </div>
    );
};

export default PieChart;
