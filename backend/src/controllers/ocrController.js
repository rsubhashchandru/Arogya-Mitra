const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `ocr-${Date.now()}${path.extname(file.originalname)}`);
  },
});

exports.upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|bmp|webp|tiff/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

// POST /api/ocr
exports.extractText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const filePath = req.file.path;

    const { data: { text, confidence } } = await Tesseract.recognize(filePath, 'eng', {
      logger: m => { if (m.status === 'recognizing text') process.stdout.write(`\rOCR Progress: ${(m.progress * 100).toFixed(0)}%`); }
    });

    fs.unlink(filePath, () => {});

    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const simplified = simplifyPrescription(lines, text);

    console.log('\n');
    res.json({
      success: true,
      rawText: text,
      simplified,
      confidence: Math.round(confidence),
      lineCount: lines.length,
      // Text ready for speech synthesis on frontend
      speechText: generateSpeechText(simplified),
    });
  } catch (error) {
    console.error('OCR error:', error);
    res.status(500).json({ success: false, message: 'Failed to extract text from image' });
  }
};

function simplifyPrescription(lines, fullText) {
  const medicines = [];
  const instructions = [];
  const other = [];

  const medicinePatterns = /tab|cap|syrup|mg|ml|drops|ointment|cream|gel|injection|inj|tablet|capsule/i;
  const timingPatterns = /morning|evening|night|before|after|meal|empty stomach|bd|td|od|sos|prn|daily|twice|thrice/i;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (medicinePatterns.test(trimmed)) {
      const med = parseMedicineLine(trimmed);
      medicines.push(med);
    } else if (timingPatterns.test(trimmed)) {
      instructions.push(trimmed);
    } else if (trimmed.length > 3) {
      other.push(trimmed);
    }
  });

  return { medicines, instructions, other };
}

function parseMedicineLine(line) {
  const result = {
    raw: line,
    name: line,
    whenToTake: 'As directed by doctor',
    duration: 'As prescribed',
    simpleInstruction: '',
  };

  // Extract medicine name (first meaningful word group)
  const nameMatch = line.match(/(Tab|Cap|Syrup|Inj|Drops|Cream|Gel|Ointment)[\.\s]*([A-Za-z\s\-]+)/i);
  if (nameMatch) {
    result.name = `${nameMatch[1]}. ${nameMatch[2]}`.trim();
  }

  // Extract timing
  if (/morning/i.test(line)) result.whenToTake = '🌅 Morning';
  if (/night|bedtime/i.test(line)) result.whenToTake = '🌙 Night';
  if (/evening/i.test(line)) result.whenToTake = '🌇 Evening';
  if (/bd|twice/i.test(line)) result.whenToTake = '🌅 Morning & 🌙 Night';
  if (/td|thrice|tds/i.test(line)) result.whenToTake = '🌅 Morning, ☀️ Afternoon & 🌙 Night';
  if (/od|once/i.test(line)) result.whenToTake = '☀️ Once daily';
  if (/sos/i.test(line)) result.whenToTake = '⚡ When needed (SOS)';
  if (/before\s*(food|meal)/i.test(line)) result.whenToTake += ' — Before food';
  if (/after\s*(food|meal)/i.test(line)) result.whenToTake += ' — After food';
  if (/empty\s*stomach/i.test(line)) result.whenToTake += ' — Empty stomach';

  // Extract duration
  const durMatch = line.match(/(\d+)\s*(days?|weeks?|months?)/i);
  if (durMatch) result.duration = `${durMatch[1]} ${durMatch[2]}`;

  // Generate simple instruction
  result.simpleInstruction = `Take ${result.name} — ${result.whenToTake} for ${result.duration}`;

  return result;
}

function generateSpeechText(simplified) {
  let speech = 'Here are your medicine instructions. ';

  if (simplified.medicines.length > 0) {
    simplified.medicines.forEach((med, i) => {
      speech += `Medicine ${i + 1}: ${med.name}. Take it ${med.whenToTake.replace(/[🌅🌙🌇☀️⚡]/g, '')} for ${med.duration}. `;
    });
  } else {
    speech += 'No specific medicines were detected in the prescription. ';
  }

  if (simplified.instructions.length > 0) {
    speech += 'Additional instructions: ' + simplified.instructions.join('. ') + '. ';
  }

  speech += 'Please follow your doctor\'s advice carefully. This is a simplified version for your reference.';
  return speech;
}
