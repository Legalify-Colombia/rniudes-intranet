
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Campus {
  id: string;
  name: string;
}

interface CampusSelectorProps {
  campuses: Campus[];
  selectedCampusIds: string[];
  onSelectionChange: (campusIds: string[]) => void;
  mode?: 'single' | 'multiple';
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export function CampusSelector({
  campuses,
  selectedCampusIds,
  onSelectionChange,
  mode = 'single',
  label = "Campus",
  placeholder = "Seleccionar campus",
  required = false
}: CampusSelectorProps) {
  
  // Ensure campuses is always an array
  const safeCampuses = Array.isArray(campuses) ? campuses : [];
  console.log("CampusSelector: Rendering with campuses:", safeCampuses);
  console.log("CampusSelector: selectedCampusIds:", selectedCampusIds);
  
  if (mode === 'single') {
    return (
      <div className="space-y-2">
        <Label>{label} {required && <span className="text-red-500">*</span>}</Label>
        <Select 
          value={selectedCampusIds[0] || ""} 
          onValueChange={(value) => {
            console.log("CampusSelector: Single select onValueChange called with:", value);
            onSelectionChange(value ? [value] : []);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {safeCampuses
              .filter(campus => {
                const isValid = campus &&
                  campus.id && 
                  typeof campus.id === 'string' && 
                  campus.id.trim().length > 0 &&
                  campus.name &&
                  typeof campus.name === 'string';
                
                if (!isValid) {
                  console.warn("CampusSelector: Invalid campus found:", campus);
                }
                return isValid;
              })
              .map((campus) => {
                console.log("CampusSelector: Rendering SelectItem for campus:", campus);
                return (
                  <SelectItem key={campus.id} value={campus.id}>
                    {campus.name}
                  </SelectItem>
                );
              })
            }
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>{label} {required && <span className="text-red-500">*</span>}</Label>
      <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all-campus"
            checked={selectedCampusIds.length === safeCampuses.length}
            onCheckedChange={(checked) => {
              console.log("CampusSelector: Select all checkbox changed:", checked);
              if (checked) {
                onSelectionChange(safeCampuses.map(c => c.id));
              } else {
                onSelectionChange([]);
              }
            }}
          />
          <Label htmlFor="select-all-campus" className="text-sm font-medium">
            Seleccionar todos
          </Label>
        </div>
        {safeCampuses.map((campus) => (
          <div key={campus.id} className="flex items-center space-x-2">
            <Checkbox
              id={`campus-${campus.id}`}
              checked={selectedCampusIds.includes(campus.id)}
              onCheckedChange={(checked) => {
                console.log("CampusSelector: Campus checkbox changed:", campus.id, checked);
                if (checked) {
                  onSelectionChange([...selectedCampusIds, campus.id]);
                } else {
                  onSelectionChange(selectedCampusIds.filter(id => id !== campus.id));
                }
              }}
            />
            <Label htmlFor={`campus-${campus.id}`} className="text-sm">
              {campus.name}
            </Label>
          </div>
        ))}
      </div>
      {selectedCampusIds.length === 0 && required && (
        <p className="text-sm text-red-500">Seleccione al menos un campus</p>
      )}
    </div>
  );
}
