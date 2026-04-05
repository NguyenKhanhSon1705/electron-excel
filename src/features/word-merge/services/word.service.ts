import PizZip from 'pizzip';
import { finalizeWordXmlVba } from './xml-engine';

/**
 * Xuất file Word sau cùng (Gộp mọi dòng vào một file duy nhất - Kiểu VBA)
 */
export async function renderDocxSingleFile(
  originalTemplateContent: Uint8Array, 
  groupedData: any[]
): Promise<Uint8Array> {
  return await internalRenderDocx(originalTemplateContent, groupedData);
}

/**
 * Xem trước kết quả trộn
 */
export async function renderDocxPreview(
  originalTemplateContent: Uint8Array,
  data: any[] // Mảng các group
): Promise<Uint8Array> {
  return await internalRenderDocx(originalTemplateContent, data);
}

/**
 * QUY TRÌNH TRỘN DỮ LIỆU ĐỘC LẬP VÀ ỔN ĐỊNH (v5 - Direct Buffer Processing)
 * Không còn qua Mammoth/Editor giúp giữ nguyên định dạng 100%
 */
async function internalRenderDocx(
  originalTemplateContent: Uint8Array,
  groupedData: any[]
): Promise<Uint8Array> {
  try {
    // 1. Mở file DOCX gốc bằng PizZip
    const zip = new PizZip(originalTemplateContent);
    
    // 2. Lấy nội dung XML chính
    let fullXml = zip.file('word/document.xml')?.asText() || '';
    if (!fullXml) throw new Error('Không tìm thấy nội dung document.xml trong file Word');

    // 3. Thực hiện trộn dữ liệu trực tiếp vào XML (VBA Style)
    fullXml = finalizeWordXmlVba(fullXml, groupedData);

    // 4. Lưu lại vào ZIP
    zip.file('word/document.xml', fullXml);

    // 5. Trả về buffer hoàn thiện
    return zip.generate({
      type: 'uint8array',
      compression: 'DEFLATE',
    });
  } catch (error) {
    console.error('[Docx Service] Error:', error);
    throw error;
  }
}
