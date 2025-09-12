'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileImage, Loader2, RotateCcw } from 'lucide-react';
import Image from 'next/image';

interface UploadFormProps {
  onAnalyze: (imageDataUri: string) => void;
  imagePreview: string | null;
  setImagePreview: (value: string | null) => void;
  isLoading: boolean;
  hasResult: boolean;
  onNewAnalysis: () => void;
}

export function UploadForm({ onAnalyze, imagePreview, setImagePreview, isLoading, hasResult, onNewAnalysis }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  }, [setImagePreview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg'] },
    multiple: false,
  });

  const handleSubmit = () => {
    if (imagePreview) {
      onAnalyze(imagePreview);
    }
  };

  if (hasResult && imagePreview) {
    return (
      <Card className="no-print">
         <CardHeader>
          <CardTitle>Analyzed Image</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video w-full mb-4">
             <Image src={imagePreview} alt="Uploaded animal" layout="fill" objectFit="contain" className="rounded-md" />
          </div>
          <Button onClick={onNewAnalysis} className="w-full">
            <RotateCcw className="mr-2 h-4 w-4" />
            Analyze Another Image
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="no-print">
      <CardHeader>
        <CardTitle>Upload Animal Image</CardTitle>
        <CardDescription>
          Capture or upload an image of cattle or buffalo for analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {imagePreview ? (
          <div className="space-y-4">
            <div className="relative aspect-video w-full">
               <Image src={imagePreview} alt="Preview" layout="fill" objectFit="contain" className="rounded-md" />
            </div>
            <div className="flex gap-2">
               <Button onClick={() => setImagePreview(null)} variant="outline" className="w-full">
                Change Image
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading} className="w-full bg-accent hover:bg-accent/90">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v2a1 1 0 01-1 1h-3.5a1 1 0 00-.8.4L10 13.92l-2.7-2.7a1 1 0 00-.8-.4H3a1 1 0 01-1-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5a1.5 1.5 0 013 0z" /><path d="M10 12.5a1.5 1.5 0 013 0v.5a1 1 0 001 1h3a1 1 0 011 1v2a1 1 0 01-1 1h-3.5a1 1 0 00-.8.4L10 19.92l-2.7-2.7a1 1 0 00-.8-.4H3a1 1 0 01-1-1v-2a1 1 0 011-1h3a1 1 0 001-1v-.5a1.5 1.5 0 013 0z" /></svg>
                )}
                Analyze
              </Button>
            </div>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-center text-muted-foreground">
              {isDragActive ? 'Drop the image here...' : 'Drag & drop an image, or click to select'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, JPEG</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
