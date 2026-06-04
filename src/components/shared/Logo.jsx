import { cn } from "@/lib/utils";
import logoHorizontalDark from "@/assets/icon_workmark_dark.svg";
import logoHorizontalLight from "@/assets/icon_workmark_light.svg";
import logoStackedDark from "@/assets/icon_stack_dark.svg";
import logoStackedLight from "@/assets/icon_stack_light.svg";
import logoIcon from "@/assets/logo_icon.svg";

const SIZE_MAP = {
  horizontal: { sm: 20, md: 28, lg: 36, xl: 48 },
  stacked:    { sm: 48, md: 64, lg: 80, xl: 100 },
  icon:       { sm: 20, md: 28, lg: 36, xl: 48 },
};

const Logo = ({
  variant   = "horizontal",
  theme     = "dark",
  size      = "md",
  className,
}) => {
  let src;

  if (variant === "icon") {
    src = logoIcon;
  } else if (variant === "stacked") {
    src = theme === "dark" ? logoStackedDark : logoStackedLight;
  } else {
    src = theme === "dark" ? logoHorizontalDark : logoHorizontalLight;
  }

  const height = SIZE_MAP[variant]?.[size] ?? SIZE_MAP.horizontal.md;

  return (
    <img
      src={src}
      alt="Kraviq"
      height={height}
      style={{ height: `${height}px`, width: "auto" }}
      className={cn("flex-shrink-0", className)}
      draggable={false}
    />
  );
};

export default Logo;
