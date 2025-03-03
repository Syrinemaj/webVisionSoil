import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { DashboardCard } from "@/components/Engineer/DashboardCard";
import { WeatherWidget } from "@/components/Engineer/WeatherWidget";
import { SoilHealthCard } from "@/components/Engineer/SoilHealthCard";
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression, Icon } from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import "leaflet/dist/leaflet.css";
import { useMap } from "react-leaflet";



const MapView = ({ position, zoom }: { position: LatLngExpression; zoom: number }) => {
  const map = useMap();
  map.setView(position, zoom);
  return null;
};


// Définition du document PDF
const MyDocument = () => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.title}>AI Analysis Report</Text>
      <Text style={styles.text}>This is a generated report based on real-time monitoring and analysis.</Text>
    </Page>
  </Document>
);

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 30,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  text: {
    fontSize: 12,
    textAlign: "left",
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
}

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

  // Retour arrière
  const handleBack = () => navigate(-1);

  // Icône personnalisée
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

  // Récupération des données météo
  const weatherData = farmData?.weather ? JSON.parse(farmData.weather) : null;
  const position: LatLngExpression = farmData?.latitude && farmData?.longitude ? [farmData.latitude, farmData.longitude] : [0, 0];

  return (
    <div className="space-y-8 p-6">
      {/* Bouton Retour */}
      <div className="flex items-center">
        <button onClick={handleBack} className="p-2 hover:bg-soil-500/10 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-soil-700" />
        </button>
      </div>

      {/* Titre */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-teal-600 bg-clip-text text-transparent">
          Farm Dashboard - {farmData?.name}
        </h1>
        <p className="text-gray-600">Owner: {farmData?.owner || "Unknown"}</p>
      </div>

      {/* Téléchargement du PDF */}
      <PDFDownloadLink document={<MyDocument />} fileName="AI_Analysis_Report.pdf">
        {({ loading }) => (
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 mt-4"
            onClick={() => toast.success("PDF Generated Successfully!")}
          >
            <Download className="w-4 h-4" />
            {loading ? "Generating..." : "Generate AI Report"}
          </button>
        )}
      </PDFDownloadLink>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Section Carte */}
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

        {/* Météo & Santé du sol */}
        <div className="flex flex-col gap-8">
          <WeatherWidget weather={weatherData} />
          <SoilHealthCard />
        </div>

        {/* Tendances de croissance */}
        <DashboardCard title="Growth Trends" subtitle="Last 30 days" className="lg:col-span-2">
          <div className="h-64 rounded-lg bg-soil-200/50 flex items-center justify-center">
            <p className="text-soil-600">Growth Chart</p>
          </div>
        </DashboardCard>

        {/* Insights AI */}
        <DashboardCard title="AI Insights" className="h-full">
          <div className="space-y-4">
            <div className="rounded-lg bg-soil-100 p-4">
              <p className="text-sm font-medium text-soil-800">
                Optimal irrigation time: {farmData?.irrigationTime || "Not available"}
              </p>
              <p className="text-xs text-soil-600">Based on weather forecast and soil moisture levels</p>
            </div>
            <div className="rounded-lg bg-soil-100 p-4">
              <p className="text-sm font-medium text-soil-800">
                Nutrient deficiency alert: {farmData?.nutrientDeficiency || "None detected"}
              </p>
              <p className="text-xs text-soil-600">Consider adding nitrogen-rich fertilizer</p>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default FarmDashboard;
