export function Logo({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 500 120" 
      className={className}
    >
      <defs>
        <linearGradient id="greenAiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FF9D" />
          <stop offset="100%" stopColor="#00C875" />
        </linearGradient>
      </defs>

      <g transform="translate(40, 20)">
        <path d="M 20 80 L 20 20" stroke="#64748B" strokeWidth={4} strokeLinecap="round" />
        
        <circle cx={20} cy={70} r={6} fill="#64748B" />
        <circle cx={20} cy={30} r={6} fill="#64748B" />
        
        <path d="M 20 70 C 50 70 50 45 50 40" stroke="url(#greenAiGradient)" strokeWidth={4} fill="none" strokeLinecap="round" />
        
        <path d="M 50 10 Q 50 25 65 25 Q 50 25 50 40 Q 50 25 35 25 Q 50 25 50 10 Z" fill="url(#greenAiGradient)" />
      </g>

      <text 
        x={125} 
        y={73} 
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
        fontWeight={700} 
        fontSize={44} 
        className="fill-foreground transition-colors"
      >
        Standup
      </text>
      
      <text 
        x={325} 
        y={73} 
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
        fontWeight={800} 
        fontSize={44} 
        fill="url(#greenAiGradient)"
      >
        AI
      </text>
    </svg>
  );
}
