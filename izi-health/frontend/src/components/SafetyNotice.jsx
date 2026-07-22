import { AlertTriangle } from "lucide-react";

export default function SafetyNotice() {
  return (
    <div className="safetyNotice" role="note">
      <AlertTriangle size={18} />
      <span>
        IZI Health supports care navigation and education only. It does not
        diagnose, prescribe medication, or replace a qualified healthcare
        professional.
      </span>
    </div>
  );
}
