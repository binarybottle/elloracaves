#!/usr/bin/env node

/**
 * Migration script to update old-style links to new unified explorer format
 * 
 * Usage: node src/scripts/update-links.js [--dry-run]
 * 
 * This script will:
 * 1. Find all .tsx and .ts files in src/
 * 2. Replace old link patterns with new explore links
 * 3. Report changes made
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');

// Pattern replacements
const replacements = [
  {
    name: 'Cave detail links',
    pattern: /href=\{`\/caves\/\$\{([^}]+)\}`\}/g,
    replacement: 'href={`/explore?cave=${$1}&floor=1`}',
  },
  {
    name: 'Cave detail links (template)',
    pattern: /href=\{`\/caves\/\$\{([^}]+)\}\/floor\/\$\{([^}]+)\}`\}/g,
    replacement: 'href={`/explore?cave=${$1}&floor=${$2}`}',
  },
  {
    name: 'Cave detail links (string)',
    pattern: /href="\/caves\/(\d+)"/g,
    replacement: 'href="/explore?cave=$1&floor=1"',
  },
  {
    name: 'Floor detail links (string)',
    pattern: /href="\/caves\/(\d+)\/floor\/(\d+)"/g,
    replacement: 'href="/explore?cave=$1&floor=$2"',
  },
];

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (file !== 'node_modules' && file !== '.next' && file !== 'public') {
        walkDir(filePath, callback);
      }
    } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts'))) {
      callback(filePath);
    }
  });
}

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const changes = [];
  
  replacements.forEach(({ name, pattern, replacement }) => {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      modified = true;
      changes.push(`  - ${name}: ${matches.length} occurrence(s)`);
    }
  });
  
  if (modified) {
    console.log(`\n📝 ${filePath}`);
    changes.forEach((change) => console.log(change));
    
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('   ✅ Updated');
    } else {
      console.log('   ⏭️  Skipped (dry run)');
    }
    
    return true;
  }
  
  return false;
}

function main() {
  console.log('🔍 Scanning for link updates...\n');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no files will be modified)' : 'LIVE (files will be updated)'}\n`);
  
  const srcDir = path.join(__dirname, '..', '..');
  let filesUpdated = 0;
  
  walkDir(srcDir, (filePath) => {
    if (updateFile(filePath)) {
      filesUpdated++;
    }
  });
  
  console.log(`\n✨ Complete! ${filesUpdated} file(s) would be updated.`);
  
  if (DRY_RUN) {
    console.log('\n💡 Run without --dry-run flag to apply changes.');
  }
}

main();

