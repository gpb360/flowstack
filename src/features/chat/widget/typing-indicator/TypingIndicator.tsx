/**
 * Typing Indicator Component
 * Animated dots showing when someone is typing
 */

interface TypingIndicatorProps {
  agentName?: string;
}

export function TypingIndicator({ agentName }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      {agentName && (
        <span className="text-xs text-gray-500">{agentName} is typing</span>
      )}
      <div className="flex gap-1">
        <TypingDot delay={0} />
        <TypingDot delay={150} />
        <TypingDot delay={300} />
      </div>
    </div>
  );
}

function TypingDot({ delay }: { delay: number }) {
  return (
    <span
      className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: '1.4s',
      }}
    />
  );
}
