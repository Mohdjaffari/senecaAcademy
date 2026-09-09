export interface EligibilityRowProps {
  grade: string;
  age: string;
  seats: string;
  focus: string;
}

export function EligibilityRow({
  grade,
  age,
  seats,
  focus,
}: EligibilityRowProps) {
  return (
    <tr className="hover:bg-muted/40 transition-colors">
      <td className="p-4 sm:px-6 font-bold text-foreground flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-seneca-amber shrink-0" />
        {grade}
      </td>
      <td className="p-4 sm:px-6 font-semibold text-seneca-crimson dark:text-seneca-amber-light">
        {age}
      </td>
      <td className="p-4 sm:px-6 font-medium text-foreground">
        {seats}
      </td>
      <td className="p-4 sm:px-6 text-muted-foreground">
        {focus}
      </td>
    </tr>
  );
}

export default EligibilityRow;
