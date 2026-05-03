"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { store, useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";

type Turn = { who: "you"; text: string; at: string };

function fmtClock(d = new Date()) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function minsLeft(seconds: number) {
  return Math.ceil(seconds / 60);
}

// Map our settings.language to a BCP-47 tag for Web Speech API
function langTag(lang: string): string {
  switch (lang) {
    case "Spanish":
      return "es-ES";
    case "French":
      return "fr-FR";
    case "German":
      return "de-DE";
    case "Hindi":
      return "hi-IN";
    case "Mandarin":
      return "zh-CN";
    case "Japanese":
      return "ja-JP";
    default:
      return "en-US";
  }
}

export default function LiveSessionPage() {
  const router = useRouter();
  const toast = useToast();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const session = useStore((s) => s.sessions.find((x) => x.id === id));

  const [secondsLeft, setSecondsLeft] = useState(600);
  const [transcript, setTranscript] = useState<Turn[]>([]);
  const [manualInput, setManualInput] = useState("");

  // streams + recognition refs (mutable, don't trigger re-render)
  const screenRef = useRef<MediaStream | null>(null);
  const micRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const recognitionShouldRun = useRef(false);

  const [live, setLive] = useState(false);
  const [hasScreenAudio, setHasScreenAudio] = useState(false);
  const [hasMic, setHasMic] = useState(false);
  const [interim, setInterim] = useState<string>("");
  const [audioLevel, setAudioLevel] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const [aiQuestion, setAiQuestion] = useState<string | null>(null);
  const [aiAnswer, setAiAnswer] = useState<string>("");
  const [aiTyping, setAiTyping] = useState(false);
  const [aiAnsweredAt, setAiAnsweredAt] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const transcriptRef = useRef<HTMLDivElement>(null);

  /* ------------------- timer ------------------- */
  useEffect(() => {
    if (session) setSecondsLeft(session.free ? 600 : 3600);
  }, [session?.id, session?.free, session]);

  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => {
      setSecondsLeft((v) => {
        if (v <= 1) {
          handleStop();
          if (id) store.endSession(id);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, id]);

  /* ------------------- auto-scroll transcript ------------------- */
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  /* ------------------- cleanup on unmount ------------------- */
  useEffect(() => {
    return () => {
      handleStop(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------- auto-answer mode ------------------- */
  useEffect(() => {
    if (!live || !session?.autoGenerate) return;
    const t = setInterval(() => generateAnswer(), 12000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, session?.autoGenerate]);

  /* ------------------- core: connect ------------------- */
  async function handleConnect() {
    if (live) return;
    if (typeof window === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
      toast.error({
        title: "Browser not supported",
        message: "Use Chrome or Edge to enable screen sharing.",
      });
      return;
    }

    let screenStream: MediaStream;
    try {
      screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
    } catch (err) {
      const e = err as DOMException;
      if (e.name === "NotAllowedError") {
        toast.error({
          title: "Permission denied",
          message: "Please grant screen sharing access to start the session.",
        });
      } else {
        toast.error({
          title: "Couldn't start screen share",
          message: e.message || "Try again.",
        });
      }
      return;
    }

    screenRef.current = screenStream;

    // Pipe screen audio through speakers so user hears the interviewer
    const audioTracks = screenStream.getAudioTracks();
    if (audioTracks.length > 0 && audioElRef.current) {
      audioElRef.current.srcObject = new MediaStream(audioTracks);
      audioElRef.current.play().catch(() => {});
      setHasScreenAudio(true);
    } else {
      setHasScreenAudio(false);
      toast.info({
        title: "No screen audio detected",
        message: "Tip: tick \"Also share tab audio\" in the share dialog to capture the interviewer's voice.",
      });
    }

    // Detect "Stop sharing" from browser bar
    screenStream.getVideoTracks()[0]?.addEventListener("ended", () => {
      handleStop();
    });

    // Try mic for the candidate's voice
    try {
      const mic = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      micRef.current = mic;
      setHasMic(true);
      // wire AudioContext-based level meter
      try {
        const Ctor =
          (window.AudioContext ||
            (window as unknown as { webkitAudioContext?: typeof AudioContext })
              .webkitAudioContext) as typeof AudioContext;
        const ctx = new Ctor();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(mic);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
        const buffer = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteTimeDomainData(buffer);
          let sum = 0;
          for (let i = 0; i < buffer.length; i++) {
            const v = (buffer[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / buffer.length);
          setAudioLevel(Math.min(1, rms * 4));
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        // visualization is best-effort
      }
    } catch (err) {
      const e = err as DOMException;
      setHasMic(false);
      toast.error({
        title: "Microphone access denied",
        message:
          e.name === "NotAllowedError"
            ? "Click the lock icon in the address bar → allow Microphone."
            : e.name === "NotFoundError"
              ? "No microphone detected. Plug one in or check OS settings."
              : e.message || "Couldn't access the microphone.",
      });
    }

    // Web Speech API for live transcription of the candidate
    startSpeechRecognition();

    setLive(true);
    if (id) store.activateSession(id);

    toast.success({
      title: "You're live",
      message: audioTracks.length
        ? "Screen + tab audio + microphone connected."
        : "Screen + microphone connected (tab audio not shared).",
    });
  }

  function startSpeechRecognition() {
    const SR =
      (typeof window !== "undefined" &&
        ((window as unknown as { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
          (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition)) ||
      null;

    if (!SR) {
      toast.error({
        title: "Speech recognition not supported",
        message:
          "Your browser doesn't support live transcription. Use Chrome, Edge, or Safari for the best experience.",
      });
      return;
    }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = langTag(session?.language ?? "English");

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript.trim();
        if (!text) continue;
        if (result.isFinal) {
          setInterim("");
          setTranscript((t) => [...t, { who: "you", text, at: fmtClock() }]);
        } else {
          interimText += text + " ";
        }
      }
      if (interimText) setInterim(interimText.trim());
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      const code = event.error;
      // benign — keep silent
      if (code === "no-speech" || code === "aborted") return;

      const map: Record<string, { title: string; message: string }> = {
        "not-allowed": {
          title: "Microphone permission denied",
          message: "Click the lock icon → Allow microphone, then click Connect again.",
        },
        "service-not-allowed": {
          title: "Speech service blocked",
          message: "Your browser or OS is blocking speech recognition. Try Chrome.",
        },
        "audio-capture": {
          title: "No microphone detected",
          message: "Plug in a microphone or check your OS audio settings.",
        },
        network: {
          title: "Network error",
          message: "Speech recognition needs an internet connection.",
        },
        "language-not-supported": {
          title: "Language not supported",
          message: `Your browser doesn't support ${session?.language ?? "this language"}. Defaulting to English.`,
        },
      };
      const err = map[code] || {
        title: "Speech recognition error",
        message: `Error: ${code}. Try Stop + Connect again.`,
      };
      toast.error(err);
    };

    rec.onend = () => {
      if (recognitionShouldRun.current) {
        try {
          rec.start();
        } catch {
          // ignored — will retry next tick
        }
      }
    };

    recognitionShouldRun.current = true;
    try {
      rec.start();
    } catch (e) {
      const err = e as Error;
      // Most common: InvalidStateError (already started)
      if (!err.message.includes("started")) {
        toast.error({ title: "Couldn't start mic", message: err.message });
      }
    }
    recognitionRef.current = rec;
  }

  function handleStop(unmounting = false) {
    recognitionShouldRun.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* noop */
      }
      recognitionRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    screenRef.current?.getTracks().forEach((t) => t.stop());
    micRef.current?.getTracks().forEach((t) => t.stop());
    if (audioElRef.current) audioElRef.current.srcObject = null;
    screenRef.current = null;
    micRef.current = null;
    setLive(false);
    setHasScreenAudio(false);
    setHasMic(false);
    setInterim("");
    setAudioLevel(0);
    if (!unmounting && id) {
      // session metadata stays "active" until Exit
    }
  }

  /* ------------------- AI answer (real streaming OpenAI call) ------------------- */
  const abortRef = useRef<AbortController | null>(null);

  async function generateAnswer(question?: string, screenshotDataUrl?: string) {
    if (!session) return;

    // Cancel any in-flight stream
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setAiQuestion(question || (transcript.length > 0 ? transcript[transcript.length - 1].text : "Inferring from transcript…"));
    setAiAnswer("");
    setAiTyping(true);
    setAiAnsweredAt(null);

    try {
      const res = await fetch("/api/ai-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          transcript: transcript.map((t) => t.text),
          screenshotDataUrl,
          session: {
            title: session.title,
            description: session.description,
            mode: session.mode,
            language: session.language,
            simpleLanguage: session.simpleLanguage,
            extraContext: session.extraContext,
            aiModel: session.aiModel,
            resumeName: session.resumeName,
          },
        }),
        signal: ac.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error({
          title: "AI couldn't respond",
          message: data?.error || `Status ${res.status}`,
        });
        setAiTyping(false);
        return;
      }
      if (!res.body) {
        setAiTyping(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE — split on lines. Each event line begins with "data: " and ends in \n\n
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const raw of lines) {
          const line = raw.trim();
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const parsed = JSON.parse(payload);
            const delta = parsed?.choices?.[0]?.delta?.content;
            if (typeof delta === "string" && delta.length > 0) {
              acc += delta;
              setAiAnswer(acc);
            }
          } catch {
            // partial chunk — wait for next
          }
        }
      }

      setAiTyping(false);
      setAiAnsweredAt(fmtClock());
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      toast.error({
        title: "Couldn't reach AI",
        message: err instanceof Error ? err.message : "Network error.",
      });
      setAiTyping(false);
    }
  }

  /* ------------------- screenshot ------------------- */
  async function handleScreenshot() {
    if (!screenRef.current) {
      toast.error({
        title: "Not connected",
        message: "Click Connect to share your screen first.",
      });
      return;
    }
    try {
      const video = document.createElement("video");
      video.srcObject = screenRef.current;
      video.muted = true;
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        setTimeout(() => reject(new Error("timeout")), 4000);
      });
      await video.play();
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      const url = canvas.toDataURL("image/png");
      setScreenshot(url);
      toast.success({
        title: "Screenshot captured",
        message: `${canvas.width}×${canvas.height} sent to AI.`,
      });
      generateAnswer(undefined, url);
      video.pause();
      video.srcObject = null;
    } catch (e) {
      toast.error({
        title: "Couldn't capture",
        message: e instanceof Error ? e.message : "Try again.",
      });
    }
  }

  /* ------------------- chat handlers ------------------- */
  function handleSendManual() {
    const text = manualInput.trim();
    if (!text) return;
    setTranscript((t) => [...t, { who: "you", text, at: fmtClock() }]);
    setManualInput("");
  }

  function handleClearTranscript() {
    setTranscript([]);
  }

  function handleClearAi() {
    setAiQuestion(null);
    setAiAnswer("");
    setAiAnsweredAt(null);
    setScreenshot(null);
  }

  function handleExit() {
    handleStop(true);
    if (id) store.endSession(id, transcript.length);
    router.push("/dashboard/sessions");
  }

  function handleResetTimer() {
    if (session) setSecondsLeft(session.free ? 600 : 3600);
  }

  /* ------------------- render ------------------- */
  if (!session) {
    return (
      <div className="grid h-full place-items-center text-[14px] text-neutral-500">
        <div className="text-center">
          <p>Session not found.</p>
          <Link
            href="/dashboard/sessions"
            className="mt-3 inline-block rounded-lg bg-neutral-950 px-4 py-2 text-[13px] font-semibold text-white hover:bg-neutral-800"
          >
            Back to sessions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-neutral-50">
      {/* hidden audio element to play screen-shared audio through user's speakers */}
      <audio ref={audioElRef} autoPlay playsInline />

      {/* Top bar */}
      <header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-neutral-200 bg-white px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => document.documentElement.requestFullscreen?.()}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-[12.5px] font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9V5a2 2 0 0 1 2-2h4M21 9V5a2 2 0 0 0-2-2h-4M3 15v4a2 2 0 0 0 2 2h4M21 15v4a2 2 0 0 1-2 2h-4" />
            </svg>
            Fullscreen
          </button>
          <button
            onClick={handleConnect}
            className="rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-[12.5px] font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            Change Tab
          </button>
        </div>
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-lg">🦜</span>
          <span className="text-[14px] font-bold tracking-tight text-neutral-950">InterviewAI</span>
        </Link>
        <div className="flex items-center justify-end gap-2">
          {live && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-600 ring-1 ring-rose-200">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400/70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
              </span>
              LIVE
            </span>
          )}
          <div className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-[12.5px]">
            <span className="text-rose-500">⏰</span>
            <span className="font-semibold text-neutral-900">{minsLeft(secondsLeft)} mins</span>
            {session.free && <span className="text-neutral-500">(Free)</span>}
          </div>
          <button
            onClick={handleResetTimer}
            className="grid h-7 w-7 place-items-center rounded-md border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900"
            title="Reset timer"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </button>
          <button
            onClick={handleExit}
            className="rounded-md bg-rose-500 px-3 py-1.5 text-[13px] font-semibold text-white transition hover:bg-rose-600"
          >
            Exit
          </button>
        </div>
      </header>

      <main className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 lg:grid-cols-2">
        {/* LEFT: Transcript */}
        <section className="flex min-h-0 flex-col rounded-2xl border border-neutral-200 bg-white">
          {/* Top control row */}
          <div className="flex flex-wrap items-center gap-2 border-b border-neutral-100 px-4 py-3">
            {!live ? (
              <button
                onClick={handleConnect}
                className="group inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-neutral-900 transition hover:bg-neutral-50"
                title="Connect microphone + screen to capture interviewer audio"
              >
                Connect
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="3" width="6" height="11" rx="3" />
                  <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => handleStop()}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-3 py-1.5 text-[13px] font-semibold text-white transition hover:bg-rose-600"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                Stop
              </button>
            )}
            <button
              onClick={handleClearTranscript}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[13px] font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
                <path d="m4 5.4 1.4-1.4L10 8.6 14.6 4l1.4 1.4L11.4 10 16 14.6 14.6 16 10 11.4 5.4 16 4 14.6 8.6 10z" />
              </svg>
              Clear
            </button>
            {live && (
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ring-1 ${hasScreenAudio ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-amber-50 text-amber-700 ring-amber-200"}`}>
                  🔊 {hasScreenAudio ? "Tab audio" : "No tab audio"}
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 ring-1 ${hasMic ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-rose-50 text-rose-700 ring-rose-200"}`}>
                  🎙 {hasMic ? "Mic" : "No mic"}
                  {hasMic && (
                    <span className="relative ml-0.5 inline-block h-2 w-10 overflow-hidden rounded-full bg-emerald-100">
                      <span
                        className="absolute inset-y-0 left-0 rounded-full bg-emerald-500 transition-[width] duration-75"
                        style={{ width: `${Math.min(100, Math.max(4, audioLevel * 100))}%` }}
                      />
                    </span>
                  )}
                </span>
              </div>
            )}
            <div className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[13px] text-neutral-700">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
              </svg>
              {session.language}
            </div>
          </div>

          {/* Transcript */}
          <div ref={transcriptRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {transcript.length === 0 && (
              <div className="grid h-full place-items-center px-6 text-center">
                <div>
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-neutral-100 text-2xl">
                    🎙
                  </div>
                  {live ? (
                    <p className="text-[13px] text-neutral-500">
                      Listening… speak or type a manual message below.
                    </p>
                  ) : (
                    <>
                      <p className="text-[14px] font-semibold text-neutral-900">Ready to start</p>
                      <p className="mt-1 max-w-xs text-[12.5px] text-neutral-500">
                        Click <span className="font-semibold">Connect</span> to share your screen and microphone. Make sure to tick &quot;Also share tab audio&quot;.
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
            {transcript.map((t, i) => (
              <div key={i} className="flex flex-col items-end gap-1">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-neutral-100 px-4 py-2.5 text-[14px] text-neutral-900">
                  {t.text}
                </div>
                <div className="text-[11px] text-neutral-500">You · {t.at}</div>
              </div>
            ))}
            {interim && (
              <div className="flex flex-col items-end gap-1 opacity-60">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm border border-dashed border-neutral-300 bg-neutral-50 px-4 py-2.5 text-[14px] italic text-neutral-700">
                  {interim}
                </div>
                <div className="text-[11px] text-neutral-400">You · listening…</div>
              </div>
            )}
          </div>

          {/* Manual input */}
          <div className="flex items-center gap-2 border-t border-neutral-100 px-4 py-3">
            <input
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendManual();
              }}
              placeholder="Type a manual message..."
              className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13.5px] placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
            />
            <button
              onClick={handleSendManual}
              disabled={!manualInput.trim()}
              className="rounded-lg bg-neutral-100 px-4 py-2 text-[13px] font-semibold text-neutral-700 transition hover:bg-neutral-200 disabled:text-neutral-400"
            >
              Send
            </button>
          </div>

          {/* Bottom CTAs */}
          <div className="grid grid-cols-2 gap-2 border-t border-neutral-100 px-3 py-3">
            <div className="relative">
              <div aria-hidden className="cta-glow-ring absolute inset-0 rounded-xl" />
              <button
                onClick={() => generateAnswer()}
                disabled={aiTyping}
                className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 py-3 text-[14px] font-semibold text-white transition hover:bg-neutral-800 disabled:bg-neutral-700"
              >
                <span aria-hidden>✨</span>
                {aiTyping ? "Thinking..." : "Answer"}
              </button>
            </div>
            <button
              onClick={handleScreenshot}
              className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-3 text-[14px] font-semibold text-neutral-900 transition hover:bg-neutral-50"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 18v3" />
              </svg>
              Screenshot
            </button>
          </div>
        </section>

        {/* RIGHT: AI */}
        <section className="relative flex min-h-0 flex-col rounded-2xl border border-neutral-200 bg-white">
          {(aiQuestion || aiAnswer || screenshot) && (
            <button
              onClick={handleClearAi}
              className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[12.5px] font-medium text-neutral-600 shadow-sm transition hover:bg-neutral-50 hover:text-neutral-900"
            >
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
                <path d="m4 5.4 1.4-1.4L10 8.6 14.6 4l1.4 1.4L11.4 10 16 14.6 14.6 16 10 11.4 5.4 16 4 14.6 8.6 10z" />
              </svg>
              Clear Messages
            </button>
          )}

          <div className="flex-1 overflow-y-auto px-7 py-6">
            {!aiQuestion && !aiAnswer && !screenshot && (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-neutral-100 text-2xl">💬</div>
                  <p className="text-[14px] font-semibold text-neutral-900">No messages yet.</p>
                  <p className="mt-1 text-[13px] text-neutral-500">
                    Click <span className="font-semibold">&quot;Answer&quot;</span> or{" "}
                    <span className="font-semibold">&quot;Screenshot&quot;</span> to start!
                  </p>
                </div>
              </div>
            )}

            {screenshot && (
              <div className="mb-5 overflow-hidden rounded-lg border border-neutral-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={screenshot} alt="Screenshot" className="block w-full" />
              </div>
            )}

            {aiQuestion && (
              <div className="mb-5">
                <div className="flex items-baseline gap-2 text-[14px] text-neutral-900">
                  <span aria-hidden>💬</span>
                  <span className="font-bold">Question:</span>
                  <span className="text-neutral-700">{aiQuestion}</span>
                </div>
              </div>
            )}

            {(aiAnswer || aiTyping) && (
              <div>
                <div className="mb-2 flex items-center gap-2 text-[14px] text-neutral-900">
                  <span aria-hidden className="text-amber-500">⭐</span>
                  <span className="font-bold">Answer:</span>
                </div>
                <div className="whitespace-pre-wrap text-[14px] leading-[1.65] text-neutral-800">
                  {aiAnswer}
                  {aiTyping && <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-neutral-700 align-middle" />}
                </div>
                {aiAnsweredAt && (
                  <div className="mt-3 text-[12px] text-neutral-500">Answer · {aiAnsweredAt}</div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-neutral-100 px-4 py-3">
            <input
              placeholder="Ask the AI a custom question..."
              className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13.5px] placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const v = (e.target as HTMLInputElement).value.trim();
                  if (v) {
                    generateAnswer(v);
                    (e.target as HTMLInputElement).value = "";
                  }
                }
              }}
            />
            <button className="rounded-lg bg-neutral-100 px-4 py-2 text-[13px] font-semibold text-neutral-400">
              Send
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
