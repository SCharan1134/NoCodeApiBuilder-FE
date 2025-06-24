import { useFormContext } from "react-hook-form";
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

export const JwtVerifyForm = () => {
  const { control } = useFormContext();

  return (
    <>
      <FormField
        control={control}
        name="secretType"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>Secret</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl className="w-full">
                <SelectTrigger>
                  <SelectValue placeholder="Select a type of secret" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="jwt">JWT</SelectItem>
                <SelectItem value="cookie">Cookie</SelectItem>
                {/* <SelectItem value="m@support.com">m@support.com</SelectItem> */}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
