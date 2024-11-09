import * as Papa from 'papaparse';

export function convertCsvToJson(data: any): any {
    try {
        // 假设 data.FILE 是一个包含 CSV 内容的 base64 编码字符串
        const csvData = atob(data.FILE.split(',')[1]); // 解码 base64
        const parsedData = Papa.parse(csvData, { header: true });
        return parsedData.data;
    } catch(error) {
        console.log(error);
        return null;
    }
}
