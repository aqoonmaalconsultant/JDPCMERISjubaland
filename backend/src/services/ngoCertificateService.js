import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

import {
  fileURLToPath,
} from 'url';

import {
  storeNGOCertificateFile,
} from './fileStorageService.js';

const COLORS = Object.freeze({
  navy: '#123B67',
  darkNavy: '#092B4C',
  gold: '#C79A2B',
  lightGold: '#F7F0DD',
  green: '#087F5B',
  lightGreen: '#EAF8F2',
  gray: '#526173',
  lightGray: '#F3F6F9',
  borderGray: '#D4DCE5',
  white: '#FFFFFF',
  black: '#17202A',
  watermark: '#E5EBF1',
});

function formatCertificateDate(value) {
  if (!value) {
    return '';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '';
  }

  return new Intl.DateTimeFormat(
    'en-GB',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }
  ).format(date);
}

function formatGeneratedDate(value) {
  const date =
    value
      ? new Date(value)
      : new Date();

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '';
  }

  return new Intl.DateTimeFormat(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    }
  ).format(date);
}

function getRegistrationStatus(registrationType) {
  if (
    registrationType ===
    'Renewal'
  ) {
    return 'Renewal Registration';
  }

  return 'New Registration';
}

function drawOuterBorder(doc) {
  const pageWidth =
    doc.page.width;

  const pageHeight =
    doc.page.height;

  doc
    .save()
    .lineWidth(4)
    .strokeColor(
      COLORS.navy
    )
    .rect(
      18,
      18,
      pageWidth - 36,
      pageHeight - 36
    )
    .stroke()
    .restore();

  doc
    .save()
    .lineWidth(1.7)
    .strokeColor(
      COLORS.gold
    )
    .rect(
      25,
      25,
      pageWidth - 50,
      pageHeight - 50
    )
    .stroke()
    .restore();

  doc
    .save()
    .lineWidth(0.7)
    .strokeColor(
      COLORS.navy
    )
    .rect(
      30,
      30,
      pageWidth - 60,
      pageHeight - 60
    )
    .stroke()
    .restore();

  drawCornerDecoration(
    doc,
    30,
    30,
    false,
    false
  );

  drawCornerDecoration(
    doc,
    pageWidth - 30,
    30,
    true,
    false
  );

  drawCornerDecoration(
    doc,
    30,
    pageHeight - 30,
    false,
    true
  );

  drawCornerDecoration(
    doc,
    pageWidth - 30,
    pageHeight - 30,
    true,
    true
  );
}

function drawCornerDecoration(
  doc,
  x,
  y,
  reverseX,
  reverseY
) {
  const horizontalDirection =
    reverseX
      ? -1
      : 1;

  const verticalDirection =
    reverseY
      ? -1
      : 1;

  doc
    .save()
    .strokeColor(
      COLORS.gold
    )
    .lineWidth(2)
    .moveTo(
      x,
      y +
        22 *
          verticalDirection
    )
    .lineTo(
      x,
      y
    )
    .lineTo(
      x +
        22 *
          horizontalDirection,
      y
    )
    .stroke()
    .restore();

  doc
    .save()
    .fillColor(
      COLORS.gold
    )
    .circle(
      x +
        8 *
          horizontalDirection,
      y +
        8 *
          verticalDirection,
      2.5
    )
    .fill()
    .restore();
}

function drawWatermark(doc) {
  doc.save();

  doc
    .fillColor(
      COLORS.watermark
    )
    .fillOpacity(
      0.42
    )
    .font(
      'Helvetica-Bold'
    )
    .fontSize(
      48
    )
    .rotate(
      -32,
      {
        origin: [
          doc.page.width / 2,
          doc.page.height / 2,
        ],
      }
    )
    .text(
      'JUBALAND STATE',
      80,
      420,
      {
        width:
          450,

        align:
          'center',
      }
    );

  doc.restore();
}

function drawGovernmentSeal(
  doc,
  centerX,
  centerY
) {

  const logoPath =
    fileURLToPath(
      new URL(
        '../assets/certificates/ministry-logo.png',
        import.meta.url
      )
    );


  doc.image(
  logoPath,
  centerX - 38,
  centerY - 38,
  {
    width:
      76,

    height:
      76,
  }
);
}
function drawTitle(
  doc,
  certificate
) {

  

  // Main certificate title movement
  const mainTitleOffsetX = 0; // + right | - left
  const mainTitleOffsetY = +7; // + down  | - up


  doc
    .fillColor(
      COLORS.darkNavy
    )
    .font(
      'Helvetica-Bold'
    )
    .fontSize(
      20
    )
    .text(
      'CERTIFICATE OF REGISTRATION',
      55 + mainTitleOffsetX,
      173 + mainTitleOffsetY,
      {
        width:
          485,

        align:
          'center',
      }
    );

  const organizationType =
  certificate?.organizationSnapshot?.organizationType ||
  certificate?.organizationType ||
  certificate?.organization?.organizationType ||
  'All Organizations';


const certificateCategory =
  organizationType
    .toUpperCase();


doc
  .fillColor(
    COLORS.navy
  )
  .font(
    'Helvetica-Bold'
  )
  .fontSize(
    11
  )
  .text(
    certificateCategory,
    55,
    207,
    {
      width:
        485,

      align:
        'center',

      characterSpacing:
        0.6,
    }
  );
}

function drawCertificateIdentifiers(
  doc,
  certificate
) {
  const boxY =
    236;

  const boxHeight =
    48;

  const boxWidth =
    220;

  const leftX =
    61;

  const rightX =
    314;

  doc
    .save()
    .fillColor(
      COLORS.lightGreen
    )
    .roundedRect(
      leftX,
      boxY,
      boxWidth,
      boxHeight,
      6
    )
    .fill()
    .restore();

  doc
    .save()
    .fillColor(
      COLORS.lightGray
    )
    .roundedRect(
      rightX,
      boxY,
      boxWidth,
      boxHeight,
      6
    )
    .fill()
    .restore();

  drawIdentifierBoxText(
    doc,
    leftX,
    boxY,
    boxWidth,
    'REGISTRATION STATUS',
    getRegistrationStatus(
      certificate.registrationType
    ),
    COLORS.green
  );

  drawIdentifierBoxText(
    doc,
    rightX,
    boxY,
    boxWidth,
    'CERTIFICATE NUMBER',
    certificate.certificateNumber ||
      '—',
    COLORS.navy
  );
}

function drawIdentifierBoxText(
  doc,
  x,
  y,
  width,
  label,
  value,
  accentColor
) {
  doc
    .fillColor(
      accentColor
    )
    .font(
      'Helvetica-Bold'
    )
    .fontSize(
      6.8
    )
    .text(
      label,
      x + 8,
      y + 8,
      {
        width:
          width - 16,

        align:
          'center',

        characterSpacing:
          0.7,
      }
    );

  doc
    .fillColor(
      COLORS.black
    )
    .font(
      'Helvetica-Bold'
    )
    .fontSize(
      9
    )
    .text(
      value,
      x + 8,
      y + 24,
      {
        width:
          width - 16,

        align:
          'center',

        ellipsis:
          true,
      }
    );
}

function drawCertificationStatement(
  doc
) {

  const statementOffsetX = 0; // + right | - left
const statementOffsetY = +80; // + down  | - up


doc
  .fillColor(
    COLORS.black
  )
  .font(
    'Helvetica'
  )
  .fontSize(
    10
  )
  .text(
    'This is to certify that the organization identified below has been duly registered by the Ministry of Planning Investment and International Cooperation of Jubaland State,',
    70 + statementOffsetX,
    220 + statementOffsetY,
    {
      width:
        doc.page.width - 140,

      align:
        'center',

      lineGap:
        4,
    }
  );


doc
  .fillColor(
    COLORS.black
  )
  .font(
    'Helvetica'
  )
  .fontSize(
    9.5
  )
  .text(
    'in accordance with the applicable laws and regulations governing Institutions.',
    70 + statementOffsetX,
    255 + statementOffsetY,
    {
      width:
        doc.page.width - 140,

      align:
        'center',

      lineGap:
        4,
    }
  );
}
function drawOrganizationDetails(
  doc,
  certificate
) {
  const snapshot =
    certificate.organizationSnapshot ||
    {};

  drawSectionTitle(
    doc,
    'REGISTERED ORGANIZATION DETAILS',
    361
  );

  const rows = [
  {
    label:
      'Organization Name',

    value:
      snapshot.organizationName ||
      '—',

    height:
      50,

    // Movement controls
    labelOffsetX: 0, // + right | - left
    labelOffsetY: 0, // + down  | - up

    valueOffsetX: 0, // + right | - left
    valueOffsetY: 0, // + down  | - up
  },


  {
    label:
      'Organization Type',

    value:
      snapshot.organizationType ||
      '—',

    height:
      38,

    labelOffsetX: 0,
    labelOffsetY: 0,

    valueOffsetX: 0,
    valueOffsetY: 0,
  },


  {
    label:
      'Registered Address',

    value:
      snapshot.address ||
      '—',

    height:
      38,

    labelOffsetX: 0,
    labelOffsetY: 0,

    valueOffsetX: 0,
    valueOffsetY: 0,
  },
    {
      label:
        'Approved Activity',

      value:
        snapshot.activity ||
        '—',

      height:
        52,
    },
  ];

  let currentY =
    389;

  rows.forEach(
    (
      row,
      index
    ) => {
      drawDetailRow(
        doc,
        61,
        currentY,
        473,
        row.height,
        row.label,
        row.value,
        index %
          2 ===
          0
      );

      currentY +=
        row.height;
    }
  );

  drawDateCards(
    doc,
    certificate,
    currentY +
      11
  );

  return currentY +
    70;
}

function drawSectionTitle(
  doc,
  title,
  y
) {
  doc
    .save()
    .fillColor(
      COLORS.navy
    )
    .roundedRect(
      61,
      y,
      473,
      20,
      3
    )
    .fill()
    .restore();

  doc
    .fillColor(
      COLORS.white
    )
    .font(
      'Helvetica-Bold'
    )
    .fontSize(
      7.5
    )
    .text(
      title,
      72,
      y + 6,
      {
        width:
          451,

        align:
          'center',

        characterSpacing:
          1,
      }
    );
}

function drawDetailRow(
  doc,
  x,
  y,
  width,
  height,
  label,
  value,
  alternate
) {
  doc
    .save()
    .fillColor(
      alternate
        ? COLORS.white
        : COLORS.lightGray
    )
    .strokeColor(
      COLORS.borderGray
    )
    .lineWidth(
      0.7
    )
    .rect(
      x,
      y,
      width,
      height
    )
    .fillAndStroke()
    .restore();

  const labelWidth =
    135;

  doc
    .save()
    .fillColor(
      COLORS.lightGold
    )
    .rect(
      x,
      y,
      labelWidth,
      height
    )
    .fill()
    .restore();

  doc
    .fillColor(
      COLORS.darkNavy
    )
    .font(
      'Helvetica-Bold'
    )
    .fontSize(
      8.2
    )
    .text(
      label,
      x + 10,
      y +
        height / 2 -
        5,
      {
        width:
          labelWidth - 20,
      }
    );

  doc
    .fillColor(
      COLORS.black
    )
    .font(
      'Helvetica'
    )
    .fontSize(
      8.8
    )
    .text(
      value,
      x +
        labelWidth +
        12,
      y + 10,
      {
        width:
          width -
          labelWidth -
          24,

        height:
          height - 18,

        lineGap:
          1.5,

        ellipsis:
          true,
      }
    );
}

function drawDateCards(
  doc,
  certificate,
  y
) {
  drawDateCard(
    doc,
    61,
    y,
    228,
    'DATE OF ISSUE',
    formatCertificateDate(
      certificate.issueDate
    ),
    COLORS.navy
  );

  drawDateCard(
    doc,
    306,
    y,
    228,
    'VALID UNTIL',
    formatCertificateDate(
      certificate.expiryDate
    ),
    COLORS.gold
  );
}

function drawDateCard(
  doc,
  x,
  y,
  width,
  label,
  value,
  accentColor
) {
  doc
    .save()
    .fillColor(
      COLORS.white
    )
    .strokeColor(
      COLORS.borderGray
    )
    .lineWidth(
      0.7
    )
    .roundedRect(
      x,
      y,
      width,
      48,
      5
    )
    .fillAndStroke()
    .restore();

  doc
    .save()
    .fillColor(
      accentColor
    )
    .roundedRect(
      x,
      y,
      7,
      48,
      4
    )
    .fill()
    .restore();

  doc
    .fillColor(
      COLORS.gray
    )
    .font(
      'Helvetica-Bold'
    )
    .fontSize(
      6.7
    )
    .text(
      label,
      x + 18,
      y + 9,
      {
        width:
          width - 28,

        characterSpacing:
          0.8,
      }
    );

  doc
    .fillColor(
      COLORS.darkNavy
    )
    .font(
      'Helvetica-Bold'
    )
    .fontSize(
      11
    )
    .text(
      value,
      x + 18,
      y + 24,
      {
        width:
          width - 28,
      }
    );
}

function drawLegalNotice(
  doc,
  y
) {
  doc
    .save()
    .fillColor(
      COLORS.lightGray
    )
    .strokeColor(
      COLORS.borderGray
    )
    .lineWidth(
      0.6
    )
    .roundedRect(
      61,
      y,
      473,
      42,
      5
    )
    .fillAndStroke()
    .restore();

  doc
    .fillColor(
      COLORS.gold
    )
    .font(
      'Helvetica-Bold'
    )
    .fontSize(
      8
    )
    .text(
      'LEGAL NOTICE',
      73,
      y + 8,
      {
        width:
          80,
      }
    );

  doc
    .fillColor(
      COLORS.gray
    )
    .font(
      'Helvetica'
    )
    .fontSize(
      6.7
    )
    .text(
      'Any person who falsifies, alters or unlawfully reproduces this certificate may be subject to legal action under the applicable laws and Articles 372 and 373 of the Somali Penal Code.',
      73,
      y + 20,
      {
        width:
          449,

        lineGap:
          1.2,
      }
    );
}

async function drawVerificationSection(
  doc,
  certificate,
  y
) {
  doc
    .save()
    .fillColor(
      COLORS.lightGray
    )
    .strokeColor(
      COLORS.borderGray
    )
    .lineWidth(
      0.7
    )
    .roundedRect(
      61,
      y,
      205,
      99,
      6
    )
    .fillAndStroke()
    .restore();

  // Title
  const verificationTitleOffsetX = 0; // + right | - left
  const verificationTitleOffsetY = -5; // + down | - up

  doc
    .fillColor(
      COLORS.navy
    )
    .font(
      'Helvetica-Bold'
    )
    .fontSize(
      7.5
    )
    .text(
      'DIGITAL VERIFICATION',
      73 + verificationTitleOffsetX,
      (y + 11) +
        verificationTitleOffsetY,
      {
        width: 181,
        align: 'center',
        characterSpacing: 0.8,
      }
    );

  // QR position
  const qrOffsetX = 0; // + right | - left
  const qrOffsetY = -10; // + down | - up

  const qrX =
    74 + qrOffsetX;
  const qrY =
    (y + 32) + qrOffsetY;
  const qrSize = 56;

  const verificationUrl =
    certificate?.verificationUrl ||
    `https://jaims.mopic.so/verify/${
      certificate?.verificationCode ||
      certificate?.certificateNumber ||
      ''
    }`;

  try {
    const qrDataUrl =
      await QRCode.toDataURL(
        verificationUrl,
        {
          width: 300,
          margin: 1,
        }
      );

    const qrBase64 =
      qrDataUrl.replace(
        /^data:image\/png;base64,/,
        ''
      );

    doc.image(
      Buffer.from(
        qrBase64,
        'base64'
      ),
      qrX,
      qrY,
      {
        width: qrSize,
        height: qrSize,
      }
    );
  } catch (error) {
    console.error(
      'QR GENERATION ERROR:',
      error
    );

    drawQRPlaceholder(
      doc,
      qrX,
      qrY,
      qrSize
    );
  }

  // Verification description
  const verificationTextOffsetX = 10; // + right | - left
  const verificationTextOffsetY = -15; // + down | - up

  doc
    .fillColor(
      COLORS.gray
    )
    .font(
      'Helvetica'
    )
    .fontSize(
      6.5
    )
    .text(
      'Scan the QR code or use the verification ID to confirm the validity of this certificate.',
      145 +
        verificationTextOffsetX,
      (y + 35) +
        verificationTextOffsetY,
      {
        width: 105,
        lineGap: 1.2,
      }
    );

  // Verification ID label
  const verificationIdOffsetX = 10; // + right | - left
  const verificationIdOffsetY = -10; // + down | - up

  doc
    .fillColor(
      COLORS.darkNavy
    )
    .font(
      'Helvetica-Bold'
    )
    .fontSize(
      6.2
    )
    .text(
  'Certificate Number',
      145 +
        verificationIdOffsetX,
      (y + 70) +
        verificationIdOffsetY,
      {
        width: 105,
      }
    );

  // Verification code
  const verificationCodeOffsetX = 10; // + right | - left
  const verificationCodeOffsetY = -10; // + down | - up

  doc
    .fillColor(
      COLORS.gray
    )
    .font(
      'Helvetica'
    )
    .fontSize(
      5.5
    )
    .text(
  certificate?.certificateNumber ||
    'Not available',
      145 +
        verificationCodeOffsetX,
      (y + 81) +
        verificationCodeOffsetY,
      {
        width: 105,
        ellipsis: true,
      }
    );
}

function drawQRPlaceholder(
  doc,
  x,
  y,
  size
) {
  doc
    .save()
    .fillColor(
      COLORS.white
    )
    .strokeColor(
      COLORS.navy
    )
    .lineWidth(
      1
    )
    .rect(
      x,
      y,
      size,
      size
    )
    .fillAndStroke()
    .restore();

  const block = 6;

  const coordinates = [
    [1, 1],
    [2, 1],
    [3, 1],
    [1, 2],
    [3, 2],
    [1, 3],
    [2, 3],
    [3, 3],

    [6, 1],
    [7, 1],
    [8, 1],
    [6, 2],
    [8, 2],
    [6, 3],
    [7, 3],
    [8, 3],

    [1, 6],
    [2, 6],
    [3, 6],
    [1, 7],
    [3, 7],
    [1, 8],
    [2, 8],
    [3, 8],

    [5, 5],
    [6, 5],
    [8, 5],
    [4, 6],
    [6, 6],
    [7, 6],
    [5, 7],
    [7, 7],
    [8, 7],
    [4, 8],
    [5, 8],
    [7, 8],
  ];

  doc
    .save()
    .fillColor(
      COLORS.darkNavy
    );

  coordinates.forEach(
    ([column, row]) => {
      doc
        .rect(
          x +
            column * block -
            4,
          y +
            row * block -
            4,
          block - 1,
          block - 1
        )
        .fill();
    }
  );

  doc.restore();
}
function drawApprovalSection(
  doc,
  certificate,
  y
) {
const approvalTitleOffsetX = 120;   // + right | - 5
const approvalTitleOffsetY = 0;   // + down  | - up


doc
  .fillColor(
    COLORS.navy
  )
  .font(
    'Helvetica-Bold'
  )
  .fontSize(
    10
  )
  .text(
    'FINAL MINISTRY APPROVAL',
    approvalTitleOffsetX,
    y + approvalTitleOffsetY,
    {
      width:
        doc.page.width,

      align:
        'center',
    }
  );
// Approval text position control
const approvalTextOffsetX = 120;   // + 80 | - 5
const approvalTextOffsetY = 0;  // + down  | - up


doc
  .fillColor(
    COLORS.black
  )
  .font(
    'Helvetica'
  )
  .fontSize(
    8
  )
  .text(
    'Approved and issued under the authority of the Ministry of Planning,',
    90 + approvalTextOffsetX,
    (y + 25) + approvalTextOffsetY,
    {
      width:
        doc.page.width - 180,

      align:
        'center',
    }
  );


doc
  .fillColor(
    COLORS.black
  )
  .font(
    'Helvetica'
  )
  .fontSize(
    8
  )
  .text(
    'Investment and International Cooperation.',
    90 + approvalTextOffsetX,
    (y + 38) + approvalTextOffsetY,
    {
      width:
        doc.page.width - 180,

      align:
        'center',
    }
  );
const stampPath =
  fileURLToPath(
    new URL(
      '../assets/certificates/ministry-stamp.png',
      import.meta.url
    )
  );


const stampOffsetX = 120; // + right | - left
const stampOffsetY = -20; // + down  | - up


doc.image(
  stampPath,
  ((doc.page.width - 65) / 2) + stampOffsetX,
  (y + 70) + stampOffsetY,
  {
    width:
      75,

    height:
      65,
  }
);
}
function drawFooter(
  doc,
  certificate
) {
  const footerY =
    791;

  doc
    .save()
    .strokeColor(
      COLORS.gold
    )
    .lineWidth(
      1.3
    )
    .moveTo(
      61,
      footerY - 12
    )
    .lineTo(
      534,
      footerY - 12
    )
    .stroke()
    .restore();

  doc
    .fillColor(
      COLORS.darkNavy
    )
    .font(
      'Helvetica-Bold'
    )
    .fontSize(
      6.8
    )
    .text(
      'MINISTRY OF PLANNING, INVESTMENT & INTERNATIONAL COOPERATION',
      61,
      footerY,
      {
        width:
          473,

        align:
          'center',

        characterSpacing:
          0.4,
      }
    );

  doc
    .fillColor(
      COLORS.gray
    )
    .font(
      'Helvetica'
    )
    .fontSize(
      6.2
    )
    .text(
      'Kismayo, Jubaland State, Somalia  •  Email: mopic@jubalandstate.so',
      61,
      footerY + 13,
      {
        width:
          473,

        align:
          'center',
      }
    );

  
}
function drawHeader(
  doc
) {

  // Logo movement
  const logoOffsetX = +170; // + right | - left
  const logoOffsetY = -10; // + down  | - up


  drawGovernmentSeal(
    doc,
    105 + logoOffsetX,
    82 + logoOffsetY
  );


  // Jubaland State title movement
  const stateTitleOffsetX = -20; // + right | - left
  const stateTitleOffsetY = +60; // + down  | - up


  doc
    .fillColor(
      COLORS.darkNavy
    )
    .font(
      'Helvetica-Bold'
    )
    .fontSize(
      10
    )
    .text(
      'JUBALAND STATE OF SOMALIA',
      160 + stateTitleOffsetX,
      51 + stateTitleOffsetY,
      {
        width:
          300,

        align:
          'center',

        characterSpacing:
          1,
      }
    );


  // Ministry title movement
  const ministryTitleOffsetX = -20; // + right | - left
  const ministryTitleOffsetY = +60; // + down  | - up


  doc
    .fillColor(
      COLORS.navy
    )
    .font(
      'Helvetica-Bold'
    )
    .fontSize(
      10
    )
    .text(
      'MINISTRY OF PLANNING, INVESTMENT',
      160 + ministryTitleOffsetX,
      70 + ministryTitleOffsetY,
      {
        width:
          300,

        align:
          'center',
      }
    );


  // Cooperation title movement
  const cooperationTitleOffsetX = -20; // + right | - left
  const cooperationTitleOffsetY = +60; // + down  | - up


  doc
    .fontSize(
      10
    )
    .text(
      '& INTERNATIONAL COOPERATION',
      160 + cooperationTitleOffsetX,
      88 + cooperationTitleOffsetY,
      {
        width:
          300,

        align:
          'center',
      }
    );


  // Gold line movement
  const goldLineOffsetX = -20; // + right | - left
  const goldLineOffsetY = +50; // + down  | - up


  doc
    .save()
    .strokeColor(
      COLORS.gold
    )
    .lineWidth(
      2.2
    )
    .moveTo(
      135 + goldLineOffsetX,
      112 + goldLineOffsetY
    )
    .lineTo(
      525 + goldLineOffsetX,
      112 + goldLineOffsetY
    )
    .stroke()
    .restore();


  // Navy line movement
  const navyLineOffsetX = -20; // + right | - left
  const navyLineOffsetY = +50; // + down  | - up


  doc
    .save()
    .strokeColor(
      COLORS.navy
    )
    .lineWidth(
      0.6
    )
    .moveTo(
      165 + navyLineOffsetX,
      117 + navyLineOffsetY
    )
    .lineTo(
      495 + navyLineOffsetX,
      117 + navyLineOffsetY
    )
    .stroke()
    .restore();

}
export async function generateNGOCertificatePDFBuffer(
  certificate
) {
  if (
    !certificate
  ) {
    throw new Error(
      'Certificate record is required to generate PDF'
    );
  }


  return new Promise(
    async (
      resolve,
      reject
    ) => {

      const doc =
        new PDFDocument({
          size:
            'A4',

          margin:
            30,

          compress:
            true,

          info: {

            Title:
              `NGO Registration Certificate - ${certificate.registrationNumber}`,

            Author:
              'Ministry of Planning, Investment & International Cooperation - Jubaland',

            Subject:
              'Official NGO Registration Certificate',

            Keywords:
              'Jubaland NGO registration certificate',

          },
        });


      const chunks =
        [];


      doc.on(
        'data',
        (
          chunk
        ) => {
          chunks.push(
            chunk
          );
        }
      );


      doc.on(
        'end',
        () => {

          resolve(
            Buffer.concat(
              chunks
            )
          );

        }
      );


      doc.on(
        'error',
        (
          error
        ) => {

          reject(
            error
          );

        }
      );


      try {

        drawOuterBorder(
          doc
        );


        drawWatermark(
          doc
        );


        drawHeader(
          doc
        );


        drawTitle(
          doc,
          certificate
        );


        drawCertificateIdentifiers(
          doc,
          certificate
        );


        drawCertificationStatement(
          doc
        );


        const detailsBottom =
          drawOrganizationDetails(
            doc,
            certificate
          );


        drawLegalNotice(
          doc,
          detailsBottom + 8
        );


        await drawVerificationSection(
          doc,
          certificate,
          detailsBottom + 59
        );


        drawApprovalSection(
          doc,
          certificate,
          detailsBottom + 59
        );


        drawFooter(
          doc,
          certificate
        );


        doc.end();


      } catch (error) {

        console.error(
          "NGO CERTIFICATE PDF GENERATION ERROR:",
          error
        );


        reject(
          error
        );

      }

    }
  );
}
export async function generateAndStoreNGOCertificate(
  certificate
) {
  if (
    !certificate
      ?.registrationNumber
  ) {
    throw new Error(
      'Certificate registration number is required'
    );
  }

  if (
    !certificate
      ?.certificateNumber
  ) {
    throw new Error(
      'Certificate number is required'
    );
  }

  const pdfBuffer =
    await generateNGOCertificatePDFBuffer(
      certificate
    );

  const fileName =
    `${certificate.certificateNumber}.pdf`;

  const storedFile =
    await storeNGOCertificateFile({
      registrationNumber:
        certificate.registrationNumber,

      file: {
        originalname:
          fileName,

        mimetype:
          'application/pdf',

        buffer:
          pdfBuffer,
      },
    });

  return {
    fileName:
      storedFile.fileName,

    mimeType:
      storedFile.mimeType,

    storageType:
      storedFile.storageType,

    storageKey:
      storedFile.key,

    url:
      storedFile.url,

    generatedAt:
      new Date(),
  };
}