"use client";

import { useMemo, useState, useEffect } from "react";


type MedRow = { medicationName: string; dosage: string };

type Props = {
  meds: MedRow[];
  inputNames?: { med: string; dose: string };
  initialMedication?: string;
  initialDosage?: string;
};

export default function MedPicker({
  meds,
  inputNames = { med: "medication", dose: "dosage" },
  initialMedication = "",
  initialDosage = "",
}: Props) {
  const medMap = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const row of meds) {
      const list = m.get(row.medicationName) ?? [];
      if (!list.includes(row.dosage)) list.push(row.dosage);
      m.set(row.medicationName, list);
    }
    for (const [k, v] of m) m.set(k, v.slice().sort());
    return m;
  }, [meds]);

  const medNames = useMemo(() => Array.from(medMap.keys()).sort(), [medMap]);

  const [medication, setMedication] = useState<string>(
    initialMedication && medMap.has(initialMedication) ? initialMedication : medNames[0] ?? ""
  );
  const [dosage, setDosage] = useState<string>("");

  const dosesForMed = useMemo(
    () => (medication ? medMap.get(medication) ?? [] : []),
    [medication, medMap]
  );

  useEffect(() => {
    if (initialDosage && dosesForMed.includes(initialDosage)) {
      setDosage(initialDosage);
    } else {
      setDosage(dosesForMed[0] ?? "");
    }
  }, [medication, dosesForMed, initialDosage]);

  return (
    <div className="space-y-2">
      {/* Hidden fields sent to server action */}
      <input type="hidden" name={inputNames.med} value={medication} />
      <input type="hidden" name={inputNames.dose} value={dosage} />

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm font-medium mb-1">Medication</label>
          <select
            className="border p-2 rounded w-full"
            value={medication}
            onChange={(e) => setMedication(e.target.value)}
          >
            {medNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[160px]">
          <label className="block text-sm font-medium mb-1">Dosage</label>
          <select
            className="border p-2 rounded w-full"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            disabled={!dosesForMed.length}
          >
            {dosesForMed.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
