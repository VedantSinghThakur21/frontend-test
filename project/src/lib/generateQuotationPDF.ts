// import { Document, Page, Text, View, StyleSheet, PDFViewer, Font } from '@react-pdf/renderer';
// import { Quotation } from '../types';
// import { format, isValid } from 'date-fns';

// // Register fonts for better cross-platform compatibility
// Font.register({
//   family: 'Helvetica',
//   fonts: [
//     { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxP.ttf', fontWeight: 'normal' },
//     { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmWUlfBBc9.ttf', fontWeight: 'bold' },
//   ],
// });

// const styles = StyleSheet.create({
//   page: {
//     padding: 30,
//     fontFamily: 'Helvetica',
//   },
//   header: {
//     marginBottom: 20,
//     borderBottom: '1pt solid #ccc',
//     paddingBottom: 10,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     color: '#2563eb',
//   },
//   companyInfo: {
//     fontSize: 10,
//     color: '#4b5563',
//   },
//   section: {
//     marginBottom: 15,
//   },
//   sectionTitle: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     marginBottom: 5,
//     color: '#1f2937',
//   },
//   row: {
//     flexDirection: 'row',
//     marginBottom: 5,
//   },
//   label: {
//     width: '30%',
//     fontSize: 10,
//     color: '#4b5563',
//   },
//   value: {
//     width: '70%',
//     fontSize: 10,
//     color: '#1f2937',
//   },
//   amounts: {
//     marginTop: 20,
//     borderTop: '1pt solid #ccc',
//     paddingTop: 10,
//   },
//   amount: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 5,
//   },
//   amountLabel: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#1f2937',
//   },
//   amountValue: {
//     fontSize: 12,
//     color: '#2563eb',
//   },
//   terms: {
//     marginTop: 30,
//     fontSize: 10,
//     color: '#4b5563',
//   },
//   footer: {
//     position: 'absolute',
//     bottom: 30,
//     left: 30,
//     right: 30,
//     textAlign: 'center',
//     fontSize: 8,
//     color: '#6b7280',
//   },
//   pageNumber: {
//     position: 'absolute',
//     bottom: 30,
//     right: 30,
//     fontSize: 8,
//     color: '#6b7280',
//   },
// });

// interface QuotationPDFProps {
//   quotation: Quotation;
//   inquiry: any;
//   client: any;
//   costCalculation: any;
// }

// // Helper function to safely format dates
// const safeFormatDate = (date: string | Date | null | undefined): string => {
//   if (!date) return 'N/A';
  
//   const dateObj = typeof date === 'string' ? new Date(date) : date;
//   return isValid(dateObj) ? format(dateObj, 'dd/MM/yyyy') : 'N/A';
// };

// // Helper to format currency
// const formatCurrency = (amount: number | null | undefined): string => {
//   if (amount === null || amount === undefined) return '₹0';
//   return `₹${amount.toLocaleString('en-IN')}`;
// };

// export const QuotationPDF = ({ quotation, inquiry, client, costCalculation }: QuotationPDFProps) => (
//   <Document>
//     <Page  style={styles.page}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Quotation</Text>
//         <Text style={styles.companyInfo}>Your Company Name</Text>
//         <Text style={styles.companyInfo}>123 Business Street, City, Country</Text>
//         <Text style={styles.companyInfo}>Phone: +1234567890 | Email: info@company.com</Text>
//       </View>

//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Client Information</Text>
//         <View style={styles.row}>
//           <Text style={styles.label}>Company:</Text>
//           <Text style={styles.value}>{client?.company_name || 'N/A'}</Text>
//         </View>
//         <View style={styles.row}>
//           <Text style={styles.label}>Contact Person:</Text>
//           <Text style={styles.value}>{client?.contact_person || 'N/A'}</Text>
//         </View>
//         <View style={styles.row}>
//           <Text style={styles.label}>Email:</Text>
//           <Text style={styles.value}>{client?.email || 'N/A'}</Text>
//         </View>
//         <View style={styles.row}>
//           <Text style={styles.label}>Phone:</Text>
//           <Text style={styles.value}>{client?.phone || 'N/A'}</Text>
//         </View>
//       </View>

//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Quotation Details</Text>
//         <View style={styles.row}>
//           <Text style={styles.label}>Quotation ID:</Text>
//           <Text style={styles.value}>{quotation?.id || 'N/A'}</Text>
//         </View>
//         <View style={styles.row}>
//           <Text style={styles.label}>Date:</Text>
//           <Text style={styles.value}>{safeFormatDate(quotation?.created_at)}</Text>
//         </View>
//         <View style={styles.row}>
//           <Text style={styles.label}>Validity:</Text>
//           <Text style={styles.value}>{quotation?.validity_period ? `${quotation.validity_period} days` : 'N/A'}</Text>
//         </View>
//       </View>

//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Service Details</Text>
//         <View style={styles.row}>
//           <Text style={styles.label}>Crane Type:</Text>
//           <Text style={styles.value}>{inquiry?.crane_type || 'N/A'}</Text>
//         </View>
//         <View style={styles.row}>
//           <Text style={styles.label}>Capacity:</Text>
//           <Text style={styles.value}>{inquiry?.crane_capacity || 'N/A'}</Text>
//         </View>
//         <View style={styles.row}>
//           <Text style={styles.label}>Duration:</Text>
//           <Text style={styles.value}>{costCalculation?.duration ? `${costCalculation.duration} days` : 'N/A'}</Text>
//         </View>
//         <View style={styles.row}>
//           <Text style={styles.label}>Location:</Text>
//           <Text style={styles.value}>{inquiry?.location || 'N/A'}</Text>
//         </View>
//       </View>

//       <View style={styles.amounts}>
//         <View style={styles.amount}>
//           <Text style={styles.amountLabel}>Total Amount:</Text>
//           <Text style={styles.amountValue}>{formatCurrency(quotation?.total_amount)}</Text>
//         </View>
//         <View style={styles.amount}>
//           <Text style={styles.amountLabel}>Advance Payment (60%):</Text>
//           <Text style={styles.amountValue}>{formatCurrency(quotation?.advance_amount)}</Text>
//         </View>
//         <View style={styles.amount}>
//           <Text style={styles.amountLabel}>Remaining Payment (40%):</Text>
//           <Text style={styles.amountValue}>{formatCurrency(quotation?.remaining_amount)}</Text>
//         </View>
//       </View>

//       {quotation?.terms_conditions && (
//         <View style={styles.terms}>
//           <Text style={styles.sectionTitle}>Terms & Conditions</Text>
//           <Text>{quotation.terms_conditions}</Text>
//         </View>
//       )}

//       <Text 
//         style={styles.pageNumber}
//         render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} 
//       />
      
//       <Text style={styles.footer}>
//         This document is computer generated and does not require signature.
//       </Text>
//     </Page>
//   </Document>
// );

// // Conditional PDFViewer component for client-side rendering only
// export const QuotationPDFViewer = (props: QuotationPDFProps) => {
//   // Check if we're in a browser environment
//   const isBrowser = typeof window !== 'undefined';
  
//   if (isBrowser === false) {
//     return null;
//   }
  
//   return (
//     <PDFViewer style={{ width: '100%', height: '80vh', border: 'none' }}>
//       <QuotationPDF {...props} />
//     </PDFViewer>
//   );
// };

// // For server-side rendering or download functionality
// export const BlobProvider = ({ children }: { children: React.ReactNode }) => {
//   if (typeof window !== 'undefined') {
//     const { PDFDownloadLink } = require('@react-pdf/renderer');
//     return PDFDownloadLink;
//   }
//   return null;
// };