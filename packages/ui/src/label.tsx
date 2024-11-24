import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "./lib/utils"; // Ensure this utility is correctly implemented

interface CustomLabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  htmlFor?: string;
  children: React.ReactNode;  // Ensure children are passed correctly
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  CustomLabelProps
>(({ className, children, htmlFor, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    htmlFor={htmlFor}  // Pass htmlFor to the underlying element
    {...props}
  >
    {children}  
  </LabelPrimitive.Root>
));

Label.displayName = "Label";

export { Label };
