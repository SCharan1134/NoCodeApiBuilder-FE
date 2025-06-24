import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export const ApiStartForm = () => {
  const { control } = useFormContext();

  return (
    <>
      <FormField
        control={control}
        name="method"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>Method</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl className="w-full">
                <SelectTrigger>
                  <SelectValue placeholder="Select a type of Method" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="path"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Path</FormLabel>
            <FormControl>
              <Input {...field} placeholder="e.g., /create-user" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
