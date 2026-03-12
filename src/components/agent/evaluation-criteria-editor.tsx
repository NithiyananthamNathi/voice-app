"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Scale,
  FileText,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  prompt: string;
  type: "boolean" | "scale" | "text";
  isActive: boolean;
}

interface EvaluationCriteriaEditorProps {
  criteria: EvaluationCriterion[];
  onChange: (criteria: EvaluationCriterion[]) => void;
  disabled?: boolean;
}

const defaultCriteria: Omit<EvaluationCriterion, "id">[] = [
  {
    name: "POSITIVE INTERACTION",
    description: "Evaluate if the user had a positive experience",
    prompt: "Analyze if the user walked away satisfied with the conversation. Consider the tone, resolution of their query, and any feedback provided.",
    type: "boolean",
    isActive: true,
  },
  {
    name: "UNDERSTANDING ROOT CAUSE",
    description: "Check if the agent correctly identified the user's underlying issue",
    prompt: "Evaluate whether the AI agent correctly identified and understood the root cause of the user's concern or question.",
    type: "boolean",
    isActive: true,
  },
  {
    name: "RESOLVED ENQUIRY",
    description: "Determine if the agent successfully solved the user's problem",
    prompt: "Assess whether the user's enquiry or problem was fully resolved during the conversation.",
    type: "boolean",
    isActive: true,
  },
  {
    name: "HALLUCINATION CHECK",
    description: "Detect if the agent provided incorrect information",
    prompt: "Check if the agent hallucinated or provided information that was not accurate or not supported by the knowledge base.",
    type: "boolean",
    isActive: true,
  },
];

const typeIcons = {
  boolean: CheckCircle2,
  scale: Scale,
  text: FileText,
};

const typeLabels = {
  boolean: "Yes/No",
  scale: "1-10 Scale",
  text: "Text Analysis",
};

export function EvaluationCriteriaEditor({
  criteria,
  onChange,
  disabled = false,
}: EvaluationCriteriaEditorProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<EvaluationCriterion | null>(null);
  const [newCriterion, setNewCriterion] = useState<Omit<EvaluationCriterion, "id">>({
    name: "",
    description: "",
    prompt: "",
    type: "boolean",
    isActive: true,
  });

  const handleAddCriterion = () => {
    const criterion: EvaluationCriterion = {
      id: `criterion-${Date.now()}`,
      ...newCriterion,
    };
    onChange([...criteria, criterion]);
    setNewCriterion({
      name: "",
      description: "",
      prompt: "",
      type: "boolean",
      isActive: true,
    });
    setIsAddDialogOpen(false);
  };

  const handleUpdateCriterion = () => {
    if (!editingCriterion) return;
    onChange(
      criteria.map((c) => (c.id === editingCriterion.id ? editingCriterion : c))
    );
    setEditingCriterion(null);
  };

  const handleDeleteCriterion = (id: string) => {
    onChange(criteria.filter((c) => c.id !== id));
  };

  const handleToggleActive = (id: string) => {
    onChange(
      criteria.map((c) =>
        c.id === id ? { ...c, isActive: !c.isActive } : c
      )
    );
  };

  const handleAddDefault = (defaultCrit: Omit<EvaluationCriterion, "id">) => {
    const criterion: EvaluationCriterion = {
      id: `criterion-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...defaultCrit,
    };
    onChange([...criteria, criterion]);
  };

  const activeCriteriaCount = criteria.filter((c) => c.isActive).length;

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-gray-600" />
              Evaluation Criteria
            </CardTitle>
            <CardDescription className="text-gray-500">
              Define criteria to evaluate whether conversations were successful
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            {activeCriteriaCount} criteria
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Criteria List */}
        {criteria.length > 0 ? (
          <div className="space-y-2">
            {criteria.map((criterion) => {
              const TypeIcon = typeIcons[criterion.type];
              return (
                <div
                  key={criterion.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all",
                    criterion.isActive
                      ? "bg-white border-gray-200"
                      : "bg-gray-50 border-gray-100 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-gray-300 cursor-move" />
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        criterion.isActive ? "bg-gray-200" : "bg-gray-100"
                      )}
                    >
                      <TypeIcon
                        className={cn(
                          "h-4 w-4",
                          criterion.isActive ? "text-gray-900" : "text-gray-400"
                        )}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {criterion.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {criterion.description || typeLabels[criterion.type]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        criterion.type === "boolean" && "border-green-300 text-green-700",
                        criterion.type === "scale" && "border-purple-300 text-purple-700",
                        criterion.type === "text" && "border-orange-300 text-orange-700"
                      )}
                    >
                      {typeLabels[criterion.type]}
                    </Badge>
                    <Switch
                      checked={criterion.isActive}
                      onCheckedChange={() => handleToggleActive(criterion.id)}
                      disabled={disabled}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingCriterion(criterion)}
                      disabled={disabled}
                      className="h-8 w-8 text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCriterion(criterion.id)}
                      disabled={disabled}
                      className="h-8 w-8 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <CheckCircle2 className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm mb-4">No evaluation criteria defined</p>
            <p className="text-xs text-gray-400 mb-4">
              Add criteria to automatically evaluate conversation success
            </p>
          </div>
        )}

        {/* Quick Add Default Criteria */}
        {criteria.length < 4 && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Quick Add:</p>
            <div className="flex flex-wrap gap-2">
              {defaultCriteria
                .filter(
                  (dc) => !criteria.some((c) => c.name === dc.name)
                )
                .slice(0, 3)
                .map((dc) => (
                  <Button
                    key={dc.name}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddDefault(dc)}
                    disabled={disabled}
                    className="text-xs border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {dc.name}
                  </Button>
                ))}
            </div>
          </div>
        )}

        {/* Add New Criterion Button */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900"
              disabled={disabled}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Criterion
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Add Evaluation Criterion</DialogTitle>
              <DialogDescription className="text-gray-500">
                Define a criterion to evaluate conversation success
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-gray-700">Name</Label>
                <Input
                  value={newCriterion.name}
                  onChange={(e) =>
                    setNewCriterion({ ...newCriterion, name: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g., CUSTOMER SATISFACTION"
                  className="bg-white border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Description</Label>
                <Input
                  value={newCriterion.description}
                  onChange={(e) =>
                    setNewCriterion({ ...newCriterion, description: e.target.value })
                  }
                  placeholder="Brief description of what this evaluates"
                  className="bg-white border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Evaluation Type</Label>
                <Select
                  value={newCriterion.type}
                  onValueChange={(v) =>
                    setNewCriterion({ ...newCriterion, type: v as "boolean" | "scale" | "text" })
                  }
                >
                  <SelectTrigger className="bg-white border-gray-200 h-9">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="boolean">Yes/No (Boolean)</SelectItem>
                    <SelectItem value="scale">1-10 Scale</SelectItem>
                    <SelectItem value="text">Text Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Evaluation Prompt</Label>
                <Textarea
                  value={newCriterion.prompt}
                  onChange={(e) =>
                    setNewCriterion({ ...newCriterion, prompt: e.target.value })
                  }
                  placeholder="Instructions for the AI to evaluate this criterion..."
                  className="bg-white border-gray-300 min-h-[100px]"
                />
                <p className="text-xs text-gray-500">
                  This prompt tells the AI how to evaluate the conversation for this criterion
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddCriterion}
                disabled={!newCriterion.name || !newCriterion.prompt}
                className="bg-gray-900 hover:bg-gray-800"
              >
                Add Criterion
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Criterion Dialog */}
        <Dialog open={!!editingCriterion} onOpenChange={(open) => !open && setEditingCriterion(null)}>
          <DialogContent className="bg-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Edit Evaluation Criterion</DialogTitle>
            </DialogHeader>
            {editingCriterion && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">Name</Label>
                  <Input
                    value={editingCriterion.name}
                    onChange={(e) =>
                      setEditingCriterion({ ...editingCriterion, name: e.target.value.toUpperCase() })
                    }
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Description</Label>
                  <Input
                    value={editingCriterion.description}
                    onChange={(e) =>
                      setEditingCriterion({ ...editingCriterion, description: e.target.value })
                    }
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Evaluation Type</Label>
                  <Select
                    value={editingCriterion.type}
                    onValueChange={(v) =>
                      setEditingCriterion({ ...editingCriterion, type: v as "boolean" | "scale" | "text" })
                    }
                  >
                    <SelectTrigger className="bg-white border-gray-200 h-9">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="boolean">Yes/No (Boolean)</SelectItem>
                      <SelectItem value="scale">1-10 Scale</SelectItem>
                      <SelectItem value="text">Text Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Evaluation Prompt</Label>
                  <Textarea
                    value={editingCriterion.prompt}
                    onChange={(e) =>
                      setEditingCriterion({ ...editingCriterion, prompt: e.target.value })
                    }
                    className="bg-white border-gray-300 min-h-[100px]"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCriterion(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCriterion} className="bg-gray-900 hover:bg-gray-800">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
