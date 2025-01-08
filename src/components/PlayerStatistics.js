import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';

function PlayerStatistics({ statistics, isLoading }) {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        if (statistics && typeof statistics === 'object') {
            const data = {
                labels: Object.keys(statistics),
                datasets: [
                    {
                        label: 'Statistics',
                        data: Object.values(statistics),
                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                        borderColor: 'rgba(99, 102, 241, 1)',
                        borderWidth: 1,
                        borderRadius: 4,
                        hoverBackgroundColor: 'rgba(99, 102, 241, 0.4)',
                    }
                ]
            };

            const options = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 10,
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                        },
                        ticks: {
                            color: 'rgba(0, 0, 0, 0.6)',
                        },
                    },
                    x: {
                        grid: {
                            display: false,
                        },
                        ticks: {
                            color: 'rgba(0, 0, 0, 0.6)',
                        },
                    },
                },
            };

            setChartData(data);
            setChartOptions(options);
        }
    }, [statistics]);

    const header = (
        <div className="text-xl font-bold mb-2">Player Statistics</div>
    );

    if (isLoading) {
        return (
            <Card header={header}>
                <div className="flex justify-center items-center h-[300px]">
                    <ProgressSpinner
                        style={{ width: '50px', height: '50px' }}
                        strokeWidth="4"
                        animationDuration=".5s"
                    />
                </div>
            </Card>
        );
    }

    if (!statistics || typeof statistics !== 'object' || Object.keys(statistics).length === 0) {
        return (
            <Card header={header}>
                <Message
                    severity="info"
                    text="There are no statistics available for this player."
                    style={{ width: '100%' }}
                />
            </Card>
        );
    }

    return (
        <Card header={header}>
            <div className="h-[300px]">
                <Chart type="bar" data={chartData} options={chartOptions} />
            </div>
        </Card>
    );
}

PlayerStatistics.defaultProps = {
    statistics: {},
    isLoading: false,
};

export default PlayerStatistics;