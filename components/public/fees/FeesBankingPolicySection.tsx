import { Badge } from "@/components/ui/badge";
import BankDetailCard from "./BankDetailCard";

export function FeesBankingPolicySection() {
  const policies = [
    {
      title: "Fee Voucher Schedule",
      items: [
        "Monthly fee vouchers are generated on the 1st of each calendar month.",
        "The standard due date for fee payment is the 10th of each month.",
        "Late fee surcharges of PKR 300 apply after the 15th of the month.",
        "Fee payments can be made in 12 monthly installments or in a lump-sum annual plan with a 5% concession.",
      ],
    },
    {
      title: "Authorized Bank Branches",
      items: [
        "Meezan Bank: Soldier Bazar Branch, Karachi (Account: Seneca Academy)",
        "Habib Bank Limited (HBL): Garden East Branch, Karachi",
        "Online 1Link / Kuickpay: Pay directly via 1Bill consumer number on mobile banking apps.",
        "School Accounts Desk: Open Monday to Friday, 8:30 AM – 2:00 PM for debit card payments.",
      ],
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-muted/30 border-t border-border overflow-hidden">
      <div className="container max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="outline">Billing Policy</Badge>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
            Payment Terms & Banking Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {policies.map((p, idx) => (
            <BankDetailCard key={idx} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeesBankingPolicySection;
