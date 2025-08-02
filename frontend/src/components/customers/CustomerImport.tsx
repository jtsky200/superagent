'use client';

// 📊 CADILLAC EV CIS - Customer Import Component
// Swiss market CSV import with DSGVO compliance

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Users,
  MapPin,
  Languages,
  Shield,
  Clock,
  BarChart3,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

// Swiss market types
interface SwissCustomer {
  rowNumber: number;
  title?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  company?: string;
  position?: string;
  street: string;
  postalCode: string;
  city: string;
  canton: string;
  preferredLanguage: 'de' | 'fr' | 'it' | 'en';
  birthDate?: string;
  status?: string;
  vehicleInterest?: string;
  notes?: string;
  source?: string;
  campaign?: string;
  dsgvoConsent: boolean;
  marketingConsent: boolean;
  errors?: string[];
}

interface ImportProgress {
  importId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  processedRows: number;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  importedRows: number;
  startTime: string;
  endTime?: string;
  errors?: string[];
  warnings?: string[];
}

interface ValidationResult {
  success: boolean;
  validCustomers: SwissCustomer[];
  invalidCustomers: Array<{
    rowNumber: number;
    customer: Partial<SwissCustomer>;
    errors: string[];
  }>;
  duplicates: Array<{
    rowNumber: number;
    customer: SwissCustomer;
    existingCustomerId: string;
    matchField: 'email' | 'phone';
  }>;
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    duplicateRows: number;
  };
}

// Swiss cantons for validation
const SWISS_CANTONS = [
  { code: 'AG', name: 'Aargau' },
  { code: 'AI', name: 'Appenzell Innerrhoden' },
  { code: 'AR', name: 'Appenzell Ausserrhoden' },
  { code: 'BE', name: 'Bern' },
  { code: 'BL', name: 'Basel-Landschaft' },
  { code: 'BS', name: 'Basel-Stadt' },
  { code: 'FR', name: 'Fribourg' },
  { code: 'GE', name: 'Genève' },
  { code: 'GL', name: 'Glarus' },
  { code: 'GR', name: 'Graubünden' },
  { code: 'JU', name: 'Jura' },
  { code: 'LU', name: 'Luzern' },
  { code: 'NE', name: 'Neuchâtel' },
  { code: 'NW', name: 'Nidwalden' },
  { code: 'OW', name: 'Obwalden' },
  { code: 'SG', name: 'St. Gallen' },
  { code: 'SH', name: 'Schaffhausen' },
  { code: 'SO', name: 'Solothurn' },
  { code: 'SZ', name: 'Schwyz' },
  { code: 'TG', name: 'Thurgau' },
  { code: 'TI', name: 'Ticino' },
  { code: 'UR', name: 'Uri' },
  { code: 'VD', name: 'Vaud' },
  { code: 'VS', name: 'Valais' },
  { code: 'ZG', name: 'Zug' },
  { code: 'ZH', name: 'Zürich' }
];

const CustomerImport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'validate' | 'import' | 'progress'>('upload');
  const [language, setLanguage] = useState<'de' | 'fr' | 'it'>('de');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [updateExisting, setUpdateExisting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'text/csv') {
      setUploadedFile(file);
      setActiveTab('validate');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  // Validation messages by language
  const messages = {
    de: {
      uploadTitle: 'CSV-Datei hochladen',
      uploadDescription: 'Laden Sie Ihre Kundendaten im CSV-Format hoch',
      dragAndDrop: 'CSV-Datei hier hinziehen oder klicken zum Auswählen',
      fileSelected: 'Datei ausgewählt',
      validateData: 'Daten validieren',
      importData: 'Daten importieren',
      downloadTemplate: 'Vorlage herunterladen',
      swissCompliance: 'DSGVO-konform',
      validationResults: 'Validierungsergebnisse',
      importProgress: 'Import-Fortschritt',
      totalRows: 'Gesamtzeilen',
      validRows: 'Gültige Zeilen',
      invalidRows: 'Ungültige Zeilen',
      duplicateRows: 'Duplikate',
      processing: 'Verarbeitung läuft...',
      completed: 'Abgeschlossen',
      failed: 'Fehlgeschlagen',
      previewData: 'Datenvorschau',
      errors: 'Fehler',
      warnings: 'Warnungen'
    },
    fr: {
      uploadTitle: 'Télécharger fichier CSV',
      uploadDescription: 'Téléchargez vos données clients au format CSV',
      dragAndDrop: 'Glissez le fichier CSV ici ou cliquez pour sélectionner',
      fileSelected: 'Fichier sélectionné',
      validateData: 'Valider les données',
      importData: 'Importer les données',
      downloadTemplate: 'Télécharger le modèle',
      swissCompliance: 'Conforme RGPD',
      validationResults: 'Résultats de validation',
      importProgress: 'Progression import',
      totalRows: 'Lignes totales',
      validRows: 'Lignes valides',
      invalidRows: 'Lignes invalides',
      duplicateRows: 'Doublons',
      processing: 'Traitement en cours...',
      completed: 'Terminé',
      failed: 'Échec',
      previewData: 'Aperçu des données',
      errors: 'Erreurs',
      warnings: 'Avertissements'
    },
    it: {
      uploadTitle: 'Carica file CSV',
      uploadDescription: 'Carica i dati dei tuoi clienti in formato CSV',
      dragAndDrop: 'Trascina il file CSV qui o clicca per selezionare',
      fileSelected: 'File selezionato',
      validateData: 'Valida dati',
      importData: 'Importa dati',
      downloadTemplate: 'Scarica modello',
      swissCompliance: 'Conforme GDPR',
      validationResults: 'Risultati validazione',
      importProgress: 'Progresso importazione',
      totalRows: 'Righe totali',
      validRows: 'Righe valide',
      invalidRows: 'Righe non valide',
      duplicateRows: 'Duplicati',
      processing: 'Elaborazione in corso...',
      completed: 'Completato',
      failed: 'Fallito',
      previewData: 'Anteprima dati',
      errors: 'Errori',
      warnings: 'Avvisi'
    }
  };

  const t = messages[language];

  // Download CSV template
  const downloadTemplate = async () => {
    try {
      const response = await fetch(`/api/customers/import/template?language=${language}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cadillac-customer-template-${language}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Template download failed:', error);
    }
  };

  // Validate uploaded CSV
  const validateCsv = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('language', language);

      const response = await fetch('/api/customers/import/validate', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Validation failed');
      }

      const result: ValidationResult = await response.json();
      setValidationResult(result);
      setActiveTab('validate');
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Import validated customers
  const importCustomers = async () => {
    if (!validationResult || !validationResult.validCustomers.length) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/customers/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customers: validationResult.validCustomers,
          skipDuplicates,
          updateExisting,
          importSource: 'csv_upload'
        })
      });

      if (!response.ok) {
        throw new Error('Import failed');
      }

      const result = await response.json();
      setImportProgress(result.progress);
      setActiveTab('progress');
      
      // Poll for progress updates
      pollImportProgress(result.importId);
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Poll import progress
  const pollImportProgress = async (importId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/customers/import/progress/${importId}`);
        if (response.ok) {
          const progress: ImportProgress = await response.json();
          setImportProgress(progress);
          
          if (progress.status === 'completed' || progress.status === 'failed') {
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error('Progress polling failed:', error);
        clearInterval(pollInterval);
      }
    }, 2000);
  };

  // Reset import process
  const resetImport = () => {
    setUploadedFile(null);
    setValidationResult(null);
    setImportProgress(null);
    setActiveTab('upload');
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          📊 Kunden-Import
        </h1>
        <p className="text-lg text-gray-600">
          CSV-Import für Schweizer CADILLAC EV Kundendaten
        </p>
        
        {/* Language Selection */}
        <div className="flex items-center justify-center gap-4">
          <Languages className="h-5 w-5 text-gray-500" />
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'de' | 'fr' | 'it')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
            <option value="it">Italiano</option>
          </select>
        </div>
      </div>

      {/* Swiss Compliance Badge */}
      <div className="flex justify-center">
        <Badge variant="outline" className="flex items-center gap-2 px-4 py-2">
          <Shield className="h-4 w-4 text-green-500" />
          🇨🇭 {t.swissCompliance}
        </Badge>
      </div>

      {/* Import Process Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="validate" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Validierung
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Import
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Status
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                {t.uploadTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Area */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} ref={fileInputRef} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {t.dragAndDrop}
                </p>
                <p className="text-sm text-gray-500">
                  Max. 10MB • CSV-Format • Schweizer Kundendaten
                </p>
              </div>

              {/* Selected File */}
              {uploadedFile && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>
                      {t.fileSelected}: {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedFile(null)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t.downloadTemplate}
                </Button>
                
                <Button
                  onClick={validateCsv}
                  disabled={!uploadedFile || isProcessing}
                  className="flex items-center gap-2"
                >
                  {isProcessing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  {t.validateData}
                </Button>
              </div>

              {/* Template Information */}
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">🇨🇭 Swiss Market CSV Requirements:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• <strong>Pflichtfelder:</strong> Vorname, Nachname, E-Mail, Adresse, PLZ, Ort, Kanton</li>
                    <li>• <strong>Swiss PLZ:</strong> 4-stellige Postleitzahl (z.B. 8001)</li>
                    <li>• <strong>Kanton:</strong> 2-Buchstaben Code (ZH, BE, GE, etc.)</li>
                    <li>• <strong>Sprache:</strong> de, fr, it, en</li>
                    <li>• <strong>DSGVO:</strong> Zustimmung erforderlich (ja/nein)</li>
                    <li>• <strong>Telefon:</strong> Schweizer Format (+41...)</li>
                  </ul>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validate" className="space-y-6">
          {validationResult && (
            <>
              {/* Validation Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    {t.validationResults}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-700">
                        {validationResult.summary.totalRows}
                      </div>
                      <div className="text-sm text-gray-500">{t.totalRows}</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {validationResult.summary.validRows}
                      </div>
                      <div className="text-sm text-gray-500">{t.validRows}</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {validationResult.summary.invalidRows}
                      </div>
                      <div className="text-sm text-gray-500">{t.invalidRows}</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {validationResult.summary.duplicateRows}
                      </div>
                      <div className="text-sm text-gray-500">{t.duplicateRows}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Validierung</span>
                      <span>{Math.round((validationResult.summary.validRows / validationResult.summary.totalRows) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(validationResult.summary.validRows / validationResult.summary.totalRows) * 100} 
                      className="h-2"
                    />
                  </div>

                  {/* Import Options */}
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={skipDuplicates}
                          onChange={(e) => setSkipDuplicates(e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Duplikate überspringen</span>
                      </label>
                      
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={updateExisting}
                          onChange={(e) => setUpdateExisting(e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Existierende aktualisieren</span>
                      </label>
                    </div>

                    <Button
                      onClick={importCustomers}
                      disabled={validationResult.summary.validRows === 0 || isProcessing}
                      className="flex items-center gap-2"
                    >
                      {isProcessing ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Users className="h-4 w-4" />
                      )}
                      {t.importData} ({validationResult.summary.validRows} Kunden)
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Error Details */}
              {validationResult.invalidCustomers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-5 w-5" />
                      {t.errors} ({validationResult.invalidCustomers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {validationResult.invalidCustomers.slice(0, 10).map((invalid, index) => (
                        <Alert key={index} variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Zeile {invalid.rowNumber}:</strong> {invalid.errors.join(', ')}
                          </AlertDescription>
                        </Alert>
                      ))}
                      {validationResult.invalidCustomers.length > 10 && (
                        <p className="text-sm text-gray-500 text-center">
                          ... und {validationResult.invalidCustomers.length - 10} weitere Fehler
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Duplicate Details */}
              {validationResult.duplicates.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-600">
                      <AlertTriangle className="h-5 w-5" />
                      {t.duplicateRows} ({validationResult.duplicates.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {validationResult.duplicates.slice(0, 5).map((duplicate, index) => (
                        <Alert key={index}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Zeile {duplicate.rowNumber}:</strong> Duplikat gefunden ({duplicate.matchField}: {duplicate.customer[duplicate.matchField]})
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Valid Customers Preview */}
              {validationResult.validCustomers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <Eye className="h-5 w-5" />
                      {t.previewData} ({validationResult.validCustomers.length} Kunden)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Name</th>
                            <th className="text-left p-2">E-Mail</th>
                            <th className="text-left p-2">Ort</th>
                            <th className="text-left p-2">Kanton</th>
                            <th className="text-left p-2">Sprache</th>
                            <th className="text-left p-2">DSGVO</th>
                          </tr>
                        </thead>
                        <tbody>
                          {validationResult.validCustomers.slice(0, 5).map((customer, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2">
                                {customer.firstName} {customer.lastName}
                              </td>
                              <td className="p-2">{customer.email}</td>
                              <td className="p-2">{customer.city}</td>
                              <td className="p-2">
                                <Badge variant="outline">{customer.canton}</Badge>
                              </td>
                              <td className="p-2">
                                <Badge variant="secondary">{customer.preferredLanguage}</Badge>
                              </td>
                              <td className="p-2">
                                {customer.dsgvoConsent ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {validationResult.validCustomers.length > 5 && (
                        <p className="text-sm text-gray-500 text-center mt-2">
                          ... und {validationResult.validCustomers.length - 5} weitere Kunden
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Import Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Import options and configuration will be shown here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          {importProgress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t.importProgress}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Badge */}
                <div className="flex items-center gap-4">
                  <Badge 
                    variant={
                      importProgress.status === 'completed' ? 'default' :
                      importProgress.status === 'failed' ? 'destructive' :
                      'secondary'
                    }
                    className="flex items-center gap-2"
                  >
                    {importProgress.status === 'processing' && <RefreshCw className="h-4 w-4 animate-spin" />}
                    {importProgress.status === 'completed' && <CheckCircle className="h-4 w-4" />}
                    {importProgress.status === 'failed' && <XCircle className="h-4 w-4" />}
                    {importProgress.status === 'processing' ? t.processing :
                     importProgress.status === 'completed' ? t.completed :
                     importProgress.status === 'failed' ? t.failed : importProgress.status}
                  </Badge>
                  
                  <div className="text-sm text-gray-500">
                    <Clock className="h-4 w-4 inline mr-1" />
                    {new Date(importProgress.startTime).toLocaleString('de-CH')}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fortschritt</span>
                    <span>{importProgress.progress}%</span>
                  </div>
                  <Progress value={importProgress.progress} className="h-3" />
                  <div className="text-sm text-gray-500 text-center">
                    {importProgress.processedRows} / {importProgress.totalRows} Zeilen verarbeitet
                  </div>
                </div>

                {/* Import Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      {importProgress.importedRows}
                    </div>
                    <div className="text-sm text-gray-500">Importiert</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-600">
                      {importProgress.invalidRows}
                    </div>
                    <div className="text-sm text-gray-500">Fehler</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xl font-bold text-yellow-600">
                      {importProgress.duplicateRows}
                    </div>
                    <div className="text-sm text-gray-500">Duplikate</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {Math.round((importProgress.importedRows / importProgress.totalRows) * 100)}%
                    </div>
                    <div className="text-sm text-gray-500">Erfolgsrate</div>
                  </div>
                </div>

                {/* Errors and Warnings */}
                {importProgress.errors && importProgress.errors.length > 0 && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{t.errors}:</strong>
                      <ul className="mt-2 space-y-1">
                        {importProgress.errors.slice(0, 3).map((error, index) => (
                          <li key={index} className="text-sm">• {error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {importProgress.warnings && importProgress.warnings.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{t.warnings}:</strong>
                      <ul className="mt-2 space-y-1">
                        {importProgress.warnings.slice(0, 3).map((warning, index) => (
                          <li key={index} className="text-sm">• {warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={resetImport}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Neuer Import
                  </Button>
                  
                  {importProgress.status === 'completed' && (
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = '/customers'}
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Zu Kundenliste
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerImport;