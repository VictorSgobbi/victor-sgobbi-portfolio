import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const SESSION_ID_KEY = "portfolio_session_id";

// ── Rate limiting ────────────────────────────────────────────────────────────
const clickThrottle = new Map<string, number>();
const CLICK_THROTTLE_MS = 1000; // 1 clique por elemento por segundo

const accessTracked = { current: false };

export const getSessionId = () => {
  // sessionStorage zera ao fechar a aba (mais correto que localStorage)
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};

export const trackAccess = async () => {
  // Garante apenas 1 registro por sessão de aba
  if (accessTracked.current) return;
  accessTracked.current = true;
  try {
    await addDoc(collection(db, "analytics"), {
      type: "session",
      sessionId: getSessionId(),
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
    });
  } catch {
    // silencia erros de tracking
  }
};

export const trackClick = async (elementId: string, projectId?: string) => {
  // Throttle por elementId
  const now = Date.now();
  const last = clickThrottle.get(elementId) ?? 0;
  if (now - last < CLICK_THROTTLE_MS) return;
  clickThrottle.set(elementId, now);

  try {
    await addDoc(collection(db, "analytics"), {
      type: "click",
      sessionId: getSessionId(),
      elementId,
      projectId: projectId || null,
      timestamp: serverTimestamp(),
    });
  } catch {
    // silencia erros de tracking
  }
};

export const trackDuration = async (durationSeconds: number) => {
  if (durationSeconds <= 0) return;
  try {
    await addDoc(collection(db, "analytics"), {
      type: "duration",
      sessionId: getSessionId(),
      duration: durationSeconds,
      timestamp: serverTimestamp(),
    });
  } catch {
    // silencia erros de tracking
  }
};

export const trackLoginAttempt = async (success: boolean) => {
  try {
    await addDoc(collection(db, "analytics"), {
      type: "login_attempt",
      sessionId: getSessionId(),
      success,
      timestamp: serverTimestamp(),
    });
  } catch {
    // silencia erros de tracking
  }
};
