import { useTheme } from "@/components/theme-provider";
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

const Logo = ({ variant = "horizontal", size = "md", className }) => {
  const { theme } = useTheme();

  // Guard window.matchMedia for SSR — it does not exist in Node.js.
  // suppressHydrationWarning on the img covers the case where the user's
  // stored theme (light) differs from the SSR default (dark).
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  let src;
  if (variant === "icon") {
    src = logoIcon;
  } else if (variant === "stacked") {
    src = isDark ? logoStackedDark : logoStackedLight;
  } else {
    src = isDark ? logoHorizontalDark : logoHorizontalLight;
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
      suppressHydrationWarning
    />
  );
};

export default Logo;
