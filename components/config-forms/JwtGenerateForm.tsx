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
import { Textarea } from "../ui/textarea";

export const JwtGenerateForm = () => {
  const { control } = useFormContext();

  return (
    <>
      <FormField
        control={control}
        name="payload"
        render={({ field }) => (
          <FormItem>
            <FormLabel>payload</FormLabel>
            <FormControl>
              <Textarea
                placeholder="write what playload to be set in the jwt"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
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
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="expiresIn"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Expires In</FormLabel>
            <FormControl>
              <Input {...field} placeholder="e.g., 1h, 30m" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
