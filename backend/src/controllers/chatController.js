const prisma = require('../lib/prisma');

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message is required' });

    let userRole = 'patient', userContext = '';
    if (req.userId) {
      const user = await prisma.user.findUnique({ where: { id: req.userId } });
      if (user) {
        userRole = user.role;
        userContext = `Patient: ${user.name}, Age: ${user.age || 'unknown'}, Gender: ${user.gender || 'unknown'}.`;
      }
    }

    let reply;
    if (userRole === 'doctor') {
      reply = generateDoctorAssistant(message);
    } else if (isPregnancyQuery(message)) {
      reply = generatePregnancyResponse(message);
    } else {
      reply = generateDetailedHealthResponse(message, userContext);
    }

    // Try OpenAI if available
    if (process.env.OPENAI_API_KEY) {
      try {
        const OpenAI = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const systemPrompt = userRole === 'doctor' ? DOCTOR_PROMPT : isPregnancyQuery(message) ? PREGNANCY_PROMPT : PATIENT_PROMPT(userContext);
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }],
          max_tokens: 600, temperature: 0.7,
        });
        reply = completion.choices[0].message.content;
      } catch (e) { console.error('OpenAI fallback:', e.message); }
    }

    const disclaimer = userRole === 'doctor'
      ? '🩺 AI-assisted clinical summary. Verify independently.'
      : '⚕️ This is general health information only. Always consult a qualified doctor for diagnosis and treatment.';

    res.json({ success: true, reply, disclaimer, mode: userRole === 'doctor' ? 'doctor_assistant' : 'patient_assistant' });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, message: 'Failed to process message' });
  }
};

// ─── SYSTEM PROMPTS ───

const DOCTOR_PROMPT = `You are a clinical assistant for doctors on Arogya Mitra.
When a doctor shares patient symptoms:
1. **Summary**: Brief clinical summary
2. **Key Symptoms**: Bullet list
3. **Possible Concerns**: Areas to investigate (NOT final diagnosis)
4. **Suggested Investigations**: Lab tests or imaging if relevant
5. **Red Flags**: Any emergency signs to watch for
Keep it concise and clinical. Never give final diagnosis.`;

const PREGNANCY_PROMPT = `You are a pregnancy health assistant.
Rules: Be extra careful, avoid risky suggestions, keep answers gentle.
Structure:
1. **Tips**: Safe pregnancy advice
2. **Diet**: Recommended foods and what to avoid
3. **Warning Signs**: When to rush to doctor
Always end with: "This is not a medical diagnosis. Please consult your doctor."`;

const PATIENT_PROMPT = (ctx) => `You are Arogya Mitra, an AI health assistant for an Indian healthcare platform.
${ctx}

RULES:
- NEVER diagnose or prescribe specific medicines
- Always recommend consulting a doctor for serious/persistent symptoms
- Be empathetic, supportive, and easy to understand
- Use simple language suitable for all literacy levels

For EVERY response, structure your answer as:

**🔍 What might be happening:**
Brief explanation of possible causes (2-3 common causes)

**🛡️ What you can do now:**
Practical home remedies and self-care steps

**🥗 Diet & Lifestyle Tips:**
Specific food recommendations relevant to the concern

**⚠️ See a doctor if:**
Clear warning signs that need medical attention

**💡 Quick Tip:**
One actionable wellness tip

Keep responses under 300 words. Use emojis for readability.`;

// ─── DETAILED FALLBACK RESPONSES ───

function isPregnancyQuery(msg) {
  const m = msg.toLowerCase();
  return /pregnan|trimester|baby bump|expecting|prenatal|morning sickness|labor|delivery|folic acid|antenatal/.test(m);
}

function generateDoctorAssistant(msg) {
  const m = msg.toLowerCase();
  const symptoms = [], concerns = [], investigations = [], redFlags = [];

  const map = [
    { keywords: ['fever', 'temperature'], sym: 'Fever', concern: 'Infection — viral/bacterial', inv: 'CBC, Blood culture if high-grade', flag: 'Fever >104°F or lasting >5 days' },
    { keywords: ['cough', 'sputum'], sym: 'Cough', concern: 'Upper/lower respiratory tract infection', inv: 'Chest X-ray, Sputum culture if productive', flag: 'Hemoptysis or severe dyspnea' },
    { keywords: ['headache', 'head pain', 'migraine'], sym: 'Headache', concern: 'Tension-type, Migraine, Hypertension', inv: 'BP monitoring, CT if red flags present', flag: 'Sudden thunderclap headache, papilledema' },
    { keywords: ['chest', 'heart', 'palpitation'], sym: 'Chest symptoms', concern: 'Cardiac evaluation needed', inv: 'ECG, Troponin, Echo if indicated', flag: 'Acute crushing chest pain, radiation to arm/jaw' },
    { keywords: ['breath', 'dyspnea', 'wheez'], sym: 'Respiratory distress', concern: 'Asthma, COPD, Cardiac cause', inv: 'SpO2, PFT, Chest X-ray', flag: 'SpO2 < 92%, cyanosis, accessory muscle use' },
    { keywords: ['stomach', 'abdomen', 'pain', 'vomit', 'nausea'], sym: 'Abdominal complaint', concern: 'Gastritis, Appendicitis, Hepatobiliary', inv: 'USG Abdomen, LFT, Lipase', flag: 'Rigid abdomen, rebound tenderness' },
    { keywords: ['diabetes', 'sugar', 'glucose'], sym: 'Glycemic concern', concern: 'DM evaluation/management', inv: 'FBS, PP, HbA1c, Renal function', flag: 'DKA symptoms, hypoglycemia <70mg/dL' },
    { keywords: ['blood pressure', 'bp', 'hypertension'], sym: 'Blood pressure', concern: 'Essential/Secondary HTN', inv: 'Serial BP, Renal Doppler, ECG', flag: 'BP >180/120, headache, visual changes' },
    { keywords: ['rash', 'skin', 'itch', 'allergy'], sym: 'Dermatological', concern: 'Allergic/Infectious/Autoimmune', inv: 'IgE levels, Skin biopsy if needed', flag: 'Urticaria with angioedema, Stevens-Johnson' },
    { keywords: ['joint', 'arthritis', 'swelling'], sym: 'Joint complaint', concern: 'OA, RA, Gout, Infective arthritis', inv: 'ESR, CRP, Uric acid, RF, X-ray', flag: 'Hot swollen joint with fever (septic arthritis)' },
  ];

  map.forEach(item => {
    if (item.keywords.some(k => m.includes(k))) {
      symptoms.push(item.sym); concerns.push(item.concern);
      investigations.push(item.inv); redFlags.push(item.flag);
    }
  });

  if (symptoms.length === 0) {
    symptoms.push('General complaint'); concerns.push('Detailed history required');
    investigations.push('Basic panel: CBC, CMP, Urinalysis');
    redFlags.push('Any acute deterioration');
  }

  return `**📋 Clinical Summary:**\nPatient presents with: "${msg.substring(0, 150)}"\n\n**🔍 Key Symptoms:**\n${symptoms.map(s => `• ${s}`).join('\n')}\n\n**⚠️ Possible Concerns:**\n${concerns.map(c => `• ${c}`).join('\n')}\n\n**🧪 Suggested Investigations:**\n${investigations.map(i => `• ${i}`).join('\n')}\n\n**🚨 Red Flags to Watch:**\n${redFlags.map(r => `• ${r}`).join('\n')}\n\n**Next Steps:**\n• Complete physical examination\n• Order investigations as needed\n• Review and follow up\n\n_AI-assisted summary. Clinical judgment is paramount._`;
}

function generatePregnancyResponse(msg) {
  const m = msg.toLowerCase();

  if (/diet|food|eat|nutrition/.test(m)) {
    return `**🤰 Pregnancy Nutrition Guide:**\n\n**🥗 Recommended Foods:**\n• 🥬 Dark leafy greens (spinach, methi) — folate for neural development\n• 🥛 Milk, curd, paneer — calcium for baby's bones\n• 🥚 Eggs, dal, fish — protein for growth\n• 🌾 Whole grains (ragi, oats, brown rice) — sustained energy\n• 🥜 Almonds, walnuts — omega-3 for brain development\n• 🍌 Fruits (banana, apple, pomegranate) — vitamins & fiber\n• 🫘 Lentils & legumes — iron to prevent anemia\n\n**❌ Foods to Avoid:**\n• Raw/undercooked meat, fish, eggs\n• Unpasteurized dairy\n• Excess caffeine (limit to 1 cup/day)\n• Alcohol — absolutely none\n• Papaya & pineapple in large amounts (1st trimester)\n\n**💊 Key Supplements:**\n• Folic acid 400mcg daily (first 12 weeks minimum)\n• Iron supplements as prescribed\n• Calcium + Vitamin D\n\n**⚠️ Consult Doctor If:**\n• Severe food aversions affecting weight gain\n• Signs of anemia (extreme fatigue, pale skin)\n• Gestational diabetes screening results\n\n_This is not a medical diagnosis. Please consult your doctor._ 💚`;
  }

  if (/nausea|morning sickness|vomit/.test(m)) {
    return `**🤰 Managing Morning Sickness:**\n\n**💡 Tips:**\n• 🍪 Keep dry crackers by your bed — eat before getting up\n• 🫚 Ginger tea, ginger candies, or ginger biscuits\n• 💧 Sip water frequently in small amounts\n• 🍋 Smell fresh lemon — it can ease nausea\n• 🥣 Eat small meals every 2-3 hours\n• ❄️ Try cold foods (less smell triggers)\n\n**🥗 Diet:**\n• Bland foods: khichdi, plain rice, toast, bananas\n• Coconut water & buttermilk\n• Avoid fried, spicy, and strong-smelling foods\n• Vitamin B6 (with doctor's advice)\n\n**⚠️ See Doctor Immediately If:**\n• Can't keep any food/water down for 24+ hours\n• Dark urine or dizziness (dehydration signs)\n• Weight loss instead of gain\n• Severe vomiting (hyperemesis gravidarum)\n\n_This is not a medical diagnosis. Please consult your doctor._ 💚`;
  }

  return `**🤰 Pregnancy Health Guidance:**\n\n**💡 Essential Tips:**\n• 💊 Take prenatal vitamins daily (folic acid, iron, calcium)\n• 🚶‍♀️ 30 minutes of gentle walking or prenatal yoga daily\n• 😴 Sleep 8-9 hours, prefer left-side sleeping\n• 🧘 Practice deep breathing for stress relief\n• 📅 Never skip prenatal check-ups\n• 💧 Drink 3+ liters of water daily\n• 🚫 Avoid heavy lifting and strenuous activity\n\n**🥗 Daily Diet Plan:**\n• Breakfast: Milk + oats/ragi porridge + fruits\n• Mid-morning: Handful of almonds + coconut water\n• Lunch: Rice/roti + dal + sabzi + curd\n• Evening: Fruit chaat or sprouts\n• Dinner: Light roti + vegetable curry\n\n**🚨 Warning Signs — Rush to Hospital:**\n• ⚠️ Vaginal bleeding or spotting\n• ⚠️ Severe abdominal pain or cramping\n• ⚠️ Sudden severe headache or vision changes\n• ⚠️ Reduced baby movements (after 28 weeks)\n• ⚠️ Leaking fluid from vagina\n• ⚠️ High fever (>100.4°F)\n• ⚠️ Swelling of face/hands (preeclampsia sign)\n\n_This is not a medical diagnosis. Please consult your doctor._ 💚`;
}

function generateDetailedHealthResponse(msg, ctx) {
  const m = msg.toLowerCase();

  if (/headache|head pain|migraine/.test(m)) {
    return `**🔍 What might be happening:**\nHeadaches can be caused by:\n• Dehydration or skipping meals\n• Stress, tension, or poor sleep\n• Eye strain from screens\n• Sinus congestion\n\n**🛡️ What you can do now:**\n• 💧 Drink a full glass of water immediately\n• 😴 Rest in a dark, quiet room for 15-20 minutes\n• 🧊 Apply a cold cloth on your forehead\n• 🧘 Try gentle neck and shoulder stretches\n• 👆 Press between thumb and index finger for 2 minutes\n\n**🥗 Diet & Lifestyle Tips:**\n• Eat regular meals — don't skip any\n• Include magnesium-rich foods: almonds, bananas, spinach\n• Reduce screen time, take breaks every 30 minutes\n• Stay hydrated (8+ glasses of water)\n• Limit caffeine and processed foods\n\n**⚠️ See a doctor if:**\n• Headache is sudden and extremely severe\n• Accompanied by fever, stiff neck, or confusion\n• Vision changes or numbness\n• Persists for more than 3 days\n• Worsening despite rest and hydration\n\n**💡 Quick Tip:** Keep a headache diary to track triggers — food, sleep, stress patterns.`;
  }

  if (/fever|temperature|chills/.test(m)) {
    return `**🔍 What might be happening:**\nFever usually indicates your body is fighting:\n• Viral infection (cold, flu, dengue season)\n• Bacterial infection\n• Dehydration or heat exhaustion\n\n**🛡️ What you can do now:**\n• 🌡️ Monitor temperature every 4 hours\n• 💧 Drink lots of fluids — ORS, coconut water, nimbu pani\n• 🧊 Use cold compresses on forehead and armpits\n• 👕 Wear light, loose clothing\n• 🛌 Complete bed rest\n\n**🥗 Diet & Lifestyle Tips:**\n• Light dal-rice or khichdi with ghee\n• Warm turmeric milk at night\n• Fresh fruit juices (orange, mosambi)\n• Avoid heavy, oily, or spicy food\n• Tulsi-ginger-honey tea (2-3 times/day)\n\n**⚠️ See a doctor if:**\n• Temperature > 103°F (39.4°C)\n• Fever lasting more than 3 days\n• Severe body ache, rash, or joint pain\n• Difficulty breathing\n• Confusion or extreme weakness\n• In monsoon season — get dengue/malaria tested\n\n**💡 Quick Tip:** Stay hydrated! Dehydration during fever is the #1 complication.`;
  }

  if (/cold|cough|sore throat|flu|sneez/.test(m)) {
    return `**🔍 What might be happening:**\n• Common cold (viral — resolves in 5-7 days)\n• Allergic reaction (dust, pollution, weather change)\n• Throat infection\n\n**🛡️ What you can do now:**\n• 🍯 Warm honey + ginger tea (3x daily)\n• 🌬️ Steam inhalation with eucalyptus (10 min, 2x daily)\n• 🧂 Salt water gargle every 3-4 hours\n• 🥄 Turmeric milk (haldi doodh) before bed\n• 🤧 Keep nose clean with saline nasal drops\n\n**🥗 Diet & Lifestyle Tips:**\n• Hot soups — tomato, chicken, or moong dal soup\n• Increase Vitamin C: amla, lemon, orange, guava\n• Warm water throughout the day\n• Avoid cold drinks, ice cream, fried foods\n• Add black pepper and turmeric to meals\n\n**⚠️ See a doctor if:**\n• Cough lasts more than 2 weeks\n• Yellow/green sputum (bacterial infection sign)\n• High fever with cough\n• Breathing difficulty or chest pain\n• Blood in sputum\n\n**💡 Quick Tip:** Gargle with warm salt water — it's the simplest and most effective remedy!`;
  }

  if (/stomach|digestion|acidity|gas|bloat|constipat/.test(m)) {
    return `**🔍 What might be happening:**\n• Acidity/GERD from irregular meals or spicy food\n• Gas and bloating from certain foods\n• Mild food intolerance\n• Stress-related digestive issues\n\n**🛡️ What you can do now:**\n• 🥛 Drink cold buttermilk (chaas) with roasted jeera\n• 🫚 Chew small piece of fresh ginger before meals\n• 🚶 Take a 10-minute walk after meals\n• 💧 Drink warm water first thing in the morning\n• 🍌 Eat a ripe banana for instant acidity relief\n\n**🥗 Diet & Lifestyle Tips:**\n• Eat meals at fixed times — never skip\n• Include: curd, papaya, fennel seeds, coconut water\n• Avoid: deep-fried, very spicy, processed food\n• Chew food thoroughly — eat slowly\n• Don't lie down within 2 hours of eating\n\n**⚠️ See a doctor if:**\n• Persistent pain for more than a week\n• Blood in stool or black stools\n• Severe vomiting or inability to eat\n• Unexplained weight loss\n• Burning that doesn't respond to antacids\n\n**💡 Quick Tip:** Soak 1 tsp fennel seeds in water overnight — drink in the morning!`;
  }

  if (/stress|anxiety|depress|sleep|insomnia|mental/.test(m)) {
    return `**🔍 What might be happening:**\n• Work or personal life stress\n• Anxiety or overthinking patterns\n• Sleep deprivation affecting mental health\n• Seasonal or situational changes\n\n**🛡️ What you can do now:**\n• 🧘 Try 4-7-8 breathing: Inhale 4s, Hold 7s, Exhale 8s\n• 📝 Write down your worries — journaling helps\n• 🎵 Listen to calming music for 15 minutes\n• 🚶 Take a walk in nature or sunlight\n• 📱 Reduce social media to 30 min/day\n\n**🥗 Diet & Lifestyle Tips:**\n• Dark chocolate (small piece) — boosts serotonin\n• Almonds, walnuts — omega-3 for brain health\n• Ashwagandha or chamomile tea before bed\n• Avoid caffeine after 3 PM\n• Maintain consistent sleep schedule (10 PM - 6 AM)\n\n**⚠️ See a doctor if:**\n• Feeling hopeless or worthless for 2+ weeks\n• Unable to perform daily activities\n• Thoughts of self-harm (please call helpline: 9152987821)\n• Panic attacks or severe anxiety\n• Sleep problems lasting more than 2 weeks\n\n**💡 Quick Tip:** Even 5 minutes of deep breathing daily can reduce cortisol by 20%. Start today! 💚`;
  }

  if (/diabetes|sugar|glucose/.test(m)) {
    return `**🔍 What might be happening:**\n• High blood sugar can cause fatigue, thirst, frequent urination\n• Pre-diabetes if fasting sugar is 100-125 mg/dL\n• Lifestyle and diet play a huge role\n\n**🛡️ What you can do now:**\n• 🚶 Walk for 30 minutes after every meal\n• 📊 Monitor blood sugar regularly (fasting + post-meal)\n• 💧 Drink 3+ liters of water daily\n• 🍽️ Eat at fixed times, never skip meals\n\n**🥗 Diet & Lifestyle Tips:**\n• Replace white rice with brown rice or millets\n• Include bitter gourd (karela), methi seeds, jamun\n• Eat protein with every meal (dal, eggs, paneer)\n• Avoid: white sugar, maida, packaged juices, bakery items\n• Cinnamon water in morning can help insulin sensitivity\n\n**⚠️ See a doctor if:**\n• Fasting sugar consistently >130 mg/dL\n• Frequent infections or slow wound healing\n• Numbness or tingling in feet\n• Vision changes or blurriness\n• Sudden weight loss\n\n**💡 Quick Tip:** Soak 1 tsp methi (fenugreek) seeds overnight — eat in morning empty stomach!`;
  }

  // Default
  return `**🏥 Hello! I'm Arogya Mitra — Your Health Guide**\n\nI'm here to help with general health questions. I can provide:\n\n• 🔍 **Symptom analysis** — Understanding what might be happening\n• 🛡️ **Self-care tips** — Things you can try at home\n• 🥗 **Diet advice** — Foods that help specific conditions\n• ⚠️ **Warning signs** — When you definitely need a doctor\n• 🤰 **Pregnancy guidance** — Safe tips for expecting mothers\n\n**Try asking me:**\n• "I have a headache that won't go away"\n• "What should I eat to control sugar?"\n• "I'm pregnant and feeling nauseous"\n• "I'm very stressed and can't sleep"\n\n**Important:** I provide guidance only — not diagnosis.\nFor any serious concern, please book an appointment with a doctor.\n\n💡 **Quick Tip:** Drinking 8 glasses of water daily prevents 60% of common health issues!`;
}
