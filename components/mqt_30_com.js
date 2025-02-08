"use client";
import { useEffect, useState } from "react";
import mqtt from "mqtt";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const MQTT_BROKER = "ws://46.28.44.138:9001";
const TOPIC = "your/topic";
const THRESHOLD = 2800;
const DATA_POINTS = 30; // Changed to 30 data points

export default function MQTTComponent() {
    const [deviceData, setDeviceData] = useState({
        device_id: "",
        alc_val: 0,
        alert: ""
    });
    const [chartData, setChartData] = useState({
        labels: [],
        values: []
    });

    useEffect(() => {
        const client = mqtt.connect(MQTT_BROKER);

        client.on("connect", () => {
            console.log("Connected to MQTT broker");
            client.subscribe(TOPIC);
        });

        client.on("message", (topic, payload) => {
            const data = JSON.parse(payload.toString());
            setDeviceData(data);

            setChartData(prev => ({
                labels: [...prev.labels, new Date().toLocaleTimeString()].slice(-DATA_POINTS),
                values: [...prev.values, parseFloat(data.alc_val)].slice(-DATA_POINTS)
            }));
        });

        return () => {
            client.end();
        };
    }, []);

    const data = {
        labels: chartData.labels,
        datasets: [
            {
                label: 'Alcohol Value',
                data: chartData.values,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Device ${deviceData.device_id} Readings`
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Live IoT Data: {deviceData.device_id}</h2>
            <div className="mb-4" style={{ width: '800px', height: '400px' }}>
                <Line data={data} options={options} />
            </div>
            <div className={`p-4 rounded-lg ${parseFloat(deviceData.alc_val) > THRESHOLD
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                <p>Current Value: {deviceData.alc_val}</p>
                <p>Alert Status: {deviceData.alert}</p>
            </div>
        </div>
    );
}
