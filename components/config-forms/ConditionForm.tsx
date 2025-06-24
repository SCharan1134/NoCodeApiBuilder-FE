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

export const ConditionForm = () => {
  const { control } = useFormContext();

  return (
    <>
      <FormField
        control={control}
        name="condition"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Condition</FormLabel>
            <FormControl>
              <NodeIdSuggestField
                value={field.value}
                onChange={field.onChange}
                placeholder="Write your condition as a JavaScript expression"
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
