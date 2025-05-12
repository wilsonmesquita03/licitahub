"use client"; // Necessário para interatividade

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { analyzePdf } from '@/app/actions';

export default function AnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Por favor, selecione um arquivo primeiro');
      return;
    }

    setIsLoading(true);
    try {
      const { message }  = await analyzePdf(file)

      setAnalysisResult(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Analisador de editais</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Envie seu edital para análise</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Input 
                id="file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Formatos suportados: PDF, DOC, DOCX
              </p>
            </div>

            {file && (
              <div className="flex items-center gap-2">
                <p className="text-sm">Arquivo selecionado: {file?.name}</p>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <Button 
              type="submit"
              disabled={!file || isLoading}
            >
              {isLoading ? 'Analisando...' : 'Iniciar Análise'}
            </Button>
          </form>
        </CardContent>

        {isLoading && (
          <CardFooter className="flex flex-col gap-2">
            <Progress value={33} className="w-[60%]" /> {/* Ajuste o progresso conforme necessário */}
            <p className="text-sm text-muted-foreground">
              Processando arquivo...
            </p>
          </CardFooter>
        )}
      </Card>

      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado da Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: analysisResult || "" }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}