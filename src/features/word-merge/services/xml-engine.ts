/**
 * XML Engine for Word Mail Merge (v4.0 - VBA Style)
 */

export const TAG_START = '__MS__';
export const TAG_END = '__ME__';

/**
 * Hàn gắn các thẻ {{ }} bị chia nhỏ mang lại độ tin cậy tuyệt đối (Greedy Healer)
 * Word thường chia nhỏ các thẻ: <w:t>{</w:t></w:t>{</w:t><w:t>tag</w:t>...
 */
export function healXmlFragments(xml: string): string {
  if (!xml) return '';

  let processed = xml;

  // 1. Loại bỏ các thẻ rác của Word thường nằm xen kẽ giữa các ký tự
  const junkTags = [
    /<w:proofErr [^>]*\/>/g,
    /<w:noProof\/>/g,
    /<w:lang [^>]*\/>/g,
    /<w:lastRenderedPageBreak\/>/g,
    /<w:cr\/>/g, // Carriage return rác
  ];
  junkTags.forEach(regex => {
    processed = processed.replace(regex, '');
  });

  // 2. Thuật toán Greedy: Tìm bất kỳ chuỗi nào bắt đầu bằng { và kết thúc bằng }
  // mà bị phân mảnh bởi các thẻ đóng/mở XML (<...>)
  // Bước 2.1: Khâu các dấu ngoặc kép {{ và }} trước
  processed = processed.replace(/\{(\s*<[^>]+>\s*)*\{/g, '{{');
  processed = processed.replace(/\}(\s*<[^>]+>\s*)*\}/g, '}}');

  // Bước 2.2: Khâu toàn bộ ruột của thẻ {{ ... }}
  // Tìm {{ nội dung }} bất kể có bao nhiêu thẻ XML xen giữa
  const tagRegex = /\{\{([\s\S]*?)\}\}/g;
  processed = processed.replace(tagRegex, (match) => {
    // Trích xuất chữ thuần túy bên trong (xóa bỏ toàn bộ tag XML)
    const cleanText = match.replace(/<[^>]+>/g, '')
      .replace('{{', '')
      .replace('}}', '')
      .trim();

    if (!cleanText) return '';
    // Trả về một tag XML hợp lệ duy nhất chứa mã cách ly đặc biệt
    return `${TAG_START}${cleanText}${TAG_END}`;
  });

  return processed;
}

/**
 * THAY THẾ DỮ LIỆU KIỂU VBA (Grouping & Multi-Page)
 * Chiến lược: Mỗi nhóm (Date+Name) là một trang mới, lặp lại toàn bộ Body mẫu
 */
export function vbaStyleGroupedMerge(xml: string, groupedData: any[]): string {
  if (!xml || !groupedData || groupedData.length === 0) return xml;

  // 1. Dọn dẹp XML Fragments toàn bộ tài liệu trước
  let processedXml = healXmlFragments(xml);

  // 1.1 Ép tất cả bảng rộng 100% (Full Width - VBA Style)
  processedXml = processedXml.replace(/<w:tblPr>([\s\S]*?)<\/w:tblPr>/g, (match, tblPrContent) => {
    if (tblPrContent.includes('<w:tblW')) {
      return `<w:tblPr>${tblPrContent.replace(/<w:tblW [^>]*\/>/, '<w:tblW w:w="5000" w:type="pct"/>')}</w:tblPr>`;
    } else {
      return `<w:tblPr><w:tblW w:w="5000" w:type="pct"/>${tblPrContent}</w:tblPr>`;
    }
  });

  // 2. Tách phần Body làm Template
  const bodyMatch = processedXml.match(/<w:body>([\s\S]*?)(<w:sectPr[\s\S]*?>[\s\S]*?<\/w:sectPr>)?<\/w:body>/);
  if (!bodyMatch) return processedXml;

  const pageTemplateXml = bodyMatch[1];
  const finalSectPr = bodyMatch[2] || '';

  // 3. Xử lý từng nhóm
  const pagesXml = groupedData.map((group, groupIdx) => {
    let currentPageXml = pageTemplateXml;

    // A. Tìm và cô lập hàng mẫu (<w:tr>) có thẻ TRƯỚC KHI điền header
    const trRegex = /<w:tr(?:[\s\S]*?)>[\s\S]*?<\/w:tr>/g;
    let templateRowXml = '';
    let match;

    while ((match = trRegex.exec(currentPageXml)) !== null) {
      if (match[0].includes(TAG_START)) {
        templateRowXml = match[0];
        break;
      }
    }

    if (templateRowXml) {
      // Tạm thời thay hàng mẫu bằng một token để bảo vệ nó
      const rowToken = `__ROW_TOKEN_${groupIdx}__`;
      currentPageXml = currentPageXml.replace(templateRowXml, rowToken);

      // B. Điền các tag đơn (Header) vào phần còn lại của trang
      const firstRow = group.rows?.[0] || {};
      Object.keys(firstRow).forEach(key => {
        const tag = `${TAG_START}${key}${TAG_END}`;
        const safeValue = String(firstRow[key] || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        // Thay thế toàn bộ tag tiêu đề (Header/Footer ẩn)
        currentPageXml = currentPageXml.split(tag).join(safeValue);
      });

      // C. Nhân bản và điền dữ liệu vào Hàng mẫu đã cô lập
      const dataRowsXml = group.rows.map((row: any, rowIdx: number) => {
        let rowXml = templateRowXml;

        // Thẻ STT
        if (rowXml.includes(`${TAG_START}STT${TAG_END}`)) {
          rowXml = rowXml.replace(new RegExp(`${TAG_START}STT${TAG_END}`, 'g'), String(rowIdx + 1));
        }

        // Các thẻ dữ liệu khác
        Object.keys(row).forEach(key => {
          const tag = `${TAG_START}${key}${TAG_END}`;
          const safeValue = String(row[key] || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          rowXml = rowXml.split(tag).join(safeValue);
        });
        return rowXml;
      }).join('');

      // D. Tạo dòng tổng cộng
      const totalThanhTienStr = new Intl.NumberFormat('en-US').format(group.totalThanhTien);
      const summaryRowXml = `
        <w:tr>
          <w:trPr>
            <w:trHeight w:val="800" w:hRule="atLeast"/>
          </w:trPr>
          <w:tc>
            <w:tcPr>
              <w:gridSpan w:val="8"/>
              <w:vAlign w:val="center"/>
            </w:tcPr>
            <w:p>
              <w:pPr><w:jc w:val="center"/></w:pPr>
              <w:r>
                <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/></w:rPr>
                <w:t>TỔNG</w:t>
              </w:r>
            </w:p>
          </w:tc>
          <w:tc>
            <w:tcPr>
              <w:vAlign w:val="center"/>
            </w:tcPr>
            <w:p>
              <w:pPr><w:jc w:val="center"/></w:pPr>
              <w:r>
                <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/></w:rPr>
                <w:t>${totalThanhTienStr}</w:t>
              </w:r>
            </w:p>
          </w:tc>
        </w:tr>
      `;

      // E. Chèn dữ liệu hoàn chỉnh vào lại vị trí Token
      currentPageXml = currentPageXml.replace(rowToken, dataRowsXml + summaryRowXml);
    } else {
      // Nếu không có hàng bảng, vẫn thay thế tag tiêu đề
      const firstRow = group.rows?.[0] || {};
      Object.keys(firstRow).forEach(key => {
        const tag = `${TAG_START}${key}${TAG_END}`;
        const safeValue = String(firstRow[key] || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        currentPageXml = currentPageXml.split(tag).join(safeValue);
      });
    }

    // F. Ngắt trang
    if (groupIdx < groupedData.length - 1) {
      currentPageXml += '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
    }

    return currentPageXml;
  }).join('');

  const newBody = `<w:body>${pagesXml}${finalSectPr}</w:body>`;
  return xml.replace(/<w:body>[\s\S]*?<\/w:body>/, newBody);
}

/**
 * QUY TRÌNH CHUẨN HÓA THEO YÊU CẦU VBA
 */
export function finalizeWordXmlVba(xml: string, groupedData: any[]): string {
  return vbaStyleGroupedMerge(xml, groupedData);
}
