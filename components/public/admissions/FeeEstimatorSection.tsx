import FeeCalculator from "@/components/public/FeeCalculator";
import { IFeeStructureData } from "@/lib/db/admissions-page-defaults";

interface FeeEstimatorSectionProps {
  feeStructure?: IFeeStructureData;
}

export function FeeEstimatorSection({ feeStructure }: FeeEstimatorSectionProps) {
  if (feeStructure && feeStructure.isVisible === false) {
    return null;
  }

  return (
    <div id="fee-calculator" className="scroll-mt-24">
      <FeeCalculator feeStructure={feeStructure} />
    </div>
  );
}

export default FeeEstimatorSection;
