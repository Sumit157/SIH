'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { AtcScoreResult } from '@/app/actions';
import { TraitsChart } from './traits-chart';
import { ScoreDisplay } from './score-display';
import { Logo } from '../icons/logo';

interface ScorecardProps {
  result: AtcScoreResult;
  image: string;
}

const traitLabels: Record<keyof Omit<AtcScoreResult, 'atcScore' | 'salientTraits'>, string> = {
    bodyLength: "Body Length",
    chestWidth: "Chest Width",
    heightAtWithers: "Height at Withers",
    rumpAngle: "Rump Angle",
    udderShape: "Udder Shape",
};

export function Scorecard({ result, image }: ScorecardProps) {
  const handlePrint = () => {
    window.print();
  };
  
  const traitDataForChart = Object.entries(result)
    .filter(([key]) => typeof result[key as keyof AtcScoreResult] === 'number' && key !== 'atcScore' && key !== 'rumpAngle')
    .map(([key, value]) => ({
      name: traitLabels[key as keyof typeof traitLabels],
      value: value as number,
    }));

  const rumpAngleData = [{
      name: traitLabels.rumpAngle,
      value: result.rumpAngle,
  }]

  return (
    <Card className="print-container w-full">
      <div className="hidden print-header p-6">
        <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-bold text-lg">Gau Gyan - Analysis Report</span>
        </div>
        <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</p>
      </div>

      <CardHeader className="flex flex-row items-center justify-between no-print">
        <div>
          <CardTitle>Analysis Results</CardTitle>
          <CardDescription>ATC Score and extracted traits.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h3 className="font-semibold text-lg md:hidden">Animal Image</h3>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                    <Image src={image} alt="Analyzed animal" layout="fill" objectFit="contain" />
                </div>
            </div>
            <div className="space-y-4">
                 <h3 className="font-semibold text-lg">Overall Score</h3>
                <ScoreDisplay score={result.atcScore} />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Salient Traits</h3>
                  <p className="text-sm text-muted-foreground">{result.salientTraits}</p>
                </div>
            </div>
        </div>
        
        <div>
          <h3 className="font-semibold text-lg mb-4">Extracted Traits</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Object.entries(result).map(([key, value]) => {
              if (traitLabels[key as keyof typeof traitLabels]) {
                return (
                  <Card key={key}>
                    <CardHeader className="p-4">
                      <CardDescription>{traitLabels[key as keyof typeof traitLabels]}</CardDescription>
                      <CardTitle className="text-2xl">
                        {value}
                        <span className="text-sm text-muted-foreground ml-1">
                          {key === 'udderShape' ? '' : (key === 'rumpAngle' ? '°' : 'cm')}
                        </span>
                      </CardTitle>
                    </CardHeader>
                  </Card>
                );
              }
              return null;
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div>
              <h3 className="font-semibold text-lg mb-4">Measurements (cm)</h3>
              <TraitsChart data={traitDataForChart} unit="cm" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Angle (degrees)</h3>
              <TraitsChart data={rumpAngleData} unit="°" />
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
