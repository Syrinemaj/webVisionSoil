import { motion } from 'framer-motion';
import { Farm, Fruit } from '@/pages/Farmer/Farmer';
import { ArrowLeft, Droplet, Leaf, AlertTriangle, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SoilHealthCard } from "@/components/Farmer/SoilHealthCard";
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink, Image } from "@react-pdf/renderer";
import { toast } from 'sonner';
import React from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface FruitDashboardProps {
  farm: Farm;
  fruit: Fruit;
  onBack: () => void;
}

const logo = "logoVision.png"; // Make sure the path is correct

// PDF Document Component (used for React PDF renderer)
const MyDocument = ({ farm }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.header}>
        <Image src={logo} style={styles.logo} />
        <Text style={styles.title}>AI Analysis Report</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Farm Information</Text>
        <View style={styles.infoRow}><Text style={styles.label}>🌾 Name:</Text><Text>{farm.name}</Text></View>
        <View style={styles.infoRow}><Text style={styles.label}>📍 Location:</Text><Text>{farm.location}</Text></View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Farm Status</Text>
        <View style={styles.infoRow}><Text style={styles.label}>🌡 Temperature:</Text><Text>{farm.temperature}°C</Text></View>
        <View style={styles.infoRow}><Text style={styles.label}>💧 Humidity:</Text><Text>{farm.humidity}%</Text></View>
        <View style={styles.infoRow}><Text style={styles.label}>🌱 Soil pH:</Text><Text>6.5 (Optimal)</Text></View>
        <View style={styles.infoRow}><Text style={styles.label}>🩺 Plant Health:</Text><Text>Good ✅</Text></View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Recommendations</Text>
        <Text style={styles.recommendation}>✅ Optimal harvest time: In 5-7 days.</Text>
        <Text style={styles.recommendation}>✅ Maintain current irrigation schedule.</Text>
      </View>
    </Page>
  </Document>
);

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 10,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 12,
    marginBottom: 4,
  },
  label: {
    fontWeight: "bold",
  },
  recommendation: {
    fontSize: 12,
    marginTop: 5,
  },
});

// FruitDashboard Component (with integration of FarmReport)
const FruitDashboard = ({ farm, fruit, onBack }: FruitDashboardProps) => {
  const printRef = React.useRef(null);

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) {
      return;
    }

    const canvas = await html2canvas(element, {
      scale: 2,
    });
    const data = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
    });

    const imgProperties = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

    pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("farm_report.pdf");
  };

  // Sample data for the chart
  const data = [
    { name: 'Week 1', ripeness: 20 },
    { name: 'Week 2', ripeness: 35 },
    { name: 'Week 3', ripeness: 50 },
    { name: 'Week 4', ripeness: 65 },
    { name: 'Week 5', ripeness: fruit.ripeness },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="p-2 hover:bg-soil-500/10 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-soil-700" />
          </button>
          <div className="ml-4">
            <h2 className="text-sm text-soil-600">{farm.name}</h2>
            <h1 className="text-2xl font-semibold text-soil-900">{fruit.name}</h1>
          </div>
        </div>
   {/* PDF Download Link */}
   <div className="flex justify-end">
  <PDFDownloadLink document={<MyDocument farm={farm} />} fileName="AI_Analysis_Report.pdf">
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
</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm border border-soil-200">
              <img
                src={fruit.image}
                alt={fruit.name}
                className="w-full h-64 object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-soil-200">
                <h3 className="text-soil-600 mb-2">Current Production</h3>
                <p className="text-3xl font-semibold text-soil-900">{fruit.production}kg</p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-soil-200">
                <h3 className="text-soil-600 mb-2">Ripeness</h3>
                <p className="text-3xl font-semibold text-soil-900">{fruit.ripeness}%</p>
              </div>
            </div>
             <div className="flex flex-col gap-8">
                      
                      <SoilHealthCard />
                    </div>

            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm space-y-4 border border-soil-200">
              <h3 className="text-xl font-semibold text-soil-900">Status Indicators</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <Leaf className="mx-auto mb-2 text-green-500" size={24} />
                  <p className="text-sm text-gray-600">Plant Health</p>
                  <p className="font-semibold text-green-700">Good</p>
                </div>
                <div className="text-center p-4">
                  <Droplet className="mx-auto mb-2 text-blue-500" size={24} />
                  <p className="text-sm text-gray-600">Irrigation</p>
                  <p className="font-semibold text-blue-700">Optimal</p>
                </div>
                <div className="text-center p-4">
                  <AlertTriangle className="mx-auto mb-2 text-yellow-500" size={24} />
                  <p className="text-sm text-gray-600">Diseases</p>
                  <p className="font-semibold text-yellow-700">None</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-soil-200">
              <h3 className="text-xl font-semibold text-soil-900 mb-6">Ripeness Progression</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" />
                    <XAxis dataKey="name" stroke="#475569" />
                    <YAxis stroke="#475569" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        borderColor: "#E2E8F0",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="ripeness"
                      stroke="#2563EB"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-soil-200">
              <h3 className="text-xl font-semibold text-soil-900 mb-4">AI Recommendations</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-blue-800">
                    Optimal harvest time approaching. Plan harvesting within the next 5-7 days.
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-blue-800">
                    Soil moisture levels are optimal. Maintain current irrigation schedule.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FruitDashboard;