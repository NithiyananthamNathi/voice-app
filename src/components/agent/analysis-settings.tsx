"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Languages, BarChart3 } from "lucide-react";
import {
  EvaluationCriteriaEditor,
  type EvaluationCriterion,
} from "./evaluation-criteria-editor";
import {
  DataCollectionEditor,
  type DataCollectionPoint,
} from "./data-collection-editor";

interface AnalysisSettingsProps {
  evaluationCriteria: EvaluationCriterion[];
  dataCollectionPoints: DataCollectionPoint[];
  analysisLanguage: string;
  enableAnalysis: boolean;
  onEvaluationCriteriaChange: (criteria: EvaluationCriterion[]) => void;
  onDataCollectionPointsChange: (dataPoints: DataCollectionPoint[]) => void;
  onAnalysisLanguageChange: (language: string) => void;
  onEnableAnalysisChange: (enabled: boolean) => void;
  disabled?: boolean;
}

const languages = [
  { value: "auto", label: "Auto (infer from conversation)" },
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "nl", label: "Dutch" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
];

export function AnalysisSettings({
  evaluationCriteria,
  dataCollectionPoints,
  analysisLanguage,
  enableAnalysis,
  onEvaluationCriteriaChange,
  onDataCollectionPointsChange,
  onAnalysisLanguageChange,
  onEnableAnalysisChange,
  disabled = false,
}: AnalysisSettingsProps) {
  const totalCriteria = evaluationCriteria.filter((c) => c.isActive).length;
  const totalDataPoints = dataCollectionPoints.filter((dp) => dp.isActive).length;

  return (
    <div className="space-y-6">
      {/* Analysis Overview Card */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-50 border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <BarChart3 className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-gray-900">Conversation Analysis</CardTitle>
                <CardDescription className="text-gray-600">
                  Automatically evaluate conversations and extract insights
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                  {totalCriteria} criteria
                </Badge>
                <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
                  {totalDataPoints} data points
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="enable-analysis" className="text-sm text-gray-600">
                  Enable Analysis
                </Label>
                <Switch
                  id="enable-analysis"
                  checked={enableAnalysis}
                  onCheckedChange={onEnableAnalysisChange}
                  disabled={disabled}
                />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Analysis Language */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Languages className="h-5 w-5 text-purple-600" />
            Analysis Language
          </CardTitle>
          <CardDescription className="text-gray-500">
            Language used for conversation analysis and data extraction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={analysisLanguage}
            onValueChange={onAnalysisLanguageChange}
            disabled={disabled || !enableAnalysis}
          >
            <SelectTrigger className="w-full max-w-md bg-white border-gray-300">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              {languages.map((lang) => (
                <SelectItem
                  key={lang.value}
                  value={lang.value}
                  className="text-gray-700 hover:bg-gray-100"
                >
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-2">
            &quot;Auto&quot; will detect the language from conversation content
          </p>
        </CardContent>
      </Card>

      {/* Evaluation Criteria */}
      <EvaluationCriteriaEditor
        criteria={evaluationCriteria}
        onChange={onEvaluationCriteriaChange}
        disabled={disabled || !enableAnalysis}
      />

      {/* Data Collection */}
      <DataCollectionEditor
        dataPoints={dataCollectionPoints}
        onChange={onDataCollectionPointsChange}
        disabled={disabled || !enableAnalysis}
      />
    </div>
  );
}

export type { EvaluationCriterion, DataCollectionPoint };
