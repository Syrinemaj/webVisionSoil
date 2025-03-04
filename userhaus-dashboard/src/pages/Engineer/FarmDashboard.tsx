import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { DashboardCard } from "@/components/Engineer/DashboardCard";
import { WeatherWidget } from "@/components/Engineer/WeatherWidget";
import { SoilHealthCard } from "@/components/Engineer/SoilHealthCard";
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink, Font } from "@react-pdf/renderer";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression, Icon } from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import "leaflet/dist/leaflet.css";
import { useMap } from "react-leaflet";

// Define the PDF document structure
Font.register({
  family: "Helvetica",
  src: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css",
});

Font.register({
  family: "Arial",
  src: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css",
});

Font.register({
  family: "sans-serif",
  src: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css",
});

const MyDocument = ({ farmData, weatherData }) => {
  // Static data for financial, crop analysis, and risk
  const financialData = {
    revenue: 500000,
    costs: 300000,
    netProfit: 200000,
    debt: 150000,
  };

  const cropAnalysis = {
    expectedYield: 1000,
    yieldTrends: "Stable over the last 3 years, with minor increases in the last season.",
  };

  const riskData = {
    floodingRisk: "Medium",
    pestRisk: "Low",
  };

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>{farmData?.name} - {farmData?.owner}</Text>
        <Text style={styles.sectionTitle}>Financial Overview</Text>
        <Text style={styles.text}>Revenue (Last Year): ${financialData?.revenue}</Text>
        <Text style={styles.text}>Operating Costs: ${financialData?.costs}</Text>
        <Text style={styles.text}>Net Profit: ${financialData?.netProfit}</Text>
        <Text style={styles.text}>Debt: ${financialData?.debt}</Text>
        <Text style={styles.sectionTitle}>Crop Yield Analysis</Text>
        <Text style={styles.text}>Expected Crop Yield: {cropAnalysis?.expectedYield} tons</Text>
        <Text style={styles.text}>Yield Trends: {cropAnalysis?.yieldTrends}</Text>
        <Text style={styles.sectionTitle}>Weather Conditions</Text>
        <Text style={styles.text}>Temperature: {weatherData?.temperature}°C</Text>
        <Text style={styles.text}>Humidity: {weatherData?.humidity}%</Text>
        <Text style={styles.text}>Precipitation: {weatherData?.precipitation} mm</Text>
        <Text style={styles.sectionTitle}>Risk Assessment</Text>
        <Text style={styles.text}>Risk of Flooding: {riskData?.floodingRisk}</Text>
        <Text style={styles.text}>Pest Infestation Risk: {riskData?.pestRisk}</Text>
        <Text style={styles.sectionTitle}>Sustainability</Text>
        <Text style={styles.text}>Carbon Footprint: {farmData?.carbonFootprint} kg CO2e</Text>
      </Page>
    </Document>
  );
};

const styles = StyleSheet.create({
  page: {
    padding: "40px",
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 26,
    textAlign: "center",
    marginBottom: 15,
    color: "#2e4a3a",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 10,
    color: "#4c6b52",
    fontWeight: "normal",
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: "bold",
    color: "#3a5a40",
    borderBottom: "1px solid #ddd",
    paddingBottom: 5,
  },
  text: {
    fontSize: 12,
    marginBottom: 8,
    color: "#5a5a5a",
  },
  textBold: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2e4a3a",
  },
});
interface WeatherData {
  temperature: number;
  humidity: number;
  weatherCondition: string;
  highTemp: number;
  lowTemp: number;
  precipitation: number;
}

interface FarmData {
  id: number;
  name: string;
  owner: string;
  latitude?: number;
  longitude?: number;
  weather?: string; // JSON string
  irrigationTime?: string;
  nutrientDeficiency?: string;
  carbonFootprint?: number;
}

interface FinancialData {
  revenue: number;
  costs: number;
  netProfit: number;
  debt: number;
}

interface CropAnalysis {
  expectedYield: number;
  yieldTrends: string;
}

interface RiskData {
  floodingRisk: string;
  pestRisk: string;
}

// Define the MapView component outside of FarmDashboard
const MapView = ({ position, zoom }: { position: LatLngExpression; zoom: number }) => {
  const map = useMap();
  map.setView(position, zoom);
  return null;
};

const FarmDashboard = () => {
  const { farmId } = useParams<{ farmId: string }>();
  const navigate = useNavigate();
  const [farmData, setFarmData] = useState<FarmData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFarmData = async () => {
      try {
        const response = await fetch(`http://localhost:8081/api/farm/${farmId}`);
        if (!response.ok) throw new Error("Farm not found");
        const data = await response.json();
        setFarmData(data);
      } catch (error) {
        console.error("Error fetching farm data:", error);
        setError("Failed to load farm data.");
      } finally {
        setLoading(false);
      }
    };

    fetchFarmData();
  }, [farmId]);

  const handleBack = () => navigate(-1);

  const customIcon = new Icon({
    iconUrl: markerIconPng,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    shadowSize: [41, 41],
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const weatherData = farmData?.weather ? JSON.parse(farmData.weather) : null;
  const position: LatLngExpression = farmData?.latitude && farmData?.longitude ? [farmData.latitude, farmData.longitude] : [0, 0];

  return (
    <div className="space-y-8 p-6">
      {/* Back Button */}
      <div className="flex items-center">
        <button onClick={handleBack} className="p-2 hover:bg-soil-500/10 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-soil-700" />
        </button>
      </div>

{/* Title */}
<div className="text-center space-y-2">
  <h1 className="text-3xl font-bold text-soil-500 hover:text-soil-600">
    Farm Dashboard - {farmData?.name}
  </h1>
  <p className="text-soil-600 font-semibold">{`Owner: ${farmData?.owner || "Unknown"}`}</p>
</div>


      {/* PDF Generation */}
      <PDFDownloadLink  document={<MyDocument farmData={farmData} weatherData={weatherData} />} fileName="AI_Analysis_Report.pdf">
        {({ loading }) => (
          <button
            className="px-4 py-2 bg-soil-600 text-white rounded-lg hover:bg-soil-700 flex items-center gap-2 mt-4"
            onClick={() => toast.success("PDF Generated Successfully!")}
          >
            <Download className="w-4 h-4" />
            {loading ? "Generating..." : "Generate AI Report"}
          </button>
        )}
      </PDFDownloadLink>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Map Section */}
        <DashboardCard className="lg:col-span-2">
          {farmData?.latitude && farmData?.longitude ? (
            <div style={{ height: "400px", width: "100%" }}>
              <MapContainer key={position.toString()} style={{ height: "100%", width: "100%" }}>
                <MapView position={position} zoom={13} />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={position} {...{ icon: customIcon }}>
                  <Popup>{farmData?.name}</Popup>
                </Marker>
              </MapContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-soil-600">No location data available for this farm</p>
            </div>
          )}
        </DashboardCard>

        {/* Weather & Soil Health */}
        <div className="flex flex-col gap-8">
          <WeatherWidget weather={weatherData} />
          <SoilHealthCard />
        </div>

        {/* Growth Trends */}
        <DashboardCard title="Growth Trends" subtitle="Last 30 days" className="lg:col-span-2">
          <div className="h-64 rounded-lg bg-soil-200/50 flex items-center justify-center">
            <p className="text-soil-600">Growth Chart</p>
          </div>
        </DashboardCard>

       {/* AI Insights Section */}
       <DashboardCard title="AI Insights" className="h-full">
          <div className="space-y-4">
            {/* Optimal Irrigation Time */}
            <div className="rounded-lg bg-soil-100 p-4">
              <p className="text-sm font-medium text-soil-800">Optimal irrigation time: {farmData?.irrigationTime || "Not available"}</p>
              <p className="text-xs text-soil-600">Based on weather forecast and soil moisture levels</p>
            </div>

            {/* Nutrient Deficiency Alert */}
            <div className="rounded-lg bg-soil-100 p-4">
              <p className="text-sm font-medium text-soil-800">Nutrient deficiency alert: None detected</p>
              <p className="text-xs text-soil-600">Consider adding nitrogen-rich fertilizer</p>
            </div>

            {/* Crop Health Prediction */}
            <div className="rounded-lg bg-soil-100 p-4">
              <p className="text-sm font-medium text-soil-800">Crop health prediction:  No data available</p>
              <p className="text-xs text-soil-600">Based on plant growth rates and environmental conditions</p>
            </div>

            {/* Pest or Disease Alert */}
            <div className="rounded-lg bg-soil-100 p-4">
              <p className="text-sm font-medium text-soil-800">Pest or disease alert: "None detected"</p>
              <p className="text-xs text-soil-600">Possible infestation detected. Consider applying organic pest control.</p>
            </div>

            {/* Weather-Based Recommendation */}
            <div className="rounded-lg bg-soil-100 p-4">
              <p className="text-sm font-medium text-soil-800">Weather-based recommendation: No recommendations available</p>
              <p className="text-xs text-soil-600">Suggestions based on weather forecast for the next 7 days</p>
            </div>

            
          </div>
        </DashboardCard>

      </div>
    </div>
  );
};

export default FarmDashboard;