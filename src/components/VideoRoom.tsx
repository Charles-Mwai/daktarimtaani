'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Shield,
  Send,
  User,
  Stethoscope,
  Volume2,
  Share2,
  FileText,
} from 'lucide-react';
import { RequestRow, DoctorView } from '@/lib/api';

interface VideoRoomProps {
  request: RequestRow;
  doctor?: DoctorView | null;
  userRole: 'patient' | 'doctor';
  onEndCall: () => void;
}

export default function VideoRoom({
  request,
  doctor,
  userRole,
  onEndCall,
}: VideoRoomProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: string; text: string; time: string }>
  >([
    {
      sender: 'System',
      text: 'Encrypted Teleconsultation session initiated. Session Token: DAKTARI-E2E-SECURE.',
      time: 'Just now',
    },
    {
      sender: doctor?.name || 'Dr. Kamau',
      text: 'Habari! I am reviewing your symptoms summary. I will join video momentarily.',
      time: 'Just now',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Setup local webcam if permitted
  useEffect(() => {
    let localStream: MediaStream | null = null;
    async function startCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }
        }
      } catch (err) {
        console.warn('Webcam permission not granted or available, running in mock video mode:', err);
      }
    }
    startCamera();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Timer for call duration
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        sender: userRole === 'doctor' ? doctor?.name || 'Doctor' : request.patientName,
        text: inputMessage.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInputMessage('');
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] bg-slate-950 text-white rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
      {/* Main Video Stage */}
      <div className="flex-1 flex flex-col relative bg-slate-900">
        {/* Top Info Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 z-20 flex items-center justify-between bg-gradient-to-b from-slate-950/80 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Encrypted Session • {formatDuration(callDuration)}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-full">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>KMPDC Registered Facility Channel</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-2 rounded-full backdrop-blur-md transition ${
                showChat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Remote Video Stream (Main) */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          {/* Simulated Doctor Video or Remote Avatar */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
            {userRole === 'patient' && doctor ? (
              <div className="text-center space-y-4 animate-in fade-in">
                <div className="relative mx-auto">
                  <img
                    src={doctor.avatarUrl}
                    alt={doctor.name}
                    className="w-32 h-32 md:w-44 md:h-44 rounded-full object-cover border-4 border-emerald-500/50 shadow-2xl"
                  />
                  <span className="absolute bottom-2 right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                    <Stethoscope className="w-5 h-5" />
                  </span>
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white">{doctor.name}</h3>
                  <p className="text-xs md:text-sm text-emerald-400 font-medium">{doctor.specialty}</p>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">{doctor.kmpdcLicenseNo}</p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="w-28 h-28 rounded-full bg-emerald-900/40 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                  <User className="w-14 h-14" />
                </div>
                <h3 className="text-lg font-bold text-white">Patient: {request.patientName}</h3>
                <p className="text-xs text-slate-400">{request.neighbourhood} • {request.serviceType}</p>
              </div>
            )}
          </div>

          {/* Local User Self Preview Video (Picture-in-Picture) */}
          <div className="absolute bottom-20 right-4 md:bottom-24 md:right-6 w-32 h-44 md:w-44 md:h-56 bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl z-20">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-slate-400 text-xs font-semibold">
                Camera Off
              </div>
            )}
            <div className="absolute bottom-2 left-2 text-[10px] bg-slate-950/70 text-white px-2 py-0.5 rounded font-medium">
              You ({userRole === 'doctor' ? 'Doctor' : 'Patient'})
            </div>
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-4 z-20">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-full transition shadow-lg ${
              isMuted
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-3.5 rounded-full transition shadow-lg ${
              isVideoOff
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
            title={isVideoOff ? 'Start Video' : 'Stop Video'}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button
            onClick={onEndCall}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3.5 rounded-full font-bold text-sm shadow-lg shadow-rose-900/40 transition active:scale-95"
          >
            <PhoneOff className="w-5 h-5" />
            <span>End Consultation</span>
          </button>
        </div>
      </div>

      {/* Side Chat / Notes Panel */}
      {showChat && (
        <div className="w-full lg:w-80 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-72 lg:h-auto">
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-200">Consultation Chat</h4>
            <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Live Encrypted
            </span>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/50">
                <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                  <span className="font-bold text-emerald-300">{msg.sender}</span>
                  <span>{msg.time}</span>
                </div>
                <p className="text-slate-200">{msg.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type message or clinical advice..."
              className="flex-1 bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
