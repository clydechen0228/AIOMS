import { useEffect, useState, useRef } from "react";
import { Bot, AlertTriangle, Box, MapPin, X, Video, StopCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface AgentLog {
    agentName: string;
    action: string;
    details: string;
    timestamp: string;
}

interface AgentDebateProps {
    logs: AgentLog[];
    orderId: string;
    onClose: () => void;
    onComplete: () => void;
}



export function AgentDebate({ logs, orderId, onClose, onComplete }: AgentDebateProps) {
    const [displayedLogs, setDisplayedLogs] = useState<AgentLog[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // TTS Function
    const speakText = (text: string, agentName: string) => {
        if (!window.speechSynthesis) return;

        // Cancel previous speech to avoid overlap
        window.speechSynthesis.cancel();

        const u = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();

        // Try to assign distinct voices
        if (agentName.includes("Risk")) {
            u.pitch = 0.6; // Deep voice
            u.rate = 0.9;
            u.voice = voices.find(v => v.name.includes("Male")) || null;
        } else if (agentName.includes("Logistics")) {
            u.rate = 1.2; // Fast
            u.pitch = 1.1;
            u.voice = voices.find(v => v.name.includes("Google US English")) || null;
        } else if (agentName.includes("Inventory")) {
            u.pitch = 1.4; // High/Anxious
        }

        window.speechSynthesis.speak(u);
    };

    const uploadVideo = async (blob: Blob) => {
        setIsUploading(true);
        try {
            const response = await fetch(`/api/orders/${orderId}/video`, {
                method: 'POST',
                headers: {
                    'Content-Type': blob.type
                },
                body: blob
            });
            if (response.ok) {
                console.log("Video uploaded successfully");
            }
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setIsUploading(false);
            onComplete();
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { mediaSource: 'screen' } as any,
                audio: true
            });

            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus' });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "video/webm" });

                // 1. Download locally
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `debate-order-${orderId}.webm`;
                a.click();

                // 2. Upload to server
                uploadVideo(blob);

                URL.revokeObjectURL(url);
                stream.getTracks().forEach(track => track.stop());
                setIsRecording(false);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error starting screen recording:", err);
            // alert("Could not start recording. Please ensure you have granted screen sharing permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
    };

    useEffect(() => {
        if (currentIndex < logs.length) {
            const log = logs[currentIndex];

            // Speak non-system messages
            if (log.agentName !== "System") {
                speakText(log.details, log.agentName);
            }

            // Variable delay based on text length (min 2s, max 6s)
            const readingTime = Math.min(6000, Math.max(2000, log.details.length * 60));

            const timeout = setTimeout(() => {
                setDisplayedLogs(prev => [...prev, log]);
                setCurrentIndex(prev => prev + 1);
            }, readingTime);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, logs]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [displayedLogs]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-2xl h-[600px] flex flex-col shadow-2xl relative overflow-hidden ring-2 ring-purple-500/20">
                {/* Header */}
                <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-purple-600" />
                        <h2 className="font-semibold text-lg">Agent Council Session</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {isUploading && <span className="text-xs text-blue-500 animate-pulse">Uploading...</span>}
                        {!isRecording ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50 gap-2"
                                onClick={startRecording}
                            >
                                <Video className="h-4 w-4" />
                                Record
                            </Button>
                        ) : (
                            <Button
                                variant="destructive"
                                size="sm"
                                className="gap-2 animate-pulse"
                                onClick={stopRecording}
                            >
                                <StopCircle className="h-4 w-4" />
                                Stop
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Debate Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-100/50"
                >
                    {displayedLogs.map((log, index) => {
                        const isSystem = log.agentName === "System";
                        const isRisk = log.agentName.includes("Risk");
                        const isLogistics = log.agentName.includes("Logistics");
                        const isInventory = log.agentName.includes("Inventory");

                        // Determine Alignment
                        let alignClass = "items-start"; // Default Left
                        if (isLogistics) alignClass = "items-end"; // Right
                        if (isSystem) alignClass = "items-center"; // Center

                        // Animation
                        const animationClass = "animate-in slide-in-from-bottom-2 fade-in duration-500";

                        return (
                            <div key={index} className={`flex flex-col ${alignClass} ${animationClass} w-full`}>
                                {/* System Message */}
                                {isSystem ? (
                                    <div className="bg-slate-200 text-slate-600 text-xs py-1 px-4 rounded-full font-medium shadow-sm">
                                        {log.details}
                                    </div>
                                ) : (
                                    /* Agent Message */
                                    <div className={`flex gap-3 max-w-[80%] ${isLogistics ? "flex-row-reverse" : ""}`}>

                                        {/* Avatar */}
                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-md shrink-0 border-2
                                            ${isInventory ? "bg-blue-100 border-blue-200 text-blue-600" : ""}
                                            ${isRisk ? "bg-amber-100 border-amber-200 text-amber-600" : ""}
                                            ${isLogistics ? "bg-green-100 border-green-200 text-green-600" : ""}
                                        `}>
                                            {isInventory && <Box className="h-5 w-5" />}
                                            {isRisk && <AlertTriangle className="h-5 w-5" />}
                                            {isLogistics && <MapPin className="h-5 w-5" />}
                                        </div>

                                        {/* Bubble */}
                                        <div className="flex flex-col gap-1">
                                            <div className={`text-xs font-bold text-muted-foreground ${isLogistics ? "text-right" : ""}`}>
                                                {log.agentName}
                                            </div>
                                            <div className={`p-4 rounded-2xl shadow-sm border
                                                ${isLogistics
                                                    ? "bg-green-50/80 border-green-100 rounded-tr-none text-right"
                                                    : "bg-white border-slate-100 rounded-tl-none"}
                                            `}>
                                                <div className="text-xs font-bold opacity-50 uppercase tracking-wider mb-1">
                                                    {log.action}
                                                </div>
                                                <p className="text-sm text-foreground leading-relaxed">
                                                    {log.details}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {currentIndex < logs.length && (
                        <div className="flex justify-center py-4">
                            <span className="text-xs text-muted-foreground animate-pulse">
                                Agents are deliberating...
                            </span>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
