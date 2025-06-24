import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Source } from "@/types/node-types";

// interface Source {
//   from?: "query" | "body" | "headers" | "params";
//   required?: string[];
//   validation?: {
//     email?: {
//       regex?: string;
//     };
//   };
// }

export function ParameterForm() {
  const { control, watch } = useFormContext();
  const sources = watch("sources") || [];

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="sources"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Parameter Sources</FormLabel>
            <div className="space-y-4">
              {sources.map((_: Source, index: number) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Source {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newSources = [...sources];
                        newSources.splice(index, 1);
                        field.onChange(newSources);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <FormField
                    control={control}
                    name={`sources.${index}.from`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select source type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="query">Query</SelectItem>
                            <SelectItem value="body">Body</SelectItem>
                            <SelectItem value="headers">Headers</SelectItem>
                            <SelectItem value="params">Params</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`sources.${index}.required`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Required Fields</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            {field.value?.map(
                              (value: string, fieldIndex: number) => (
                                <div key={fieldIndex} className="flex gap-2">
                                  <Input
                                    value={value}
                                    onChange={(e) => {
                                      const newValues = [
                                        ...(field.value || []),
                                      ];
                                      newValues[fieldIndex] = e.target.value;
                                      field.onChange(newValues);
                                    }}
                                    placeholder="Field name"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const newValues = [
                                        ...(field.value || []),
                                      ];
                                      newValues.splice(fieldIndex, 1);
                                      field.onChange(newValues);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                field.onChange([...(field.value || []), ""]);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Field
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Add required field names
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  {/* <FormField
                    control={control}
                    name={`sources.${index}.validation.email.regex`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Validation Regex</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter regex pattern" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  /> */}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => {
                field.onChange([...sources, { from: "query" }]);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
          </FormItem>
        )}
      />
    </div>
  );
}
