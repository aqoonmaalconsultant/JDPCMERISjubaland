import 'dotenv/config';
import mongoose from 'mongoose';

import { ProjectLocation } from '../models/ProjectLocation.js';
import { Project } from '../models/Project.js';

async function migrateProjectLocationsToProjects() {
  const locations = await ProjectLocation.find({}).lean();

  console.log(`Found ${locations.length} project location records.`);

  let migrated = 0;
  let alreadyMigrated = 0;
  let skipped = 0;

  for (const location of locations) {
    if (!location.project) {
      console.warn(
        `Skipped ${location._id}: project reference is missing.`
      );

      skipped += 1;
      continue;
    }

    // Check whether this already points to an official Project.
    const existingProject = await Project.findById(location.project)
      .select('_id projectCode projectName')
      .lean();

    if (existingProject) {
      console.log(
        `Already migrated: ${location._id} -> ${existingProject.projectCode}`
      );

      alreadyMigrated += 1;
      continue;
    }

    // Old structure:
    // ProjectLocation.project = ProjectApplication._id
    //
    // Find the official Project created from that application.
    const officialProject = await Project.findOne({
      application: location.project,
    })
      .select('_id application projectCode projectName')
      .lean();

    if (!officialProject) {
      console.warn(
        `Skipped ${location._id}: no official Project found for application ${location.project}`
      );

      skipped += 1;
      continue;
    }

    await ProjectLocation.updateOne(
      { _id: location._id },
      {
        $set: {
          project: officialProject._id,
        },
      }
    );

    console.log(
      `Migrated ${location._id} -> ${officialProject.projectCode} (${officialProject.projectName})`
    );

    migrated += 1;
  }

  console.log('\nMigration summary');
  console.log('------------------------------');
  console.log(`Total locations:    ${locations.length}`);
  console.log(`Migrated:           ${migrated}`);
  console.log(`Already migrated:   ${alreadyMigrated}`);
  console.log(`Skipped:            ${skipped}`);
}

async function main() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  });

  console.log('MongoDB connected');

  try {
    await migrateProjectLocationsToProjects();
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});