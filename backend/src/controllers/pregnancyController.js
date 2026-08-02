// Static pregnancy week-wise data
const pregnancyData = {
  1: { week: 1, title: "Week 1-2: Conception", babySize: "Microscopic", symptoms: ["No noticeable symptoms yet", "Period may be late by end of week 2"], tips: ["Start taking folic acid (400mcg daily)", "Avoid alcohol and smoking", "Eat a balanced diet rich in folate"], diet: ["Leafy greens (spinach, methi)", "Lentils (dal)", "Fortified cereals", "Citrus fruits"], development: "Fertilization occurs. The fertilized egg begins dividing and travels to the uterus." },
  2: { week: 2, title: "Week 2: Implantation", babySize: "Microscopic", symptoms: ["Light spotting possible", "Mild cramping"], tips: ["Continue folic acid", "Stay hydrated", "Get adequate rest"], diet: ["Whole grains", "Lean proteins", "Fresh fruits", "Dairy products"], development: "The blastocyst implants into the uterine wall." },
  3: { week: 3, title: "Week 3: Early Development", babySize: "Poppy seed", symptoms: ["Fatigue", "Breast tenderness", "Mood changes"], tips: ["Avoid raw or undercooked food", "Limit caffeine", "Start prenatal vitamins"], diet: ["Iron-rich foods (dates, jaggery)", "Protein (eggs, paneer)", "Calcium-rich foods", "Nuts and seeds"], development: "The embryo is forming. Neural tube begins developing." },
  4: { week: 4, title: "Week 4: Missed Period", babySize: "Poppy seed", symptoms: ["Missed period", "Nausea may begin", "Fatigue", "Frequent urination"], tips: ["Take a pregnancy test", "Schedule first prenatal visit", "Avoid medications without doctor advice"], diet: ["Ginger tea for nausea", "Small frequent meals", "Bananas", "Coconut water"], development: "Heart begins to form. The embryo is about 2mm long." },
  8: { week: 8, title: "Week 8: Baby's Features Form", babySize: "Raspberry", symptoms: ["Morning sickness", "Food aversions", "Heightened smell", "Mood swings"], tips: ["Eat small meals throughout the day", "Wear comfortable clothing", "Get enough sleep (8-9 hours)"], diet: ["Protein-rich foods", "Complex carbohydrates", "Yogurt/curd", "Seasonal fruits"], development: "Fingers and toes are forming. Baby's facial features are developing." },
  12: { week: 12, title: "Week 12: End of First Trimester", babySize: "Lime", symptoms: ["Nausea may reduce", "Energy returning", "Visible baby bump starting"], tips: ["First trimester screening", "Share the news if comfortable", "Start gentle exercise (walking, yoga)"], diet: ["Calcium-rich foods (milk, ragi)", "Iron supplements as prescribed", "Fresh vegetables", "Healthy fats (ghee, coconut)"], development: "Baby can move! Organs are formed and maturing. About 5.5cm long." },
  16: { week: 16, title: "Week 16: Gender Can Be Determined", babySize: "Avocado", symptoms: ["Growing belly", "Better energy levels", "Possible back pain", "Skin changes"], tips: ["Anomaly scan around 18-20 weeks", "Start using stretch mark cream", "Practice Kegel exercises"], diet: ["Omega-3 fatty acids (walnuts, flaxseeds)", "Green vegetables", "Whole milk", "Sprouts"], development: "Baby can hear sounds. Movements become more coordinated." },
  20: { week: 20, title: "Week 20: Halfway There!", babySize: "Banana", symptoms: ["Feeling baby kicks!", "Round ligament pain", "Leg cramps", "Increased appetite"], tips: ["Enjoy feeling the baby move", "Stay active with prenatal exercises", "Monitor weight gain"], diet: ["High-fiber foods", "Iron-rich foods", "Plenty of water (3L/day)", "DHA-rich foods"], development: "Baby is about 25cm long. Can suck thumb and yawn." },
  24: { week: 24, title: "Week 24: Viability Milestone", babySize: "Corn on the cob", symptoms: ["Braxton Hicks contractions", "Swollen feet", "Difficulty sleeping", "Heartburn"], tips: ["Glucose tolerance test (24-28 weeks)", "Sleep on your left side", "Elevate feet when resting"], diet: ["Small frequent meals for heartburn", "Potassium-rich foods (bananas)", "Protein at every meal", "Limit salt for swelling"], development: "Lungs are developing. Baby responds to light and sound." },
  28: { week: 28, title: "Week 28: Third Trimester Begins", babySize: "Eggplant", symptoms: ["Shortness of breath", "Frequent urination returns", "Back pain", "Trouble sleeping"], tips: ["Start counting kick counts (10 in 2 hours)", "Attend childbirth classes", "Prepare hospital bag list"], diet: ["Calcium and Vitamin D", "Protein-rich snacks", "Dates (shown to help labor)", "Hydrating foods"], development: "Baby can open eyes. Brain developing rapidly. About 38cm long." },
  32: { week: 32, title: "Week 32: Getting Ready", babySize: "Squash", symptoms: ["Frequent bathroom trips", "Difficulty breathing", "Pelvic pressure", "Nesting instinct"], tips: ["Pack your hospital bag", "Finalize birth plan", "Install car seat", "Pre-register at hospital"], diet: ["Energy-rich foods", "Iron-rich foods (prevent anemia)", "Ghee (traditional aid for delivery)", "Coconut water"], development: "Baby is practicing breathing. All organs are nearly mature." },
  36: { week: 36, title: "Week 36: Almost There", babySize: "Honeydew melon", symptoms: ["Baby dropping lower", "Easier breathing", "Increased pelvic pressure", "Cervical changes"], tips: ["Weekly check-ups now", "Rest as much as possible", "Practice breathing exercises", "Keep hospital bag ready"], diet: ["Dates (6 per day may help labor)", "Light, easy-to-digest meals", "Plenty of fluids", "Protein for energy"], development: "Baby is considered early term. Most organs are mature except lungs." },
  40: { week: 40, title: "Week 40: Due Date!", babySize: "Watermelon", symptoms: ["Contractions may start", "Mucus plug discharge", "Water breaking", "Extreme nesting"], tips: ["Know the signs of labor", "Time your contractions", "Stay calm and positive", "Call doctor when contractions are 5 min apart"], diet: ["Light meals during early labor", "Stay hydrated", "Energy snacks for labor", "Honey water"], development: "Baby is fully developed! Average weight 3-3.5kg, length about 50cm." },
};

// GET /api/pregnancy/:week
exports.getWeekInfo = (req, res) => {
  try {
    const week = parseInt(req.params.week);
    if (isNaN(week) || week < 1 || week > 42) {
      return res.status(400).json({ success: false, message: 'Week must be between 1 and 42' });
    }

    // Find the closest available week
    const availableWeeks = Object.keys(pregnancyData).map(Number).sort((a, b) => a - b);
    let closest = availableWeeks[0];
    for (const w of availableWeeks) {
      if (w <= week) closest = w;
      else break;
    }

    const data = pregnancyData[closest];

    res.json({
      success: true,
      requestedWeek: week,
      data: { ...data, week: closest },
      availableWeeks,
      disclaimer: '🤰 This information is for educational purposes only. Always follow your doctor\'s specific advice for your pregnancy.',
    });
  } catch (error) {
    console.error('Pregnancy info error:', error);
    res.status(500).json({ success: false, message: 'Failed to get pregnancy information' });
  }
};

// GET /api/pregnancy — get all weeks overview
exports.getAllWeeks = (req, res) => {
  const overview = Object.values(pregnancyData).map(w => ({
    week: w.week,
    title: w.title,
    babySize: w.babySize,
  }));

  res.json({ success: true, weeks: overview });
};
