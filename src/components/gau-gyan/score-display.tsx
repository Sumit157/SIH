'use client';

import { Card, CardContent } from '@/components/ui/card';

interface ScoreDisplayProps {
  score: number;
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  const getScoreColor = () => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="flex flex-col items-center justify-center">
            <div className="relative h-24 w-24">
                <svg className="h-full w-full" width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                    <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-current text-gray-200 dark:text-gray-700"
                    strokeWidth="2"
                    ></circle>
                    <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-current text-primary"
                    strokeWidth="2"
                    strokeDasharray={`${score}, 100`}
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                    ></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-foreground">
                        {Math.round(score)}
                    </span>
                </div>
            </div>
        </div>
        <div className="flex-1">
            <h4 className="font-semibold text-lg">Animal Type Classification (ATC)</h4>
            <p className="text-sm text-muted-foreground">This score represents the overall quality based on standardized body structure evaluation.</p>
        </div>
      </CardContent>
    </Card>
  );
}
