/** biome-ignore-all lint/a11y/noStaticElementInteractions: <ignroe> */

import { useMutation } from '@tanstack/react-query';
import { FileText, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ProcessedData = {
  markdown: string;
  classification: {
    document_type: string;
    confidence: number;
    reasoning: string;
  };
} & Record<string, any>;

export const DocumentProcessorPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const acceptedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'text/csv',
  ];
  const acceptedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.csv'];

  const parseDocument = useMutation<{ data: ProcessedData }, Error, File>({
    mutationFn: async (selectedFile: File) => {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('http://localhost:8002/document/parse', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Request failed with status ${res.status}`);
      }

      const data = (await res.json()) as { data: ProcessedData };
      return data;
    },
    onSuccess: () => {
      toast.success('Document has been successfully processed.');
    },
    onError: (error) => {
      toast.error(`Failed to process document: ${error.message}`);
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelection(droppedFile);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    if (!acceptedTypes.includes(selectedFile.type)) {
      // toast({
      //   title: 'Invalid file type',
      //   description: 'Please upload JPG, PNG, WEBP, PDF, or CSV files only.',
      //   variant: 'destructive',
      // });
      toast.error(
        'Invalid file type. Please upload JPG, PNG, WEBP, PDF, or CSV files only.',
      );
      return;
    }

    setFile(selectedFile);
    parseDocument.reset();

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }

    toast.success(`${selectedFile.name} is ready to process.`);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelection(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    parseDocument.reset();
  };

  const processDocument = async () => {
    if (!file) return;
    parseDocument.mutate(file);
  };

  const data = parseDocument?.data?.data;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Document Processor
          </h1>
          <p className="mt-2 text-muted-foreground">
            Upload and process your documents with ease
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>
              Supported formats: JPG, PNG, WEBP, PDF, CSV
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <input
                  type="file"
                  accept={acceptedExtensions.join(',')}
                  onChange={handleFileInput}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium">Drop your file here</p>
                <p className="text-sm text-muted-foreground">
                  or click to browse
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-4 rounded-lg border bg-card p-4">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-20 w-20 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded bg-muted">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                    disabled={parseDocument.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  onClick={processDocument}
                  disabled={parseDocument.isPending}
                  className="w-full"
                >
                  {parseDocument.isPending ? 'Processing...' : 'Proceed'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {data && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Classification Result</CardTitle>
                <CardDescription>
                  Document type identification and analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Document Type
                    </p>
                    <p className="text-lg font-semibold">
                      {data?.classification?.document_type}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Confidence
                    </p>
                    <p className="text-lg font-semibold">
                      {(data?.classification.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Reason
                  </p>
                  <p className="text-sm leading-relaxed">
                    {data?.classification.reasoning}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Extraction Results</CardTitle>
                <CardDescription>
                  View extracted data in JSON or Markdown format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="json" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="json">JSON</TabsTrigger>
                    <TabsTrigger value="markdown">Markdown</TabsTrigger>
                  </TabsList>
                  <TabsContent value="json" className="mt-4">
                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                      <code>{JSON.stringify(data || {}, null, 2)}</code>
                    </pre>
                  </TabsContent>
                  <TabsContent value="markdown" className="mt-4">
                    <div className="prose prose-sm max-w-none rounded-lg bg-muted p-4 dark:prose-invert">
                      <pre className="whitespace-pre-wrap">
                        {data?.markdown ?? ''}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};
