const fs = require('fs');
const path = require('path');

function createPdf(textLines) {
  let content = "BT /F1 14 Tf 50 780 Td (UTTARAKHAND POLICE - TENANT VERIFICATION DOSSIER) Tj ET\n";
  content += "BT /F1 10 Tf 50 760 Td (Under Section 83, Uttarakhand Police Act, 2007) Tj ET\n";
  content += "BT /F1 10 Tf 50 740 Td (Official Website: https://uttarakhandpolice.uk.gov.in) Tj ET\n";
  content += "BT /F1 10 Tf 50 710 Td (-------------------------------------------------------------------------------------------------) Tj ET\n";

  let y = 690;
  for (const line of textLines) {
    const escaped = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    content += `BT /F1 10 Tf 50 ${y} Td (${escaped}) Tj ET\n`;
    y -= 20;
  }

  content += "BT /F1 10 Tf 50 120 Td (DECLARATION: I hereby declare that all details submitted above are true and complete.) Tj ET\n";
  content += "BT /F1 10 Tf 50 70 Td (Signature of Landlord: ________________________   Signature of Tenant: ________________________) Tj ET\n";

  const streamLength = Buffer.byteLength(content, 'utf-8');

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${content}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000${(244 + streamLength + 35).toString().padStart(3, '0')} 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${350 + streamLength}
%%EOF`;

  return Buffer.from(pdf, 'utf-8');
}

const lines = [
  "1. Tenant Full Name: ____________________________________________________",
  "2. Father's / Husband's Name: __________________________________________",
  "3. Mobile Number: _______________________________________________________",
  "4. Aadhaar / Photo ID Number (Masked): __________________________________",
  "5. Occupation / University (UPES / Graphic Era / DIT / Company): ________",
  "6. Permanent Hometown Address: __________________________________________",
  "7. Rented Accommodation Address in Uttarakhand: _________________________",
  "8. Local Police Station (Thana): ________________________________________",
  "9. Landlord Full Name & Phone: __________________________________________",
  "10. Two Local References in Uttarakhand (Name & Contact Phone):",
  "    Ref 1: ____________________________________________________________",
  "    Ref 2: ____________________________________________________________"
];

const pdfBuffer = createPdf(lines);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'UK_Police_Verification_Form.pdf'), pdfBuffer);
console.log('✅ Created UK_Police_Verification_Form.pdf successfully!');

