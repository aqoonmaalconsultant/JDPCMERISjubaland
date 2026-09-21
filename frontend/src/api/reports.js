import { useQuery } from '@tanstack/react-query';
import { api } from './client.js';

export function useReportSummary(filters = {}, options = {}) {
  return useQuery({
    queryKey: ['report-summary', filters],
    queryFn: async () => {
      const { data } = await api.get('/reports/summary', { params: filters });
      return data;
    },
    enabled: options.enabled ?? true
  });
}

export async function downloadProjectCsv(params = {}, fileName = 'jdpcmeris-projects.csv') {
  return downloadReport('/reports/projects.csv', fileName, params);
}

export async function downloadReportSummaryCsv(params = {}, fileName = 'jdpcmeris-report-summary.csv') {
  return downloadReport('/reports/summary.csv', fileName, params);
}

export async function downloadProjectXlsx(params = {}, fileName = 'jdpcmeris-projects.xlsx') {
  return downloadReport('/reports/projects.xlsx', fileName, params);
}

export async function downloadProjectPdf(params = {}, fileName = 'jdpcmeris-projects.pdf') {
  return downloadReport('/reports/projects.pdf', fileName, params);
}

export async function downloadMonitoringCsv(params = {}, fileName = 'jdpcmeris-monitoring.csv') {
  return downloadReport('/reports/monitoring.csv', fileName, params);
}

export async function downloadEvaluationsCsv(params = {}, fileName = 'jdpcmeris-evaluations.csv') {
  return downloadReport('/reports/evaluations.csv', fileName, params);
}

export async function downloadIndicatorsCsv(params = {}, fileName = 'jdpcmeris-indicators.csv') {
  return downloadReport('/reports/indicators.csv', fileName, params);
}

export async function downloadFinancialsCsv(params = {}, fileName = 'jdpcmeris-financials.csv') {
  return downloadReport('/reports/financials.csv', fileName, params);
}

export async function downloadDocumentsCsv(params = {}, fileName = 'jdpcmeris-documents.csv') {
  return downloadReport('/reports/documents.csv', fileName, params);
}

export async function downloadWorkflowCsv(params = {}, fileName = 'jdpcmeris-workflow.csv') {
  return downloadReport('/reports/workflow.csv', fileName, params);
}

async function downloadReport(path, fileName, params = {}) {
  const { data } = await api.get(path, { params, responseType: 'blob' });
  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
