import { useParams, useNavigate } from "react-router-dom";
import { DashboardCard } from "@/components/Engineer/DashboardCard";
import { WeatherWidget } from "@/components/Engineer/WeatherWidget";
import { SoilHealthCard } from "@/components/Engineer/SoilHealthCard";
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";
import { ArrowLeft, Download } from "lucide-react"; // Make sure FileDownload is imported
import { toast } from "sonner"; // Ensure you import toast for notifications

// Define the PDF document to be downloaded
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

const FarmDashboard = () => {
  const { farmId } = useParams();
  const navigate = useNavigate();

  // Handle the "Back" button click
  const handleBack = () => {
    navigate(-1); // This will navigate back to the previous page
  };

  return (
    <div className="space-y-8 p-6">
      {/* Back Button */}
      <div className="flex items-center">
        <button
          onClick={handleBack} // Navigate back when clicked
          className="p-2 hover:bg-soil-500/10 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-soil-700" />
        </button>
      </div>

      {/* Page Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-teal-600 bg-clip-text text-transparent">
          Farm Dashboard
        </h1>
        <p className="text-gray-600">Real-time monitoring and analytics</p>
      </div>

      {/* PDF Download Link */}
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
        <DashboardCard className="lg:col-span-2">
          <div className="aspect-video rounded-lg bg-soil-200/50 flex items-center justify-center">
            <p className="text-soil-600">Aerial View Map</p>
          </div>
        </DashboardCard>

        <div className="flex flex-col gap-8">
          <WeatherWidget />
          <SoilHealthCard />
        </div>

        <DashboardCard title="Growth Trends" subtitle="Last 30 days" className="lg:col-span-2">
          <div className="h-64 rounded-lg bg-soil-200/50 flex items-center justify-center">
            <p className="text-soil-600">Growth Chart</p>
          </div>
        </DashboardCard>

        <DashboardCard title="AI Insights" className="h-full">
          <div className="space-y-4">
            <div className="rounded-lg bg-soil-100 p-4">
              <p className="text-sm font-medium text-soil-800">Optimal irrigation time: 6:00 AM</p>
              <p className="text-xs text-soil-600">Based on weather forecast and soil moisture levels</p>
            </div>
            <div className="rounded-lg bg-soil-100 p-4">
              <p className="text-sm font-medium text-soil-800">Nutrient deficiency alert</p>
              <p className="text-xs text-soil-600">Consider adding nitrogen-rich fertilizer</p>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default FarmDashboard;
