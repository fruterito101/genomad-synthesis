const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/locales');
const LANGUAGES = ['es', 'en'];

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      keys = keys.concat(getKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

function validateTranslations() {
  console.log('🔍 Validating translation files...\n');
  
  const translations = LANGUAGES.map(lang => {
    const filePath = path.join(LOCALES_DIR, lang, 'translation.json');
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      return { lang, keys: getKeys(parsed), valid: true };
    } catch (error) {
      console.error(`❌ Error reading ${lang}/translation.json:`, error.message);
      return { lang, keys: [], valid: false };
    }
  });

  // Check if all files are valid JSON
  const invalidFiles = translations.filter(t => !t.valid);
  if (invalidFiles.length > 0) {
    console.error('❌ Some translation files are invalid');
    process.exit(1);
  }

  const [source, ...targets] = translations;
  let hasError = false;

  console.log(`📊 Source (${source.lang}): ${source.keys.length} keys\n`);

  targets.forEach(target => {
    const missingInTarget = source.keys.filter(k => !target.keys.includes(k));
    const extraInTarget = target.keys.filter(k => !source.keys.includes(k));

    console.log(`📊 Target (${target.lang}): ${target.keys.length} keys`);

    if (missingInTarget.length > 0) {
      hasError = true;
      console.error(`\n❌ Missing in ${target.lang}:`);
      missingInTarget.forEach(k => console.error(`   - ${k}`));
    }

    if (extraInTarget.length > 0) {
      hasError = true;
      console.error(`\n⚠️  Extra in ${target.lang} (not in ${source.lang}):`);
      extraInTarget.forEach(k => console.error(`   - ${k}`));
    }
  });

  console.log('');

  if (hasError) {
    console.error('❌ Validation FAILED - Fix the issues above');
    process.exit(1);
  }

  console.log('✅ Validation PASSED - All translations are in sync!');
  console.log(`   Total keys: ${source.keys.length}`);
}

validateTranslations();
