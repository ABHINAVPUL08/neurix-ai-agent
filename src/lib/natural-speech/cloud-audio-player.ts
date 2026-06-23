"use client";

type PlayOptions = {
  generation: number;
  isCurrentGeneration: () => boolean;
  onStart: () => void;
};

class CloudAudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private objectUrl: string | null = null;

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.onended = null;
      this.audio.onerror = null;
      this.audio.src = "";
      this.audio = null;
    }
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  async playBlob(blob: Blob, options: PlayOptions): Promise<boolean> {
    this.stop();

    const url = URL.createObjectURL(blob);
    this.objectUrl = url;

    const audio = new Audio(url);
    this.audio = audio;

    return new Promise((resolve) => {
      let settled = false;
      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true;
        if (!ok) this.stop();
        resolve(ok);
      };

      audio.onplay = () => {
        if (!options.isCurrentGeneration()) {
          this.stop();
          finish(false);
          return;
        }
        options.onStart();
      };

      audio.onended = () => finish(true);

      audio.onerror = () => finish(false);

      void audio.play().catch(() => finish(false));
    });
  }
}

export const cloudAudioPlayer = new CloudAudioPlayer();

export async function fetchIndianTtsAudio(text: string): Promise<Blob | null> {
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) return null;

    const blob = await res.blob();
    if (!blob.size || !blob.type.startsWith("audio/")) return null;
    return blob;
  } catch {
    return null;
  }
}
