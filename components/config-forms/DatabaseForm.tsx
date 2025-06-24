"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Plus, Trash2, Database, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import {
  fetchCollections,
  fetchCollectionParameters,
} from "@/lib/redux/slices/schemaSlice";
import { CreateCollectionDialog } from "@/components/project-dialogs/create-collection-dialog";
import { SchemaManagementDialog } from "@/components/project-dialogs/schema-management-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NodeIdSuggestField } from "../ui/node-id-suggest-field";
import { InfoCircledIcon } from "@radix-ui/react-icons";

export function DatabaseForm() {
  const { control, watch, setValue } = useFormContext();
  const dispatch = useDispatch<AppDispatch>();

  const formQuery = watch("query") || {};
  const formData = watch("data") || {};
  const selectedCollection = watch("collection");
  const selectedProvider = watch("provider") || "mongodb";

  // Redux state
  const { collections, collectionParameters, isLoading } = useSelector(
    (state: RootState) => state.schema
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedProject } = useSelector((state: RootState) => state.projects);

  // Local state
  const [queryFields, setQueryFields] = useState<
    { key: string; value: string }[]
  >([]);
  const [dataFields, setDataFields] = useState<
    { key: string; value: string }[]
  >([]);
  const [collectionOpen, setCollectionOpen] = useState(false);

  // Refs to track update sources
  const isUpdatingFromForm = useRef(false);
  const isUpdatingFromLocal = useRef(false);

  // Get current collection parameters
  const currentCollectionParams = selectedCollection
    ? collectionParameters[selectedCollection] || []
    : [];

  // Load collections on mount
  useEffect(() => {
    if (user && selectedProject) {
      dispatch(
        fetchCollections({
          tenant: user.name,
          projectId: selectedProject._id,
          provider: selectedProvider,
        })
      );
    }
  }, [dispatch, user, selectedProject, selectedProvider]);

  // Load collection parameters when collection changes
  useEffect(() => {
    if (selectedCollection && user && selectedProject) {
      dispatch(
        fetchCollectionParameters({
          tenant: user.name,
          projectId: selectedProject._id,
          collectionName: selectedCollection,
          provider: selectedProvider,
        })
      );
    }
  }, [selectedCollection, dispatch, user, selectedProject, selectedProvider]);

  // Sync local state with form state
  useEffect(() => {
    if (isUpdatingFromLocal.current) {
      isUpdatingFromLocal.current = false;
      return;
    }

    isUpdatingFromForm.current = true;
    const newQueryFields = Object.entries(formQuery).map(([key, value]) => ({
      key,
      value: String(value),
    }));
    setQueryFields(newQueryFields);
    isUpdatingFromForm.current = false;
  }, [formQuery]);

  useEffect(() => {
    if (isUpdatingFromLocal.current) {
      isUpdatingFromLocal.current = false;
      return;
    }

    isUpdatingFromForm.current = true;
    const newDataFields = Object.entries(formData).map(([key, value]) => ({
      key,
      value: String(value),
    }));
    setDataFields(newDataFields);
    isUpdatingFromForm.current = false;
  }, [formData]);

  // Update form state when local state changes
  useEffect(() => {
    if (isUpdatingFromForm.current) return;

    isUpdatingFromLocal.current = true;
    setValue(
      "query",
      Object.fromEntries(
        queryFields.filter((f) => f.key).map((f) => [f.key, f.value])
      )
    );
  }, [queryFields, setValue]);

  useEffect(() => {
    if (isUpdatingFromForm.current) return;

    isUpdatingFromLocal.current = true;
    setValue(
      "data",
      Object.fromEntries(
        dataFields.filter((f) => f.key).map((f) => [f.key, f.value])
      )
    );
  }, [dataFields, setValue]);

  const addField = (type: "query" | "data") => {
    if (type === "query") {
      setQueryFields([...queryFields, { key: "", value: "" }]);
    } else {
      setDataFields([...dataFields, { key: "", value: "" }]);
    }
  };

  const removeField = (type: "query" | "data", index: number) => {
    if (type === "query") {
      setQueryFields(queryFields.filter((_, i) => i !== index));
    } else {
      setDataFields(dataFields.filter((_, i) => i !== index));
    }
  };

  const updateField = (
    type: "query" | "data",
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    if (type === "query") {
      const newFields = [...queryFields];
      newFields[index] = { ...newFields[index], [field]: value };
      setQueryFields(newFields);
    } else {
      const newFields = [...dataFields];
      newFields[index] = { ...newFields[index], [field]: value };
      setDataFields(newFields);
    }
  };

  const handleCollectionCreated = (collectionName: string) => {
    setValue("collection", collectionName);
    // Refresh collections list
    if (user && selectedProject) {
      dispatch(
        fetchCollections({
          tenant: user.name,
          projectId: selectedProject._id,
          provider: selectedProvider,
        })
      );
    }
  };

  const handleSchemaUpdated = () => {
    // Refresh collections and parameters
    if (user && selectedProject) {
      dispatch(
        fetchCollections({
          tenant: user.name,
          projectId: selectedProject._id,
          provider: selectedProvider,
        })
      );
      if (selectedCollection) {
        dispatch(
          fetchCollectionParameters({
            tenant: user.name,
            projectId: selectedProject._id,
            collectionName: selectedCollection,
            provider: selectedProvider,
          })
        );
      }
    }
  };

  const renderFieldInput = (
    type: "query" | "data",
    index: number,
    field: { key: string; value: string }
  ) => {
    const isKeyField = true; // We're rendering the key input
    const availableFields = currentCollectionParams.map((param) => param.name);

    if (isKeyField) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="justify-between"
            >
              {field.key || "Select field..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search fields..." />
              <CommandList>
                <CommandEmpty>No fields found.</CommandEmpty>
                <CommandGroup>
                  {availableFields.map((fieldName) => {
                    const param = currentCollectionParams.find(
                      (p) => p.name === fieldName
                    );
                    return (
                      <CommandItem
                        key={fieldName}
                        value={fieldName}
                        onSelect={() => {
                          updateField(type, index, "key", fieldName);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.key === fieldName
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{fieldName}</span>
                          {param && (
                            <div className="flex gap-1 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {param.type}
                              </Badge>
                              {param.required && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Required
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      );
    }

    return (
      <Input
        placeholder="Field name"
        value={field.key}
        onChange={(e) => updateField(type, index, "key", e.target.value)}
      />
    );
  };

  const renderValueInput = (
    type: "query" | "data",
    index: number,
    field: { key: string; value: string }
  ) => {
    const param = currentCollectionParams.find((p) => p.name === field.key);

    if (param?.enum && param.enum.length > 0) {
      return (
        <Select
          value={field.value}
          onValueChange={(value) => updateField(type, index, "value", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {param.enum.map((enumValue) => (
              <SelectItem key={enumValue} value={enumValue}>
                {enumValue}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (param?.type === "Boolean") {
      return (
        <Select
          value={field.value}
          onValueChange={(value) => updateField(type, index, "value", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">true</SelectItem>
            <SelectItem value="false">false</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    return (
      <NodeIdSuggestField
        value={field.value}
        onChange={(value) => updateField(type, index, "value", value)}
        placeholder={param ? `${param.type} value` : "Value"}
        as="input"
      />
      // <Input
      //   placeholder={param ? `${param.type} value` : "Value"}
      //   value={field.value}
      //   onChange={(e) => updateField(type, index, "value", e.target.value)}
      //   // type={param?.type === "Number" ? "number" : "text"}
      // />
    );
  };

  if (!user || !selectedProject) {
    return <div>Please select a project first</div>;
  }

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="provider"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Database Provider</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="mongodb">MongoDB</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="collection"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center justify-between">
              Collection Name\
              <div className="flex gap-2">
                <CreateCollectionDialog
                  tenant={user.name}
                  projectId={selectedProject._id}
                  onCollectionCreated={handleCollectionCreated}
                >
                  <Button type="button" variant="outline" size="sm">
                    <Database className="h-4 w-4 mr-2" />
                    Create Collection
                  </Button>
                </CreateCollectionDialog>
              </div>
            </FormLabel>
            <div className="space-y-2">
              <Popover open={collectionOpen} onOpenChange={setCollectionOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? collections.find(
                            (collection) => collection === field.value
                          )
                        : "Select collection"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Search collections..." />
                    <CommandList>
                      <CommandEmpty>
                        {isLoading ? "Loading..." : "No collections found."}
                      </CommandEmpty>
                      <CommandGroup>
                        {collections.map((collection) => (
                          <CommandItem
                            value={collection}
                            key={collection}
                            onSelect={() => {
                              setValue("collection", collection);
                              setCollectionOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                collection === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {collection}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {/* Schema Management Button */}
              <SchemaManagementDialog
                tenant={user.name}
                projectId={selectedProject._id}
                onSchemaUpdated={handleSchemaUpdated}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-muted-foreground"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Collections
                </Button>
              </SchemaManagementDialog>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="operation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Operation</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="findOne">Find One</SelectItem>
                <SelectItem value="findMany">Find Many</SelectItem>
                <SelectItem value="updateOne">Update One</SelectItem>
                <SelectItem value="updateMany">Update Many</SelectItem>
                <SelectItem value="insertOne">Insert One</SelectItem>
                <SelectItem value="insertMany">Insert Many</SelectItem>
                <SelectItem value="deleteOne">Delete One</SelectItem>
                <SelectItem value="deleteMany">Delete Many</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      {/* Show collection schema info */}
      {selectedCollection && currentCollectionParams.length > 0 && (
        <div className="p-3 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">
            Available Fields in {selectedCollection}:
          </h4>
          <div className="flex flex-wrap gap-2">
            {currentCollectionParams.map((param) => (
              <div key={param.name} className="flex items-center gap-1">
                <Badge variant="outline">{param.name}</Badge>
                <Badge variant="secondary" className="text-xs">
                  {param.type}
                </Badge>
                {param.required && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Query Fields Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <FormLabel>Query Fields</FormLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addField("query")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Query Field
          </Button>
        </div>
        {queryFields.map((field, index) => (
          <div key={index} className="flex gap-2">
            {renderFieldInput("query", index, field)}
            {renderValueInput("query", index, field)}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeField("query", index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Data Fields Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <FormLabel>Data Fields</FormLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addField("data")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Data Field
          </Button>
        </div>
        {dataFields.map((field, index) => (
          <div key={index} className="flex gap-2">
            {renderFieldInput("data", index, field)}
            {renderValueInput("data", index, field)}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeField("data", index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <InfoCircledIcon className="h-4 w-4" />
        <span>
          Type <code className="px-1 py-0.5 bg-muted rounded">{"{{"}</code> to
          insert dynamic node values
        </span>
      </div>
    </div>
  );
}
