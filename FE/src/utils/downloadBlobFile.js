export function downloadBlobFile(res, name, type) {
    const blob = new Blob([res.data], { type });
    const downloadExcelObjectURL = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadExcelObjectURL;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click(); // Trigger the download
    document.body.removeChild(downloadLink); // Clean up
}
