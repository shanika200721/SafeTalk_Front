/**
 * Report Service
 * 
 * Handles generation of student reports in various formats (PDF, CSV)
 * Uses html2pdf for PDF generation and manual CSV creation
 */

import html2pdf from 'html2pdf.js';

const reportService = {
  /**
   * Generate PDF Report
   * Creates a professional PDF report with all student data
   * @param {Object} studentData - Complete student dashboard data
   */
  generatePDFReport: async (studentData) => {
    try {
      const { user, profile_assessment, dass21_assessment, today_checkin, latest_risk_assessment, critical_alerts } = studentData;
      
      // Create HTML content for PDF
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <!-- Header -->
          <div style="border-bottom: 3px solid #667eea; padding-bottom: 15px; margin-bottom: 20px;">
            <h1 style="color: #667eea; margin: 0; font-size: 28px;">Student Mental Health Report</h1>
            <p style="color: #666; margin: 5px 0; font-size: 12px;">
              Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </p>
          </div>

          <!-- Student Information -->
          <div style="margin-bottom: 20px; background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            <h2 style="color: #667eea; font-size: 18px; margin-top: 0;">Student Information</h2>
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 8px; font-weight: bold; width: 30%;">Name:</td>
                <td style="padding: 8px;">${user?.name || 'N/A'}</td>
              </tr>
              <tr style="background-color: #fff;">
                <td style="padding: 8px; font-weight: bold;">Email:</td>
                <td style="padding: 8px;">${user?.email || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Department:</td>
                <td style="padding: 8px;">${user?.department || 'N/A'}</td>
              </tr>
              <tr style="background-color: #fff;">
                <td style="padding: 8px; font-weight: bold;">Year of Study:</td>
                <td style="padding: 8px;">${user?.year_of_study || 'N/A'}</td>
              </tr>
            </table>
          </div>

          <!-- Risk Assessment Summary -->
          ${latest_risk_assessment ? `
            <div style="margin-bottom: 20px; background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
              <h2 style="color: #667eea; font-size: 18px; margin-top: 0;">Risk Assessment Summary</h2>
              <table style="width: 100%; font-size: 14px;">
                <tr>
                  <td style="padding: 8px; font-weight: bold; width: 30%;">Composite Score:</td>
                  <td style="padding: 8px;">${latest_risk_assessment.composite_score?.toFixed(1)}%</td>
                </tr>
                <tr style="background-color: #fff;">
                  <td style="padding: 8px; font-weight: bold;">Risk Level:</td>
                  <td style="padding: 8px; font-weight: bold; color: ${reportService._getRiskColor(latest_risk_assessment.risk_level)};">
                    ${latest_risk_assessment.risk_level}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Needs Escalation:</td>
                  <td style="padding: 8px;">${latest_risk_assessment.needs_escalation ? 'Yes' : 'No'}</td>
                </tr>
                <tr style="background-color: #fff;">
                  <td style="padding: 8px; font-weight: bold;">Assessment Date:</td>
                  <td style="padding: 8px;">${new Date(latest_risk_assessment.created_at).toLocaleDateString()}</td>
                </tr>
              </table>
              ${latest_risk_assessment.recommendations && latest_risk_assessment.recommendations.length > 0 ? `
                <div style="margin-top: 15px;">
                  <h4 style="color: #667eea; margin: 10px 0;">Recommendations:</h4>
                  <ul style="margin: 0; padding-left: 20px;">
                    ${latest_risk_assessment.recommendations.map(rec => `<li style="padding: 5px 0;">${rec}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- DASS21 Assessment -->
          ${dass21_assessment ? `
            <div style="margin-bottom: 20px; background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
              <h2 style="color: #667eea; font-size: 18px; margin-top: 0;">DASS21 Assessment</h2>
              <p style="font-size: 12px; color: #666; margin: 0;">Assessment Date: ${new Date(dass21_assessment.created_at).toLocaleDateString()}</p>
              <table style="width: 100%; font-size: 14px; margin-top: 10px;">
                <tr>
                  <td style="padding: 8px; font-weight: bold; width: 30%;">Depression:</td>
                  <td style="padding: 8px;">${dass21_assessment.depression_score}/42 (${dass21_assessment.depression_severity})</td>
                </tr>
                <tr style="background-color: #fff;">
                  <td style="padding: 8px; font-weight: bold;">Anxiety:</td>
                  <td style="padding: 8px;">${dass21_assessment.anxiety_score}/42 (${dass21_assessment.anxiety_severity})</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Stress:</td>
                  <td style="padding: 8px;">${dass21_assessment.stress_score}/42 (${dass21_assessment.stress_severity})</td>
                </tr>
                <tr style="background-color: #fff;">
                  <td style="padding: 8px; font-weight: bold;">Total Score:</td>
                  <td style="padding: 8px; font-weight: bold;">${dass21_assessment.total_dass21_score}</td>
                </tr>
              </table>
            </div>
          ` : ''}

          <!-- Today's Check-in -->
          ${today_checkin ? `
            <div style="margin-bottom: 20px; background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
              <h2 style="color: #667eea; font-size: 18px; margin-top: 0;">Today's Check-in</h2>
              <table style="width: 100%; font-size: 14px;">
                <tr>
                  <td style="padding: 8px; font-weight: bold; width: 30%;">Mood:</td>
                  <td style="padding: 8px;">${today_checkin.mood}/10</td>
                </tr>
                <tr style="background-color: #fff;">
                  <td style="padding: 8px; font-weight: bold;">Stress Level:</td>
                  <td style="padding: 8px;">${today_checkin.stress_level}/10</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Anxiety Level:</td>
                  <td style="padding: 8px;">${today_checkin.anxiety_level}/10</td>
                </tr>
                <tr style="background-color: #fff;">
                  <td style="padding: 8px; font-weight: bold;">Self-Harm Thoughts:</td>
                  <td style="padding: 8px; color: ${today_checkin.self_harm_thoughts ? '#F44336' : '#4CAF50'}; font-weight: bold;">
                    ${today_checkin.self_harm_thoughts ? 'Yes' : 'No'}
                  </td>
                </tr>
              </table>
            </div>
          ` : ''}

          <!-- Critical Alerts -->
          <div style="margin-bottom: 20px; background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            <h2 style="color: #667eea; font-size: 18px; margin-top: 0;">Critical Alerts (Last 7 Days)</h2>
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 8px; font-weight: bold; width: 50%;">Self-Harm Thoughts:</td>
                <td style="padding: 8px; color: #F44336; font-weight: bold;">${critical_alerts?.self_harm_thoughts || 0}</td>
              </tr>
              <tr style="background-color: #fff;">
                <td style="padding: 8px; font-weight: bold;">Negative Thoughts:</td>
                <td style="padding: 8px; color: #FF9800; font-weight: bold;">${critical_alerts?.negative_thoughts || 0}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Substance Use:</td>
                <td style="padding: 8px; color: #9C27B0; font-weight: bold;">${critical_alerts?.substance_use || 0}</td>
              </tr>
            </table>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #ddd; padding-top: 15px; margin-top: 30px; font-size: 11px; color: #999;">
            <p style="margin: 5px 0;">This report is confidential and intended only for authorized personnel.</p>
            <p style="margin: 5px 0;">For any concerns, please contact the student counseling services immediately.</p>
          </div>
        </div>
      `;

      // PDF options
      const options = {
        margin: 10,
        filename: `Student_Report_${user?.name?.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
      };

      // Generate and download PDF
      html2pdf().set(options).from(htmlContent).save();

      return { success: true, message: 'PDF report generated successfully' };
    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw new Error('Failed to generate PDF report: ' + error.message);
    }
  },

  /**
   * Generate CSV Report
   * Creates a CSV file with all student data
   * @param {Object} studentData - Complete student dashboard data
   */
  generateCSVReport: async (studentData) => {
    try {
      const { user, profile_assessment, dass21_assessment, today_checkin, latest_risk_assessment, critical_alerts } = studentData;

      // Prepare CSV data
      const csvRows = [
        ['Student Mental Health Report'],
        [`Generated: ${new Date().toLocaleString()}`],
        [],
        ['STUDENT INFORMATION'],
        ['Name', user?.name || 'N/A'],
        ['Email', user?.email || 'N/A'],
        ['Department', user?.department || 'N/A'],
        ['Year of Study', user?.year_of_study || 'N/A'],
        [],
        ['RISK ASSESSMENT'],
        ['Composite Score', latest_risk_assessment?.composite_score?.toFixed(1) || 'N/A'],
        ['Risk Level', latest_risk_assessment?.risk_level || 'N/A'],
        ['Needs Escalation', latest_risk_assessment?.needs_escalation ? 'Yes' : 'No'],
        ['Assessment Date', latest_risk_assessment?.created_at ? new Date(latest_risk_assessment.created_at).toLocaleDateString() : 'N/A'],
      ];

      // Add recommendations if available
      if (latest_risk_assessment?.recommendations && latest_risk_assessment.recommendations.length > 0) {
        csvRows.push(['']);
        csvRows.push(['Recommendations']);
        latest_risk_assessment.recommendations.forEach(rec => {
          csvRows.push([rec]);
        });
      }

      // Add DASS21 data
      if (dass21_assessment) {
        csvRows.push([]);
        csvRows.push(['DASS21 ASSESSMENT']);
        csvRows.push(['Assessment Date', new Date(dass21_assessment.created_at).toLocaleDateString()]);
        csvRows.push(['Depression Score', dass21_assessment.depression_score, '/', '42', dass21_assessment.depression_severity]);
        csvRows.push(['Anxiety Score', dass21_assessment.anxiety_score, '/', '42', dass21_assessment.anxiety_severity]);
        csvRows.push(['Stress Score', dass21_assessment.stress_score, '/', '42', dass21_assessment.stress_severity]);
        csvRows.push(['Total DASS21 Score', dass21_assessment.total_dass21_score]);
      }

      // Add today's check-in
      if (today_checkin) {
        csvRows.push([]);
        csvRows.push(["TODAY'S CHECK-IN"]);
        csvRows.push(['Mood', today_checkin.mood, '/', '10']);
        csvRows.push(['Stress Level', today_checkin.stress_level, '/', '10']);
        csvRows.push(['Anxiety Level', today_checkin.anxiety_level, '/', '10']);
        csvRows.push(['Self-Harm Thoughts', today_checkin.self_harm_thoughts ? 'Yes' : 'No']);
      }

      // Add critical alerts
      csvRows.push([]);
      csvRows.push(['CRITICAL ALERTS (Last 7 Days)']);
      csvRows.push(['Self-Harm Thoughts', critical_alerts?.self_harm_thoughts || 0]);
      csvRows.push(['Negative Thoughts', critical_alerts?.negative_thoughts || 0]);
      csvRows.push(['Substance Use', critical_alerts?.substance_use || 0]);

      // Convert to CSV string
      const csvContent = csvRows.map(row => row.map(cell => {
        // Escape cells containing commas or quotes
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')).join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Student_Report_${user?.name?.replace(/\s+/g, '_')}_${new Date().getTime()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'CSV report generated successfully' };
    } catch (error) {
      console.error('Error generating CSV report:', error);
      throw new Error('Failed to generate CSV report: ' + error.message);
    }
  },

  /**
   * Helper function to get risk color
   * @private
   */
  _getRiskColor: (riskLevel) => {
    const colors = {
      'LOW': '#4CAF50',
      'MEDIUM': '#FF9800',
      'HIGH': '#F44336',
      'SEVERE': '#9C27B0',
    };
    return colors[riskLevel] || '#757575';
  },
};

export default reportService;
