export const exportToCSV = (data, filename = 'crm_export.csv') => {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((obj) =>
    headers
      .map((header) => {
        let val = obj[header] === null || obj[header] === undefined ? '' : obj[header];
        if (typeof val === 'object') val = JSON.stringify(val);
        val = val.toString().replace(/"/g, '""');
        return `"${val}"`;
      })
      .join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};