import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SupportedLanguage } from '@/types/conversation';

type QuickstartPreCallCardProps = {
  isLoading: boolean;
  error: string | null;
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  onStartConversation: () => void;
};

const LANGUAGES: Array<{ code: SupportedLanguage; label: string }> = [
  { code: 'auto', label: '🌐 Auto-Detect' },
  { code: 'en', label: '🇺🇸 English' },
  { code: 'ta', label: '🇮🇳 தமிழ்' },
  { code: 'hi', label: '🇮🇳 हिन्दी' },
  { code: 'ml', label: '🇮🇳 മലയാളം' },
  { code: 'kn', label: '🇮🇳 ಕನ್ನಡ' },
  { code: 'te', label: '🇮🇳 తెలుగు' },
];

export function QuickstartPreCallCard({
  isLoading,
  error,
  selectedLanguage,
  onLanguageChange,
  onStartConversation,
}: QuickstartPreCallCardProps) {
  return (
    <div
      className="mx-auto flex w-[min(92vw,26.25rem)] animate-fade-up flex-col items-center rounded-[20px] border border-[#2b2b2b] px-10 py-10 text-center shadow-[0_10px_24px_rgba(0,0,0,0.28)]"
      style={{
        backgroundImage:
          'linear-gradient(164.988deg, rgba(54,54,54,0.2) 1.0596%, rgba(0,0,0,0) 96.089%), linear-gradient(90deg, rgb(16,16,16) 0%, rgb(16,16,16) 100%)',
      }}
    >
      <h1 className="text-[26px] font-medium leading-[1.2] text-white">
        AI Legal & Knowledge Assistant
      </h1>
      <p className="mt-[12px] text-xs font-normal leading-5 text-muted-foreground">
        Ask general questions, explain legal topics, or get step-by-step
        guidance for real-world complaints across 6 Indian languages.
      </p>

      {/* Language Selector */}
      <div className="mt-8 flex w-full flex-col items-start gap-1.5 text-left">
        <label
          htmlFor="language-select"
          className="text-xs font-medium text-muted-foreground"
        >
          Spoken Language
        </label>
        <div className="relative w-full">
          <select
            id="language-select"
            value={selectedLanguage}
            onChange={(e) =>
              onLanguageChange(e.target.value as SupportedLanguage)
            }
            disabled={isLoading}
            className="w-full appearance-none rounded-lg border border-[#2b2b2b] bg-[#161616] px-3.5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:border-[#404040] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            aria-label="Select conversation language"
          >
            {LANGUAGES.map((lang) => (
              <option
                key={lang.code}
                value={lang.code}
                className="bg-[#1a1a1a] py-1 text-white"
              >
                {lang.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      <Button
        onClick={onStartConversation}
        disabled={isLoading}
        className="mt-8 h-10 w-full rounded-lg border border-primary bg-primary text-sm font-medium text-black hover:border-white hover:bg-white hover:text-black disabled:hover:border-primary disabled:hover:bg-primary disabled:hover:text-black"
        aria-label={
          isLoading
            ? 'Starting conversation with AI agent'
            : 'Start conversation with AI agent'
        }
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Starting...
          </>
        ) : (
          'Start Conversation'
        )}
      </Button>
      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
    </div>
  );
}
