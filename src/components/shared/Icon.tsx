import React from "react";

interface IconProps {
  name: string;
  className?: string;
  fill?: boolean;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({
  name,
  className = "",
  fill = false,
  size,
}) => {
  return (
    <span
      className={`material-symbols-rounded select-none leading-none align-middle ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        fontSize: size ? `${size}px` : undefined,
      }}
    >
      {name}
    </span>
  );
};

export default Icon;
