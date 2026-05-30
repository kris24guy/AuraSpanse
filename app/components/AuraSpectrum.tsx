// app/components/AuraSpectrum.tsx

import React from "react";

interface AuraSpectrumProps {
  birthSeed: number;
  dayOfYear: number;
}

const AuraSpectrum: React.FC<AuraSpectrumProps> = ({ birthSeed, dayOfYear }) => {
  return (
    <div>
      AuraSpectrum component
      <div>birthSeed: {birthSeed}</div>
      <div>dayOfYear: {dayOfYear}</div>
    </div>
  );
};

export default AuraSpectrum;
