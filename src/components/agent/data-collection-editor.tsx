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
  Database,
  GripVertical,
  Hash,
  ToggleLeft,
  Type,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface DataCollectionPoint {
  id: string;
  name: string;
  description: string;
  prompt: string;
  dataType: "string" | "boolean" | "number" | "array";
  isRequired: boolean;
  isActive: boolean;
}

interface DataCollectionEditorProps {
  dataPoints: DataCollectionPoint[];
  onChange: (dataPoints: DataCollectionPoint[]) => void;
  disabled?: boolean;
}

const defaultDataPoints: Omit<DataCollectionPoint, "id">[] = [
  {
    name: "EMOTIONAL_STATES",
    description: "Extract the emotional states expressed during the conversation",
    prompt: "Identify and list the emotional states (e.g., anxious, frustrated, relieved, happy) expressed by the user during the conversation.",
    dataType: "array",
    isRequired: false,
    isActive: true,
  },
  {
    name: "SYMPTOMS_MENTIONED",
    description: "Extract any symptoms mentioned by the user",
    prompt: "List all symptoms or health concerns mentioned by the user during the conversation.",
    dataType: "array",
    isRequired: false,
    isActive: true,
  },
  {
    name: "USER_INTENT",
    description: "Identify the primary intent of the user",
    prompt: "Determine and summarize the user's primary intent or goal for this conversation.",
    dataType: "string",
    isRequired: false,
    isActive: true,
  },
  {
    name: "FOLLOW_UP_NEEDED",
    description: "Determine if a follow-up is required",
    prompt: "Determine whether this conversation requires a follow-up or referral to a human specialist.",
    dataType: "boolean",
    isRequired: false,
    isActive: true,
  },
];

const typeIcons = {
  string: Type,
  boolean: ToggleLeft,
  number: Hash,
  array: List,
};

const typeLabels = {
  string: "Text",
  boolean: "Yes/No",
  number: "Number",
  array: "List",
};

const typeColors = {
  string: "border-gray-300 text-gray-700 bg-gray-50",
  boolean: "border-green-300 text-green-700 bg-green-50",
  number: "border-purple-300 text-purple-700 bg-purple-50",
  array: "border-orange-300 text-orange-700 bg-orange-50",
};

export function DataCollectionEditor({
  dataPoints,
  onChange,
  disabled = false,
}: DataCollectionEditorProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDataPoint, setEditingDataPoint] = useState<DataCollectionPoint | null>(null);
  const [newDataPoint, setNewDataPoint] = useState<Omit<DataCollectionPoint, "id">>({
    name: "",
    description: "",
    prompt: "",
    dataType: "string",
    isRequired: false,
    isActive: true,
  });

  const handleAddDataPoint = () => {
    const dataPoint: DataCollectionPoint = {
      id: `datapoint-${Date.now()}`,
      ...newDataPoint,
    };
    onChange([...dataPoints, dataPoint]);
    setNewDataPoint({
      name: "",
      description: "",
      prompt: "",
      dataType: "string",
      isRequired: false,
      isActive: true,
    });
    setIsAddDialogOpen(false);
  };

  const handleUpdateDataPoint = () => {
    if (!editingDataPoint) return;
    onChange(
      dataPoints.map((dp) => (dp.id === editingDataPoint.id ? editingDataPoint : dp))
    );
    setEditingDataPoint(null);
  };

  const handleDeleteDataPoint = (id: string) => {
    onChange(dataPoints.filter((dp) => dp.id !== id));
  };

  const handleToggleActive = (id: string) => {
    onChange(
      dataPoints.map((dp) =>
        dp.id === id ? { ...dp, isActive: !dp.isActive } : dp
      )
    );
  };

  const handleAddDefault = (defaultDp: Omit<DataCollectionPoint, "id">) => {
    const dataPoint: DataCollectionPoint = {
      id: `datapoint-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...defaultDp,
    };
    onChange([...dataPoints, dataPoint]);
  };

  const activeDataPointsCount = dataPoints.filter((dp) => dp.isActive).length;

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Database className="h-5 w-5 text-gray-600" />
              Data Collection
            </CardTitle>
            <CardDescription className="text-gray-500">
              Define data points to extract from conversation transcripts
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            {activeDataPointsCount} data point{activeDataPointsCount !== 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Data Points List */}
        {dataPoints.length > 0 ? (
          <div className="space-y-2">
            {dataPoints.map((dataPoint) => {
              const TypeIcon = typeIcons[dataPoint.dataType];
              return (
                <div
                  key={dataPoint.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all",
                    dataPoint.isActive
                      ? "bg-white border-gray-200"
                      : "bg-gray-50 border-gray-100 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-gray-300 cursor-move" />
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        dataPoint.isActive ? "bg-gray-100" : "bg-gray-100"
                      )}
                    >
                      <TypeIcon
                        className={cn(
                          "h-4 w-4",
                          dataPoint.isActive ? "text-gray-600" : "text-gray-400"
                        )}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 text-sm font-mono">
                          {dataPoint.name}
                        </p>
                        {dataPoint.isRequired && (
                          <Badge variant="outline" className="text-[10px] border-red-300 text-red-600">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {dataPoint.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn("text-xs", typeColors[dataPoint.dataType])}
                    >
                      {typeLabels[dataPoint.dataType]}
                    </Badge>
                    <Switch
                      checked={dataPoint.isActive}
                      onCheckedChange={() => handleToggleActive(dataPoint.id)}
                      disabled={disabled}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingDataPoint(dataPoint)}
                      disabled={disabled}
                      className="h-8 w-8 text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDataPoint(dataPoint.id)}
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
            <Database className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm mb-4">No data collection points defined</p>
            <p className="text-xs text-gray-400 mb-4">
              Add data points to automatically extract information from conversations
            </p>
          </div>
        )}

        {/* Quick Add Default Data Points */}
        {dataPoints.length < 4 && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Quick Add:</p>
            <div className="flex flex-wrap gap-2">
              {defaultDataPoints
                .filter(
                  (ddp) => !dataPoints.some((dp) => dp.name === ddp.name)
                )
                .slice(0, 3)
                .map((ddp) => (
                  <Button
                    key={ddp.name}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddDefault(ddp)}
                    disabled={disabled}
                    className="text-xs border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {ddp.name.replace(/_/g, " ")}
                  </Button>
                ))}
            </div>
          </div>
        )}

        {/* Add New Data Point Button */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900"
              disabled={disabled}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Data Point
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Add Data Collection Point</DialogTitle>
              <DialogDescription className="text-gray-500">
                Define a data point to extract from conversations
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-gray-700">Field Name</Label>
                <Input
                  value={newDataPoint.name}
                  onChange={(e) =>
                    setNewDataPoint({
                      ...newDataPoint,
                      name: e.target.value.toUpperCase().replace(/\s+/g, "_"),
                    })
                  }
                  placeholder="e.g., USER_EMAIL"
                  className="bg-white border-gray-300 font-mono"
                />
                <p className="text-xs text-gray-500">
                  Use UPPER_SNAKE_CASE for field names
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Description</Label>
                <Input
                  value={newDataPoint.description}
                  onChange={(e) =>
                    setNewDataPoint({ ...newDataPoint, description: e.target.value })
                  }
                  placeholder="What data should be extracted"
                  className="bg-white border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Data Type</Label>
                <Select
                  value={newDataPoint.dataType}
                  onValueChange={(v) =>
                    setNewDataPoint({
                      ...newDataPoint,
                      dataType: v as "string" | "boolean" | "number" | "array",
                    })
                  }
                >
                  <SelectTrigger className="bg-white border-gray-200 h-9">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="string">Text (String)</SelectItem>
                    <SelectItem value="boolean">Yes/No (Boolean)</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="array">List (Array)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Extraction Prompt</Label>
                <Textarea
                  value={newDataPoint.prompt}
                  onChange={(e) =>
                    setNewDataPoint({ ...newDataPoint, prompt: e.target.value })
                  }
                  placeholder="Instructions for extracting this data from the conversation..."
                  className="bg-white border-gray-300 min-h-[100px]"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div>
                  <Label className="text-gray-700">Required Field</Label>
                  <p className="text-xs text-gray-500">
                    Must be extracted from every conversation
                  </p>
                </div>
                <Switch
                  checked={newDataPoint.isRequired}
                  onCheckedChange={(v) =>
                    setNewDataPoint({ ...newDataPoint, isRequired: v })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddDataPoint}
                disabled={!newDataPoint.name || !newDataPoint.prompt}
                className="bg-gray-900 hover:bg-gray-800"
              >
                Add Data Point
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Data Point Dialog */}
        <Dialog
          open={!!editingDataPoint}
          onOpenChange={(open) => !open && setEditingDataPoint(null)}
        >
          <DialogContent className="bg-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Edit Data Collection Point</DialogTitle>
            </DialogHeader>
            {editingDataPoint && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">Field Name</Label>
                  <Input
                    value={editingDataPoint.name}
                    onChange={(e) =>
                      setEditingDataPoint({
                        ...editingDataPoint,
                        name: e.target.value.toUpperCase().replace(/\s+/g, "_"),
                      })
                    }
                    className="bg-white border-gray-300 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Description</Label>
                  <Input
                    value={editingDataPoint.description}
                    onChange={(e) =>
                      setEditingDataPoint({
                        ...editingDataPoint,
                        description: e.target.value,
                      })
                    }
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Data Type</Label>
                  <Select
                    value={editingDataPoint.dataType}
                    onValueChange={(v) =>
                      setEditingDataPoint({
                        ...editingDataPoint,
                        dataType: v as "string" | "boolean" | "number" | "array",
                      })
                    }
                  >
                    <SelectTrigger className="bg-white border-gray-200 h-9">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="string">Text (String)</SelectItem>
                      <SelectItem value="boolean">Yes/No (Boolean)</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="array">List (Array)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Extraction Prompt</Label>
                  <Textarea
                    value={editingDataPoint.prompt}
                    onChange={(e) =>
                      setEditingDataPoint({
                        ...editingDataPoint,
                        prompt: e.target.value,
                      })
                    }
                    className="bg-white border-gray-300 min-h-[100px]"
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div>
                    <Label className="text-gray-700">Required Field</Label>
                    <p className="text-xs text-gray-500">
                      Must be extracted from every conversation
                    </p>
                  </div>
                  <Switch
                    checked={editingDataPoint.isRequired}
                    onCheckedChange={(v) =>
                      setEditingDataPoint({ ...editingDataPoint, isRequired: v })
                    }
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingDataPoint(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateDataPoint}
                className="bg-gray-900 hover:bg-gray-800"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
