import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { NodeIdSuggestField } from "../ui/node-id-suggest-field";
import { InfoCircledIcon } from "@radix-ui/react-icons";

export const LoopForm = () => {
  const { control } = useFormContext();

  return (
    <>
      <FormField
        control={control}
        name="items"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Items</FormLabel>
            <FormControl>
              <NodeIdSuggestField
                value={field.value}
                onChange={field.onChange}
                placeholder="write the items you need to loop in here"
                as="textarea"
                rows={3}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
        <InfoCircledIcon className="h-4 w-4" />
        <span>
          Type <code className="px-1 py-0.5 bg-muted rounded">{"{{"}</code> to
          insert dynamic node values
        </span>
      </div>
    </>
  );
};
