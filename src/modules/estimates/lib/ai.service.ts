import { AiAvailability, AiResult, AiSuggestion, Rate } from '../types';

const TIMEOUT_MS = 8000;
const MAX_FAILURES = 3;

class AiService {
  private failures = 0;
  private circuitOpen = false;

  private geminiKey = import.meta.env.VITE_GEMINI_KEY as string | undefined;
  private groqKey = import.meta.env.VITE_GROQ_KEY as string | undefined;
  private enabled = import.meta.env.VITE_AI_ENABLED === 'true';

  /** Доступен ли AI прямо сейчас */
  get availability(): AiAvailability {
    if (!this.enabled || !this.hasKeys() || this.circuitOpen) return 'disabled';
    return this.failures > 0 ? 'degraded' : 'ready';
  }

  private hasKeys() {
    return Boolean(this.geminiKey || this.groqKey);
  }

  /**
   * Главный метод: ВСЕГДА возвращает результат.
   * Цепочка: Gemini → Groq → локальный поиск.
   */
  async suggestRates(description: string, allRates: Rate[]): Promise<AiResult> {
    if (this.availability !== 'disabled') {
      try {
        const suggestions = await this.callLlm(description, allRates);
        this.failures = 0;
        return { suggestions, availability: 'ready' };
      } catch (e) {
        console.warn('[AI] LLM failed, switching to fallback', e);
        this.registerFailure();
      }
    }

    // Fallback: нечёткий локальный поиск. Работает всегда.
    const fallback = this.localSearch(description, allRates);
    return {
      suggestions: fallback,
      availability: this.availability,
      message: this.availability === 'disabled'
        ? 'ИИ недоступен (нет ключей или отключён). Показаны результаты поиска по справочнику.'
        : 'ИИ временно недоступен. Показаны результаты поиска по справочнику.',
    };
  }

  private registerFailure() {
    this.failures++;
    if (this.failures >= MAX_FAILURES) this.circuitOpen = true;
  }

  /** Сброс circuit breaker (например, по кнопке «Проверить AI снова») */
  reset() {
    this.failures = 0;
    this.circuitOpen = false;
  }

  private async callLlm(description: string, allRates: Rate[]): Promise<AiSuggestion[]> {
    const prompt = this.buildPrompt(description, allRates);
    // Пробуем Gemini, потом Groq
    if (this.geminiKey) return this.parseJson(await this.withTimeout(this.callGemini(prompt)));
    if (this.groqKey) return this.parseJson(await this.withTimeout(this.callGroq(prompt)));
    throw new Error('No AI keys');
  }

  private buildPrompt(description: string, allRates: Rate[]): string {
    const catalog = allRates.slice(0, 200).map(r => `${r.code} | ${r.name} | ${r.unit}`).join('\n');
    return `Ты — сметчик-электромонтажник. По описанию работ подбери 1-4 расценки ТОЛЬКО из списка ниже.
Описание: "${description}"
Доступные расценки:
${catalog}
Верни строго JSON-массив без пояснений:
[{"code":"...","name":"...","unit":"...","quantity":1,"reason":"кратко почему"}]`;
  }

  private async withTimeout<T>(p: Promise<T>): Promise<T> {
    return Promise.race([
      p,
      new Promise<T>((_, rej) => setTimeout(() => rej(new Error('AI timeout')), TIMEOUT_MS)),
    ]);
  }

  private async callGemini(prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.geminiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2 } }),
    });
    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  }

  private async callGroq(prompt: string): Promise<string> {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], temperature: 0.2 }),
    });
    if (!res.ok) throw new Error(`Groq ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  }

  private parseJson(raw: string): AiSuggestion[] {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const arr = JSON.parse(cleaned);
    return (Array.isArray(arr) ? arr : []).map(s => ({ ...s, source: 'ai' as const }));
  }

  /** Локальный нечёткий поиск — всегда работает, даже офлайн */
  private localSearch(query: string, allRates: Rate[]): AiSuggestion[] {
    const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    if (words.length === 0) return [];
    return allRates
      .map(r => {
        const text = `${r.code} ${r.name}`.toLowerCase();
        const score = words.reduce((s, w) => s + (text.includes(w) ? 1 : 0), 0);
        return { rate: r, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(x => ({
        rateId: x.rate.id, code: x.rate.code, name: x.rate.name, unit: x.rate.unit,
        quantity: 1, source: 'fallback' as const,
      }));
  }
}

export const aiService = new AiService();
