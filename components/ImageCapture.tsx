import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string; // Add this line
  size?: string;    // Add this if you want to support 'size' prop
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, className, ...props }, ref) => (
    <button
      ref={ref}
      className={`${className} ${variant ? `btn-${variant}` : ""} ${size ? `btn-${size}` : ""}`}
      {...props}
    />
  )
);

// Usage example
/*
<Button
  onClick={handleClearAll}
  disabled={loading || photos.length === 0}
  className="clear-all-btn"
>
  <Trash2 className="h-4 w-4 mr-2" />
  Eliminar Todas
</Button>
*/
