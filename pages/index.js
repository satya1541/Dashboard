import MQTTComponent from "../components/mqtt_twice_30_chartjs";

export default function Home() {
  return (
    <div>
      <h1>IoT Live Data Dashboard</h1>
      <MQTTComponent />
    </div>
  );
}
