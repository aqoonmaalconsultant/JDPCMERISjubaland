import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import { District } from '../models/District.js';
import { Donor } from '../models/Donor.js';
import { Evaluation } from '../models/Evaluation.js';
import { FinancialTransaction } from '../models/FinancialTransaction.js';
import { Indicator } from '../models/Indicator.js';
import { Ministry } from '../models/Ministry.js';
import { Partner } from '../models/Partner.js';
import { Project } from '../models/Project.js';
import { Region } from '../models/Region.js';
import { Setting } from '../models/Setting.js';
import { User } from '../models/User.js';
import { Village } from '../models/Village.js';
import { Roles } from '../security/roles.js';

dotenv.config();

await connectDatabase();console.log('STEP 1: Database connected');

const ministries = [
  { name: 'Ministry of Planning and International Cooperation', code: 'MOPIC' },
  { name: 'Ministry of Health', code: 'MOH' },
  { name: 'Ministry of Public Works', code: 'MOPW' },
  { name: 'Ministry of Water and Energy', code: 'MOWE' },
  { name: 'Ministry of Education and Higher Learning', code: 'MOE' },
  { name: 'Ministry of Agriculture and Irrigation', code: 'MOAI' }
];

const regions = [
  { name: 'Gedo', code: 'GED' },
  { name: 'Lower Juba', code: 'LJ' },
  { name: 'Middle Juba', code: 'MJ' }
];
console.log('STEP 2: Seeding ministries...');
const ministryDocs = {};
for (const ministry of ministries) {
  const result = await Ministry.findOneAndUpdate(
    { code: ministry.code },
    { $setOnInsert: ministry },
    { upsert: true, new: true }
  );
  ministryDocs[ministry.code] = result;
}
console.log('STEP 3: Seeding regions...');
const regionDocs = {};
for (const region of regions) {
  const result = await Region.findOneAndUpdate(
    { code: region.code },
    { $setOnInsert: region },
    { upsert: true, new: true }
  );
  regionDocs[region.name] = result;
}
console.log('STEP 4: Seeding districts...');
const districts = [
  { name: 'Kismayo', code: 'KIS', region: regionDocs['Lower Juba']._id },
  { name: 'Afmadow', code: 'AFM', region: regionDocs['Lower Juba']._id },
  { name: 'Garbaharey', code: 'GAR', region: regionDocs.Gedo._id },
  { name: "Bu'aale", code: 'BUA', region: regionDocs['Middle Juba']._id }
];

for (const district of districts) {
  await District.findOneAndUpdate(
    { code: district.code, region: district.region },
    { $setOnInsert: district },
    { upsert: true, new: true }
  );
}

const districtDocs = {};
for (const district of await District.find().populate('region')) {
  districtDocs[district.code] = district;
}
console.log('STEP 5: Seeding villages...');
const villages = [
  { name: 'Kismayo Town', code: 'KIS-TWN', district: districtDocs.KIS._id },
  { name: 'Afmadow Town', code: 'AFM-TWN', district: districtDocs.AFM._id },
  { name: 'Garbaharey Town', code: 'GAR-TWN', district: districtDocs.GAR._id },
  { name: "Bu'aale Town", code: 'BUA-TWN', district: districtDocs.BUA._id }
];

for (const village of villages) {
  await Village.findOneAndUpdate(
    { code: village.code, district: village.district },
    { $setOnInsert: village },
    { upsert: true, new: true }
  );
}

const donorDocs = {};
const donors = [
  { name: 'World Bank', country: 'International', contactPerson: 'Portfolio Manager', email: 'somalia@worldbank.org' },
  { name: 'UNICEF', country: 'International', contactPerson: 'Programme Lead', email: 'somalia@unicef.org' },
  { name: 'European Union', country: 'European Union', contactPerson: 'Cooperation Officer', email: 'delegation-somalia@eeas.europa.eu' }
];

for (const donor of donors) {
  const result = await Donor.findOneAndUpdate(
    { name: donor.name },
    { $setOnInsert: donor },
    { upsert: true, new: true }
  );
  donorDocs[donor.name] = result;
}

const partnerDocs = {};
const partners = [
  { organizationName: 'Jubaland Aid Coordination Office', type: 'Government' },
  { organizationName: 'Somali Resilience Network', type: 'NGO' },
  { organizationName: 'UNOPS Somalia', type: 'UN Agency' }
];

for (const partner of partners) {
  const result = await Partner.findOneAndUpdate(
    { organizationName: partner.organizationName },
    { $setOnInsert: partner },
    { upsert: true, new: true }
  );
  partnerDocs[partner.organizationName] = result;
}

const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@jdpcmeris.gov.so';
const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';

let admin = await User.findOne({ email: adminEmail });

if (!admin) {
  admin = new User({
    name: 'System Administrator',
    email: adminEmail,
    role: Roles.SUPER_ADMIN
  });
  await admin.setPassword(adminPassword);
  await admin.save();
}

const sampleProjects = [
  {
    projectName: 'Kismayo Water Supply Rehabilitation',
    projectCode: 'JDP-001',
    description: 'Rehabilitation of water infrastructure and service delivery in Kismayo.',
    objectives: ['Improve urban water access', 'Reduce waterborne disease risks'],
    outcomes: ['Expanded clean water coverage', 'Improved municipal service reliability'],
    ministry: ministryDocs.MOWE._id,
    donor: donorDocs['World Bank']._id,
    partner: partnerDocs['Jubaland Aid Coordination Office']._id,
    contractor: 'Kismayo Civil Works Ltd',
    sector: 'Water',
    budget: 12400000,
    currency: 'USD',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2026-11-30'),
    status: 'Implementation',
    approvalStage: 'Approved',
    visibility: 'public',
    locations: [{ region: regionDocs['Lower Juba']._id, district: districtDocs.KIS._id, village: 'Kismayo', latitude: 0.3582, longitude: 42.5454 }],
    beneficiaries: { householdCount: 12800, individuals: 76800, male: 37600, female: 39200, disabilityStatus: 980 },
    physicalProgress: 67,
    financialProgress: 54,
    timelineProgress: 61,
    trafficLight: 'Green',
    createdBy: admin._id,
    updatedBy: admin._id
  },
  {
    projectName: 'Gedo Primary Healthcare Expansion',
    projectCode: 'JDP-002',
    description: 'Health facility expansion and maternal-child health support in Gedo.',
    objectives: ['Increase healthcare access', 'Strengthen referral services'],
    outcomes: ['More functional primary care facilities', 'Improved maternal and child health coverage'],
    ministry: ministryDocs.MOH._id,
    donor: donorDocs.UNICEF._id,
    partner: partnerDocs['UNOPS Somalia']._id,
    sector: 'Health',
    budget: 8200000,
    currency: 'USD',
    startDate: new Date('2024-09-01'),
    endDate: new Date('2026-03-31'),
    status: 'Monitoring',
    approvalStage: 'Approved',
    visibility: 'public',
    locations: [{ region: regionDocs.Gedo._id, district: districtDocs.GAR._id, village: 'Garbaharey', latitude: 3.3289, longitude: 42.2209 }],
    beneficiaries: { householdCount: 9300, individuals: 55800, male: 27100, female: 28700, disabilityStatus: 720 },
    physicalProgress: 84,
    financialProgress: 79,
    timelineProgress: 82,
    trafficLight: 'Green',
    createdBy: admin._id,
    updatedBy: admin._id
  },
  {
    projectName: 'Middle Juba Farm Access Roads',
    projectCode: 'JDP-003',
    description: 'Construction and rehabilitation of farm access roads linking rural producers to markets.',
    objectives: ['Improve market access', 'Reduce transport time for agricultural products'],
    outcomes: ['Improved rural road connectivity', 'Lower post-harvest losses'],
    ministry: ministryDocs.MOPW._id,
    donor: donorDocs['European Union']._id,
    partner: partnerDocs['Somali Resilience Network']._id,
    contractor: 'Juba Roads Consortium',
    sector: 'Infrastructure',
    budget: 18500000,
    currency: 'USD',
    startDate: new Date('2025-06-01'),
    endDate: new Date('2027-05-30'),
    status: 'Procurement',
    approvalStage: 'Approved',
    visibility: 'public',
    locations: [{ region: regionDocs['Middle Juba']._id, district: districtDocs.BUA._id, village: "Bu'aale", latitude: 1.0833, longitude: 42.5833 }],
    beneficiaries: { householdCount: 7100, individuals: 42600, male: 21000, female: 21600, disabilityStatus: 430 },
    physicalProgress: 22,
    financialProgress: 13,
    timelineProgress: 25,
    trafficLight: 'Yellow',
    createdBy: admin._id,
    updatedBy: admin._id
  }
];

for (const project of sampleProjects) {
  await Project.updateOne(
    { projectCode: project.projectCode },
    { $set: project },
    { upsert: true }
  );
}

const seededProjects = await Project.find({ projectCode: { $in: sampleProjects.map((project) => project.projectCode) } });
const projectDocs = Object.fromEntries(seededProjects.map((project) => [project.projectCode, project]));

const evaluations = [
  {
    project: projectDocs['JDP-001']._id,
    evaluationType: 'Midterm Evaluation',
    evaluationDate: new Date('2026-01-20'),
    evaluatorName: 'MOPIC M&E Directorate',
    findings: 'Water kiosks and borehole rehabilitation are progressing in line with the implementation plan.',
    lessonsLearned: 'Community water committees improve uptime where they are trained early.',
    recommendations: 'Accelerate spare-parts framework agreements before the rainy season.',
    score: 78,
    submittedBy: admin._id
  },
  {
    project: projectDocs['JDP-002']._id,
    evaluationType: 'Final Evaluation',
    evaluationDate: new Date('2026-02-15'),
    evaluatorName: 'Health Sector Review Team',
    findings: 'Primary care facility coverage improved and referral pathways are functioning.',
    lessonsLearned: 'Joint supervision with district health teams improved data quality.',
    recommendations: 'Maintain staffing support in hard-to-reach areas.',
    score: 86,
    submittedBy: admin._id
  }
];

for (const evaluation of evaluations) {
  await Evaluation.findOneAndUpdate(
    { project: evaluation.project, evaluationType: evaluation.evaluationType },
    { $set: evaluation },
    { upsert: true, new: true }
  );
}

const indicators = [
  { project: projectDocs['JDP-001']._id, level: 'Goal', code: 'WASH-G1', name: 'Improved access to safe water', unit: 'people', baseline: 35000, target: 90000, actual: 76800, updatedBy: admin._id },
  { project: projectDocs['JDP-001']._id, level: 'Output', code: 'WASH-O1', name: 'Functional water points rehabilitated', unit: 'sites', baseline: 4, target: 18, actual: 12, updatedBy: admin._id },
  { project: projectDocs['JDP-002']._id, level: 'Outcome', code: 'HLTH-OC1', name: 'Population covered by primary healthcare', unit: 'people', baseline: 24000, target: 60000, actual: 55800, updatedBy: admin._id },
  { project: projectDocs['JDP-003']._id, level: 'Indicator', code: 'ROAD-I1', name: 'Kilometers of farm access roads rehabilitated', unit: 'km', baseline: 0, target: 85, actual: 19, updatedBy: admin._id }
];

for (const indicator of indicators) {
  const row = await Indicator.findOne({ project: indicator.project, code: indicator.code });
  if (row) {
    Object.assign(row, indicator);
    await row.save();
  } else {
    await Indicator.create(indicator);
  }
}

const financialTransactions = [
  { project: projectDocs['JDP-001']._id, type: 'Disbursement', amount: 6900000, currency: 'USD', transactionDate: new Date('2025-03-01'), fundingSource: 'World Bank', description: 'First and second tranche', recordedBy: admin._id },
  { project: projectDocs['JDP-001']._id, type: 'Expenditure', amount: 6696000, currency: 'USD', transactionDate: new Date('2026-01-31'), fundingSource: 'World Bank', description: 'Civil works, equipment, and supervision', recordedBy: admin._id },
  { project: projectDocs['JDP-002']._id, type: 'Disbursement', amount: 7100000, currency: 'USD', transactionDate: new Date('2025-11-30'), fundingSource: 'UNICEF', description: 'Health facility expansion funding', recordedBy: admin._id },
  { project: projectDocs['JDP-002']._id, type: 'Expenditure', amount: 6478000, currency: 'USD', transactionDate: new Date('2026-02-28'), fundingSource: 'UNICEF', description: 'Facility rehabilitation and medical equipment', recordedBy: admin._id },
  { project: projectDocs['JDP-003']._id, type: 'Disbursement', amount: 3500000, currency: 'USD', transactionDate: new Date('2025-09-10'), fundingSource: 'European Union', description: 'Procurement mobilization funding', recordedBy: admin._id },
  { project: projectDocs['JDP-003']._id, type: 'Expenditure', amount: 2405000, currency: 'USD', transactionDate: new Date('2026-02-20'), fundingSource: 'European Union', description: 'Design, surveys, and procurement costs', recordedBy: admin._id }
];

for (const transaction of financialTransactions) {
  await FinancialTransaction.findOneAndUpdate(
    { project: transaction.project, type: transaction.type, transactionDate: transaction.transactionDate, amount: transaction.amount },
    { $set: transaction },
    { upsert: true, new: true }
  );
}

const settings = [
  {
    key: 'system.name',
    value: 'Jubaland Projects Management Portal',
    category: 'system',
    description: 'Official platform name',
    isPublic: true
  },
  {
    key: 'alerts.missingReportDays',
    value: 30,
    category: 'notifications',
    description: 'Days before a project is flagged for missing monitoring reports',
    isPublic: false
  },
  {
    key: 'public.portal.enabled',
    value: true,
    category: 'public',
    description: 'Enable public portal',
    isPublic: true
  }
];

for (const setting of settings) {
  await Setting.updateOne({ key: setting.key }, { $setOnInsert: setting }, { upsert: true });
}

console.log(`Seed complete. Admin: ${adminEmail}`);
await process.exit(0);
