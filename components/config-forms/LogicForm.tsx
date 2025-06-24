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

interface FormValues {
  code: string;
}

export const LogicForm = () => {
  const { control } = useFormContext<FormValues>();

  return (
    <>
      <FormField
        control={control}
        name="code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Code</FormLabel>
            <FormControl>
              <NodeIdSuggestField
                value={field.value}
                onChange={field.onChange}
                placeholder="write the code in javascript or typescript"
                as="textarea"
                rows={5}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <InfoCircledIcon className="h-4 w-4" />
        <span>
          Type <code className="px-1 py-0.5 bg-muted rounded">{"{{"}</code> to
          insert dynamic node values
        </span>
      </div>
    </>
  );
};
