import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { COLOR_PALETTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function ColorPalette() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Color Palette</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COLOR_PALETTES.map((palette) => (
            <Button
              key={palette.name}
              variant="outline"
              className={cn(
                "h-auto p-4 flex flex-col items-start space-y-2",
                theme.primary === palette.primary && "border-primary"
              )}
              onClick={() =>
                setTheme({
                  ...theme,
                  primary: palette.primary,
                })
              }
            >
              <div className="flex justify-between w-full">
                <span className="font-medium">{palette.name}</span>
                {theme.primary === palette.primary && (
                  <Check className="h-4 w-4" />
                )}
              </div>
              <div className="flex gap-2 w-full">
                {palette.colors.map((color, i) => (
                  <div
                    key={i}
                    className="h-8 w-full rounded"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Border Radius</h3>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={theme.radius}
          onChange={(e) =>
            setTheme({
              ...theme,
              radius: parseFloat(e.target.value),
            })
          }
          className="w-full"
        />
      </div>
    </div>
  );
}
