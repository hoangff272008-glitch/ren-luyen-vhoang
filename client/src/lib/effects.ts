import confetti from 'canvas-confetti';

const SUCCESS_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2013/success-fanfare-trumpets-618.wav';
const CLICK_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2571/pop-down-sound-2571.wav';

class EffectsManager {
  private successAudio: HTMLAudioElement | null = null;
  private clickAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.successAudio = new Audio(SUCCESS_SOUND_URL);
      this.clickAudio = new Audio(CLICK_SOUND_URL);
      this.successAudio.volume = 0.5;
      this.clickAudio.volume = 0.3;
    }
  }

  playSuccess() {
    if (this.successAudio) {
      this.successAudio.currentTime = 0;
      this.successAudio.play().catch(() => {});
    }
    
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF4500', '#00FF00', '#00BFFF']
    });
  }

  playClick() {
    if (this.clickAudio) {
      this.clickAudio.currentTime = 0;
      this.clickAudio.play().catch(() => {});
    }
  }
}

export const effectsManager = new EffectsManager();
