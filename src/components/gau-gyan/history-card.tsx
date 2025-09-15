
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Trash2 } from 'lucide-react';
import type { HistoryItem } from '@/app/page';
import Image from 'next/image';

interface HistoryCardProps {
    history: HistoryItem[];
    onClearHistory: () => void;
    onSelectHistoryItem: (item: HistoryItem) => void;
}

export function HistoryCard({ history, onClearHistory, onSelectHistoryItem }: HistoryCardProps) {
    if (history.length === 0) {
        return null;
    }

    return (
        <Card className="no-print">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Analysis History</CardTitle>
                    <CardDescription>Review your past analyses.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={onClearHistory}>
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only">Clear History</span>
                </Button>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                        {history.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50 cursor-pointer" onClick={() => onSelectHistoryItem(item)}>
                                <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                                    <Image src={item.image} alt={`Analyzed animal from ${item.timestamp}`} fill objectFit="cover" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">ATC Score: {item.atcScore.toFixed(2)}</p>
                                    <p className="text-sm text-muted-foreground">{item.breed}</p>
                                    <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

