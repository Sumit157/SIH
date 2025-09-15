
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { UploadForm } from '@/components/gau-gyan/upload-form';
import { Scorecard } from '@/components/gau-gyan/scorecard';
import { type AtcScoreResult, getAtcScore } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { HistoryCard } from '@/components/gau-gyan/history-card';

export type HistoryItem = AtcScoreResult & {
  id: string;
  image: string;
  timestamp: string;
};

export default function Home() {
  const [result, setResult] = useState<AtcScoreResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('gauGyanHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
    }
  }, []);

  const handleAnalyze = async (imageDataUri: string) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const analysisResult = await getAtcScore(imageDataUri);
      if (!analysisResult.atcScore || !analysisResult.bodyLength) {
        throw new Error('Analysis failed to return complete data.');
      }
      setResult(analysisResult);
      
      const newHistoryItem: HistoryItem = {
        ...analysisResult,
        id: new Date().toISOString(),
        image: imageDataUri,
        timestamp: new Date().toLocaleString(),
      };

      const updatedHistory = [newHistoryItem, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('gauGyanHistory', JSON.stringify(updatedHistory));

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setResult(null);
    setImagePreview(null);
    setError(null);
  }

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('gauGyanHistory');
    toast({
        title: 'History Cleared',
        description: 'Your analysis history has been removed.',
    });
  }

  const handleSelectFromHistory = (item: HistoryItem) => {
    setImagePreview(item.image);
    setResult(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const renderContent = () => {
    if (isLoading && !result) {
       return (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <Skeleton className="h-8 w-1/2" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      );
    }

    if (error) {
       return (
         <Card className="flex items-center justify-center h-full min-h-[400px] border-dashed">
            <CardContent className="p-6 text-center">
               <Alert variant="destructive">
                 <AlertTriangle className="h-4 w-4" />
                 <AlertTitle>Analysis Error</AlertTitle>
                 <AlertDescription>
                   {error} Please try again.
                 </AlertDescription>
               </Alert>
             </CardContent>
           </Card>
       )
    }

    if (result && imagePreview) {
      return <Scorecard result={result} image={imagePreview} />;
    }

    return (
       <Card className="flex items-center justify-center h-full min-h-[400px] border-dashed">
         <CardContent className="p-6 text-center text-muted-foreground">
           <p className="text-lg font-medium">Results will be displayed here</p>
           <p>Upload an image to start the analysis.</p>
         </CardContent>
       </Card>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <UploadForm onAnalyze={handleAnalyze} imagePreview={imagePreview} setImagePreview={setImagePreview} isLoading={isLoading} hasResult={!!result} onNewAnalysis={handleNewAnalysis} />
          <HistoryCard history={history} onClearHistory={handleClearHistory} onSelectHistoryItem={handleSelectFromHistory} />
        </div>
        <div className="lg:col-span-3">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

