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
const TOPIC_1 = "your/topic/1";  // Topic for first device
const TOPIC_2 = "your/topic/2";  // Topic for second device
const THRESHOLD = 150;
const DATA_POINTS = 30;

export default function MQTTComponent() {
    const [deviceData1, setDeviceData1] = useState({
        device_id: "",
        alc_val: 0,
        alert: ""
    });
    const [deviceData2, setDeviceData2] = useState({
        device_id: "",
        alc_val: 0,
        alert: ""
    });

    const [chartData1, setChartData1] = useState({
        labels: [],
        values: []
    });
    const [chartData2, setChartData2] = useState({
        labels: [],
        values: []
    });

    useEffect(() => {
        const client = mqtt.connect(MQTT_BROKER);

        client.on("connect", () => {
            console.log("Connected to MQTT broker");
            client.subscribe(TOPIC_1);
            client.subscribe(TOPIC_2);
        });

        client.on("message", (topic, payload) => {
            const data = JSON.parse(payload.toString());

            if (topic === TOPIC_1) {
                setDeviceData1(data);
                setChartData1(prev => ({
                    labels: [...prev.labels, new Date().toLocaleTimeString()].slice(-DATA_POINTS),
                    values: [...prev.values, parseFloat(data.alc_val)].slice(-DATA_POINTS)
                }));
            } else if (topic === TOPIC_2) {
                setDeviceData2(data);
                setChartData2(prev => ({
                    labels: [...prev.labels, new Date().toLocaleTimeString()].slice(-DATA_POINTS),
                    values: [...prev.values, parseFloat(data.alc_val)].slice(-DATA_POINTS)
                }));
            }
        });

        return () => {
            client.end();
        };
    }, []);

    const createChartData = (labels, values, deviceId) => ({
        labels: labels,
        datasets: [{
            label: 'Alcohol Value',
            data: values,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    });

    const options = (deviceId) => ({
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Device ${deviceId} Readings`
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    });

    return (
        <div className="p-4">
            {/* First Device */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Live IoT Data: {deviceData1.device_id}</h2>
                <div className="mb-4" style={{ width: '1500px', height: '400px' }}>
                    <Line
                        data={createChartData(chartData1.labels, chartData1.values, deviceData1.device_id)}
                        options={options(deviceData1.device_id)}
                    />
                </div>
                <div className={`p-4 rounded-lg ${parseFloat(deviceData1.alc_val) > THRESHOLD
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                    }`}>
                    <p>Current Value: {deviceData1.alc_val}</p>
                    <p>Alert Status: {deviceData1.alert}</p>
                </div>
            </div>

            {/* Second Device */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Live IoT Data: {deviceData2.device_id}</h2>
                <div className="mb-4" style={{ width: '800px', height: '400px' }}>
                    <Line
                        data={createChartData(chartData2.labels, chartData2.values, deviceData2.device_id)}
                        options={options(deviceData2.device_id)}
                    />
                </div>
                <div className={`p-4 rounded-lg ${parseFloat(deviceData2.alc_val) > THRESHOLD
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                    }`}>
                    <p>Current Value: {deviceData2.alc_val}</p>
                    <p>Alert Status: {deviceData2.alert}</p>
                </div>
            </div>
        </div>
    );
}
