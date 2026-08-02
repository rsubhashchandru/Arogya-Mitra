import React, { useState } from 'react';
import { uploadPrescription } from '../services/authService';

function PrescriptionOCR() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { setError('Please upload an image file'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError('');
  };

  const handleDrop = (e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('prescription', file);
      const res = await uploadPrescription(formData);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process image');
    } finally { setLoading(false); }
  };

  // Text-to-Speech
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const handleCopy = (text) => navigator.clipboard.writeText(text);

  const reset = () => { setFile(null); setPreview(null); setResult(null); setError(''); stopSpeaking(); };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-cyan-700 to-teal-600 text-white py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-extrabold mb-1">📄 Prescription Simplifier</h1>
          <p className="text-cyan-100 text-sm">Upload prescription → Get simple instructions + voice readout</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</div>}

        {/* Upload Zone */}
        {!result && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            <div className={`p-10 border-2 border-dashed rounded-2xl m-4 text-center transition-all cursor-pointer ${
              dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-400 hover:bg-gray-50'
            }`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}>
              <input id="file-input" type="file" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} className="hidden" />
              {preview ? (
                <div>
                  <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-xl shadow-md mb-4" />
                  <p className="text-sm text-gray-600 font-medium">{file.name}</p>
                </div>
              ) : (
                <div>
                  <div className="text-6xl mb-4">📸</div>
                  <p className="text-lg font-bold text-gray-700 mb-1">Drop your prescription here</p>
                  <p className="text-sm text-gray-400">or click to browse • JPG, PNG, BMP</p>
                </div>
              )}
            </div>
            {file && (
              <div className="p-4 border-t border-gray-100 flex gap-3">
                <button onClick={handleSubmit} disabled={loading} className="flex-1 btn-primary disabled:opacity-50">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Analyzing Prescription...
                    </span>
                  ) : '🔍 Simplify Prescription'}
                </button>
                <button onClick={reset} className="btn-ghost border border-gray-200">Clear</button>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* Voice Readout */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-5 text-white shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{speaking ? '🔊' : '🔈'}</span>
                  <div>
                    <h3 className="font-bold text-lg">Voice Readout</h3>
                    <p className="text-violet-200 text-xs">Listen to your simplified prescription</p>
                  </div>
                </div>
                {speaking ? (
                  <button onClick={stopSpeaking} className="px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-sm transition-colors">
                    ⏹ Stop
                  </button>
                ) : (
                  <button onClick={() => speak(result.speechText)} className="px-5 py-2.5 bg-white text-violet-700 rounded-xl font-bold text-sm hover:bg-violet-50 transition-colors">
                    ▶️ Play
                  </button>
                )}
              </div>
              {speaking && (
                <div className="mt-3 flex gap-1">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="flex-1 h-6 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s`, animationDuration: '0.8s' }}/>
                  ))}
                </div>
              )}
            </div>

            {/* Confidence */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Scan Results</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  result.confidence > 70 ? 'bg-green-100 text-green-700' : result.confidence > 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>{result.confidence}% confidence</span>
              </div>
            </div>

            {/* Simplified Medicines */}
            {result.simplified?.medicines?.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-sm">💊</span>
                  Your Medicines — Simplified
                </h3>
                <div className="space-y-3">
                  {result.simplified.medicines.map((med, i) => (
                    <div key={i} className="p-4 bg-green-50 border border-green-100 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-green-900 text-sm">💊 {med.name}</h4>
                        <button onClick={() => speak(med.simpleInstruction)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg hover:bg-green-200">🔊</button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 bg-white rounded flex items-center justify-center text-[10px]">⏰</span>
                          <span className="text-green-800">{med.whenToTake}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 bg-white rounded flex items-center justify-center text-[10px]">📅</span>
                          <span className="text-green-800">{med.duration}</span>
                        </div>
                      </div>
                      <p className="text-xs text-green-700 mt-2 font-medium">📝 {med.simpleInstruction}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            {result.simplified?.instructions?.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm">📝</span>
                  Instructions
                </h3>
                <div className="space-y-2">
                  {result.simplified.instructions.map((m, i) => (
                    <div key={i} className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">{m}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Text */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">📄 Original Text</h3>
                <div className="flex gap-2">
                  <button onClick={() => speak(result.rawText)} className="px-3 py-1.5 text-xs font-semibold bg-violet-100 text-violet-700 hover:bg-violet-200 rounded-lg transition-colors">🔊 Read</button>
                  <button onClick={() => handleCopy(result.rawText)} className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">📋 Copy</button>
                </div>
              </div>
              <pre className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed border border-gray-100 max-h-48 overflow-y-auto">{result.rawText}</pre>
            </div>

            <button onClick={reset} className="btn-primary w-full">📸 Scan Another Prescription</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PrescriptionOCR;
