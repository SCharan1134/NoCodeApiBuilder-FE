import { useAppSelector } from "@/lib/redux/hooks";
import { useState, useRef } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./command";
import { cn } from "@/lib/utils";

interface NodeIdSuggestFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  as?: "input" | "textarea";
  rows?: number;
}

export const NodeIdSuggestField = ({
  value,
  onChange,
  placeholder = "Type {{ to see node suggestions",
  className,
  as = "input",
  rows = 3,
}: NodeIdSuggestFieldProps) => {
  const nodes = useAppSelector((state) => state.nodes.nodes);

  // Ensure value is always a string
  const currentValue = value || "";

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<
    { id: string; label: string }[]
  >([]);
  const [searchText, setSearchText] = useState("");
  const [bracketInfo, setBracketInfo] = useState<{
    position: number;
    searchStart: number;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getCurrentRef = () => {
    return as === "textarea" ? textareaRef.current : inputRef.current;
  };

  // Debug: Log nodes on mount
  // useEffect(() => {
  //   console.log("[DEBUG] Nodes from Redux:", nodes);
  //   console.log("[DEBUG] Nodes count:", nodes?.length || 0);
  // }, [nodes]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newText = e.target.value;
    const cursorPos = e.target.selectionStart ?? 0;

    // console.log("[DEBUG] ========== CHANGE EVENT ==========");
    // console.log("[DEBUG] New text:", JSON.stringify(newText));
    // console.log("[DEBUG] Cursor position:", cursorPos);
    // console.log("[DEBUG] Nodes available:", nodes?.length || 0);

    // Always update parent first
    onChange(newText);

    // Check for {{ pattern
    const textBeforeCursor = newText.slice(0, cursorPos);
    const lastDoubleBracket = textBeforeCursor.lastIndexOf("{{");

    // console.log(
    //   "[DEBUG] Text before cursor:",
    //   JSON.stringify(textBeforeCursor)
    // );
    // console.log("[DEBUG] Last {{ position:", lastDoubleBracket);

    if (lastDoubleBracket !== -1) {
      // Check if we're still within the {{ }} context
      const textAfterBrackets = textBeforeCursor.slice(lastDoubleBracket + 2);
      const hasClosingBrackets = textAfterBrackets.includes("}}");

      // console.log("[DEBUG] Text after {{:", JSON.stringify(textAfterBrackets));
      // console.log("[DEBUG] Has closing }}:", hasClosingBrackets);

      if (!hasClosingBrackets) {
        // We're in suggestion mode
        const search = textAfterBrackets;
        setSearchText(search);
        setBracketInfo({
          position: lastDoubleBracket,
          searchStart: lastDoubleBracket + 2,
        });

        // Filter nodes
        const filteredNodes = (nodes || [])
          .filter(
            (node) =>
              search === "" ||
              node.id.toLowerCase().includes(search.toLowerCase())
          )
          .map((node) => ({
            id: node.id,
            label: `${node.id} (${node.data?.label || node.type || "Unknown"})`,
          }));

        // console.log("[DEBUG] Search term:", JSON.stringify(search));
        // console.log("[DEBUG] Filtered nodes:", filteredNodes);

        setSuggestions(filteredNodes);
        setShowSuggestions(true);

        // console.log("[DEBUG] Setting showSuggestions to TRUE");
        return;
      }
    }

    // Hide suggestions
    // console.log("[DEBUG] Hiding suggestions");
    setShowSuggestions(false);
    setBracketInfo(null);
    setSuggestions([]);
  };

  const handleNodeSelect = (nodeId: string) => {
    // console.log("[DEBUG] Node selected:", nodeId);

    if (!bracketInfo) {
      console.log("[DEBUG] No bracket info available");
      return;
    }

    const ref = getCurrentRef();
    if (!ref) {
      console.log("[DEBUG] No ref available");
      return;
    }

    // Build new text
    const beforeBrackets = currentValue.slice(0, bracketInfo.position);
    const afterCursor = currentValue.slice(ref.selectionStart || 0);
    const newText = beforeBrackets + "{{" + nodeId + ".result.}}" + afterCursor;
    const newCursorPos =
      beforeBrackets.length + "{{".length + nodeId.length + ".result.".length;

    // console.log("[DEBUG] New text after selection:", JSON.stringify(newText));
    // console.log("[DEBUG] New cursor position:", newCursorPos);

    // Update
    onChange(newText);
    setShowSuggestions(false);
    setBracketInfo(null);

    // Set cursor position
    setTimeout(() => {
      if (ref) {
        ref.focus();
        ref.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && showSuggestions) {
      setShowSuggestions(false);
      setBracketInfo(null);
    }
  };

  // Debug render
  // console.log("[DEBUG] ========== RENDER ==========");
  // console.log("[DEBUG] showSuggestions:", showSuggestions);
  // console.log("[DEBUG] suggestions count:", suggestions.length);
  // console.log("[DEBUG] currentValue:", JSON.stringify(currentValue));

  return (
    <div className="relative">
      {as === "textarea" ? (
        <textarea
          ref={textareaRef}
          value={currentValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] resize-none",
            className
          )}
          rows={rows}
        />
      ) : (
        <input
          ref={inputRef}
          value={currentValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        />
      )}

      {/* Debug info - remove this in production */}
      {/* <div className="absolute top-0 right-0 bg-red-100 text-xs p-1 text-red-800 border">
        Debug: show={showSuggestions.toString()}, nodes={nodes?.length || 0},
        suggestions={suggestions.length}
      </div> */}

      {showSuggestions && (
        <div className="absolute z-50 w-80 mt-1 bg-white border rounded-lg shadow-lg">
          <Command className="rounded-lg border-0">
            <CommandInput
              placeholder="Search nodes..."
              value={searchText}
              onValueChange={setSearchText}
            />
            <CommandEmpty>No nodes found.</CommandEmpty>
            <CommandGroup>
              {suggestions.map((node) => (
                <CommandItem
                  key={node.id}
                  onSelect={() => handleNodeSelect(node.id)}
                  className="cursor-pointer"
                >
                  {node.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </div>
      )}
    </div>
  );
};
