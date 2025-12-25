import React from "react";

const BarChart = ({
    data = [],
    categories = [],
    color = "#465fff",
    title = "Bar Chart",
    height = 240,
    showTrend = false,
    trendColor = "#ef4444",
    }) => {
    const Y_AXIS_STEPS = 5;
    const CHART_HEIGHT = height - 40;
    const BAR_WIDTH = 'min(36px, 90%)';
    const BAR_MIN_HEIGHT = '4px';

    const numericData = data.map(val => Number(val) || 0);
    const maxValue = Math.max(...numericData, 0);

    const calculateRoundedMax = (value) => {
        if (value === 0) return 0;
        const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
        return Math.ceil(value / magnitude) * magnitude;
    };

    const roundedMax = calculateRoundedMax(maxValue);

    const generateYAxisValues = () => {
        const values = [];
        for (let i = 0; i < Y_AXIS_STEPS; i++) {
            values.push(roundedMax - (roundedMax / (Y_AXIS_STEPS - 1)) * i);
        }
        return values;
    };

    const formatValue = (value) => {
        if (value >= 1000000) {
            const formatted = value / 1000000;
            return formatted % 1 === 0 ? `${formatted}M` : `${formatted.toFixed(1)}M`;
        }
        if (value >= 1000) {
            const formatted = value / 1000;
            return formatted % 1 === 0 ? `${formatted}K` : `${formatted.toFixed(1)}K`;
        }
        return Math.round(value).toString();
    };

    const yAxisValues = generateYAxisValues();

    // Calculate trend line points for segmented visualization
    const calculateTrendPoints = () => {
        if (!showTrend || numericData.length < 2) return [];
        
        const points = [];
        const barSpacing = 100 / numericData.length; // percentage width per bar
        
        numericData.forEach((value, index) => {
            const percentage = roundedMax > 0 ? (value / roundedMax) * 100 : 0;
            const x = (index + 0.5) * barSpacing; // center of each bar
            const y = 100 - percentage; // invert for SVG coordinates
            
            points.push({ x, y, value });
        });
        
        return points;
    };

    const trendPoints = calculateTrendPoints();

    return (
        <div className="w-full bg-white rounded-lg p-4">
            <h3 className="text-base font-semibold text-slate-900 mb-6">{title}</h3>

            <div className="relative" style={{ height: `${height}px` }}>
                <div className="absolute left-0 top-0 w-12" style={{ height: `${CHART_HEIGHT}px` }}>
                    {yAxisValues.map((value, i) => (
                        <div 
                            key={i} 
                            className="absolute right-2 text-xs text-slate-500"
                            style={{ 
                                top: `${(i / (Y_AXIS_STEPS - 1)) * 100}%`,
                                transform: 'translateY(-50%)'
                            }}
                        >
                            {formatValue(value)}
                        </div>
                    ))}
                </div>

                <div className="absolute left-12 right-0 top-0" style={{ height: `${CHART_HEIGHT}px` }}>
                    {yAxisValues.map((_, i) => (
                        <div 
                            key={i} 
                            className="absolute left-0 right-0 h-px bg-slate-200"
                            style={{ top: `${(i / (Y_AXIS_STEPS - 1)) * 100}%` }}
                        />
                    ))}
                </div>

                <div 
                    className="absolute left-12 right-0 top-0 flex items-end gap-2" 
                    style={{ height: `${CHART_HEIGHT}px` }}
                >
                    {numericData.map((value, i) => {
                        const percentage = roundedMax > 0 ? (value / roundedMax) * 100 : 0;

                        return (
                            <div key={i} className="flex-1 relative group flex justify-center" style={{ height: '100%' }}>
                                <div
                                    className="absolute bottom-0 rounded-t transition-all hover:opacity-80 cursor-pointer"
                                    style={{
                                        height: `${percentage}%`,
                                        backgroundColor: color,
                                        minHeight: value > 0 ? BAR_MIN_HEIGHT : '0',
                                        width: BAR_WIDTH
                                    }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                        {value.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Trend Line Overlay - Segmented lines with dots */}
                {showTrend && trendPoints.length > 0 && (
                    <>
                        {/* SVG for lines only */}
                        <svg
                            className="absolute left-12 right-0 top-0 pointer-events-none"
                            style={{ height: `${CHART_HEIGHT}px`, width: 'calc(100% - 48px)' }}
                            preserveAspectRatio="none"
                            viewBox="0 0 100 100"
                        >
                            {/* Draw segmented lines between adjacent bars */}
                            {trendPoints.map((point, i) => {
                                if (i === trendPoints.length - 1) return null;
                                const nextPoint = trendPoints[i + 1];
                                
                                return (
                                    <line
                                        key={`line-${i}`}
                                        x1={point.x}
                                        y1={point.y}
                                        x2={nextPoint.x}
                                        y2={nextPoint.y}
                                        stroke={trendColor}
                                        strokeWidth="0.8"
                                        strokeLinecap="round"
                                    />
                                );
                            })}
                        </svg>
                        
                        {/* Perfect circular dots with absolute positioning */}
                        <div className="absolute left-12 right-0 top-0 pointer-events-none" style={{ height: `${CHART_HEIGHT}px` }}>
                            {trendPoints.map((point, i) => (
                                <div
                                    key={`dot-${i}`}
                                    className="absolute rounded-full"
                                    style={{
                                        left: `${point.x}%`,
                                        top: `${point.y}%`,
                                        width: '6px',
                                        height: '6px',
                                        backgroundColor: trendColor,
                                        border: '1.5px solid white',
                                        transform: 'translate(-50%, -50%)',
                                        boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
                                    }}
                                />
                            ))}
                        </div>
                    </>
                )}

                <div 
                    className="absolute left-12 right-0 flex gap-2" 
                    style={{ top: `${CHART_HEIGHT + 8}px` }}
                >
                    {categories.map((cat, i) => (
                        <div key={i} className="flex-1 text-center">
                            <span className="text-xs text-slate-600">{cat}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BarChart;